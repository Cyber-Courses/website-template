/**
 * SEO audit — crawls the sitemap of a running site and asserts the invariants
 * that silently break rankings:
 *
 *   1. Every page has exactly one <link rel="canonical">, pointing at itself.
 *   2. Every JSON-LD block parses and declares @context + @type, and FAQPage /
 *      HowTo markup describes text that is visible on the page.
 *   3. hreflang is reciprocal — if A points to B as an alternate, B points back.
 *   4. Sitemap URLs are indexable: no noindex, a single robots meta tag.
 *   5. On-page basics: one <title>, a meta description, exactly one <h1>,
 *      og:image present and og:url matching the canonical.
 *   6. Every indexable internal page linked from an audited page is in the
 *      sitemap (orphaned from the sitemap = slower discovery).
 *
 * Warnings (reported, never fail the run): titles over 60 chars, descriptions
 * outside 50–160 chars, titles/descriptions duplicated across pages.
 *
 * Usage:
 *   tsx scripts/seo-audit.ts [baseUrl]      # default http://localhost:3000
 *
 * Exit code 1 on any error. Run it locally against a built server:
 *   npm run build && npm start   # then, in another terminal:
 *   npm run seo:audit
 */
const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const MAX_PAGES = Number(process.env.SEO_AUDIT_MAX_PAGES ?? 60);

type Finding = { url: string; rule: string; message: string };
const errors: Finding[] = [];
const warnings: Finding[] = [];

/** Decode the handful of entities React/Next emit in attributes and text. */
function decodeEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Page text a user can see: drop scripts/styles/tags, collapse whitespace. */
function visibleText(html: string): string {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " "),
  )
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Content of `<meta name|property="key" content="…">`. */
function metaContent(html: string, key: string): string[] {
  return matchAll(html, /<meta\s[^>]*>/gi)
    .filter((tag) => {
      const name = attr(tag, "name") ?? attr(tag, "property");
      return name?.toLowerCase() === key;
    })
    .map((tag) => decodeEntities(attr(tag, "content") ?? ""));
}

const titles = new Map<string, string[]>();
const descriptions = new Map<string, string[]>();
const internalLinks = new Set<string>();

/** Rewrite any URL onto the base origin so audits work on localhost/CI. */
function onBase(rawUrl: string): string {
  try {
    const u = new URL(rawUrl);
    const b = new URL(BASE);
    u.protocol = b.protocol;
    u.host = b.host;
    return u.toString();
  } catch {
    return rawUrl;
  }
}

async function getText(url: string): Promise<string> {
  const res = await fetch(url, { headers: { accept: "text/html,application/xml" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

function matchAll(html: string, re: RegExp): string[] {
  return [...html.matchAll(re)].map((m) => m[1] ?? m[0]);
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`${name}=["']([^"']+)["']`, "i"))?.[1];
}

/**
 * Fail on unescaped XML entities (a raw `&` not part of `&amp;`/`&lt;`/… or a
 * numeric ref). This is the class of bug that breaks a sitemap with
 * "EntityRef: expecting ';'" — typically an image/loc URL with a `&` query
 * separator that wasn't entity-escaped.
 */
function checkXmlWellFormed(xml: string, source: string): void {
  const bad = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)/);
  if (bad) {
    const at = xml.slice(Math.max(0, bad.index! - 40), bad.index! + 40);
    errors.push({
      url: source,
      rule: "sitemap-xml",
      message: `unescaped '&' (invalid XML) near: …${at.replace(/\n/g, " ")}…`,
    });
  }
}

async function collectSitemapUrls(): Promise<string[]> {
  const xml = await getText(`${BASE}/sitemap.xml`);
  checkXmlWellFormed(xml, `${BASE}/sitemap.xml`);
  const locs = matchAll(xml, /<loc>([^<]+)<\/loc>/g).map(onBase);
  // Handle a sitemap index (locs pointing at more sitemaps).
  if (locs.some((l) => /sitemap.*\.xml$/i.test(l))) {
    const nested = await Promise.all(
      locs.map(async (l) => {
        const sub = await getText(l);
        checkXmlWellFormed(sub, l);
        return matchAll(sub, /<loc>([^<]+)<\/loc>/g).map(onBase);
      }),
    );
    return [...new Set(nested.flat())];
  }
  return [...new Set(locs)];
}

const hreflangCache = new Map<string, Record<string, string>>();

async function hreflangMapOf(url: string, html?: string): Promise<Record<string, string>> {
  if (hreflangCache.has(url)) return hreflangCache.get(url)!;
  const page = html ?? (await getText(url));
  const map: Record<string, string> = {};
  for (const tag of matchAll(page, /<link[^>]+rel=["']alternate["'][^>]*>/gi)) {
    const lang = attr(tag, "hreflang");
    const href = attr(tag, "href");
    if (lang && href) map[lang] = onBase(href);
  }
  hreflangCache.set(url, map);
  return map;
}

async function auditPage(url: string): Promise<void> {
  const html = await getText(url);

  // 1. Canonical: exactly one, self-referencing (a sitemap URL that
  //    canonicalises elsewhere is a contradictory signal).
  const canonicals = matchAll(html, /<link[^>]+rel=["']canonical["'][^>]*>/gi);
  if (canonicals.length !== 1) {
    errors.push({ url, rule: "canonical", message: `expected 1 canonical, found ${canonicals.length}` });
  }
  const canonical = canonicals[0] && attr(canonicals[0], "href");
  if (canonical && onBase(canonical) !== url) {
    errors.push({ url, rule: "canonical", message: `canonical points elsewhere: ${canonical}` });
  }

  // 4. Robots: sitemap URLs must be indexable, with one unambiguous tag.
  const robots = metaContent(html, "robots");
  if (robots.length > 1) {
    errors.push({ url, rule: "robots", message: `${robots.length} robots meta tags: ${robots.join(" / ")}` });
  }
  if (robots.some((r) => /noindex/i.test(r))) {
    errors.push({ url, rule: "robots", message: "noindex page listed in the sitemap" });
  }

  // 5. On-page basics.
  const titleTags = matchAll(html, /<title[^>]*>([\s\S]*?)<\/title>/gi).map((t) =>
    normalizeText(decodeEntities(t)),
  );
  if (titleTags.length !== 1 || !titleTags[0]) {
    errors.push({ url, rule: "title", message: `expected 1 non-empty <title>, found ${titleTags.length}` });
  } else {
    const title = titleTags[0];
    if (title.length > 60) {
      warnings.push({ url, rule: "title-length", message: `${title.length} chars (> 60): "${title}"` });
    }
    titles.set(title, [...(titles.get(title) ?? []), url]);
  }
  const description = metaContent(html, "description")[0];
  if (!description) {
    errors.push({ url, rule: "description", message: "missing meta description" });
  } else {
    if (description.length < 50 || description.length > 160) {
      warnings.push({
        url,
        rule: "description-length",
        message: `${description.length} chars (want 50–160)`,
      });
    }
    descriptions.set(description, [...(descriptions.get(description) ?? []), url]);
  }
  const h1s = matchAll(html, /<h1[\s>]/gi).length;
  if (h1s !== 1) {
    errors.push({ url, rule: "h1", message: `expected 1 <h1>, found ${h1s}` });
  }
  if (metaContent(html, "og:image").length === 0) {
    errors.push({ url, rule: "og", message: "missing og:image" });
  }
  const ogUrl = metaContent(html, "og:url")[0];
  if (canonical && ogUrl && onBase(ogUrl) !== onBase(canonical)) {
    errors.push({ url, rule: "og", message: `og:url ${ogUrl} ≠ canonical ${canonical}` });
  }

  // Collect same-origin, locale-prefixed page links for the orphan check.
  for (const tag of matchAll(html, /<a\s[^>]*href=["'][^"']+["'][^>]*>/gi)) {
    const href = attr(tag, "href");
    if (!href || !href.startsWith("/") || href.startsWith("//")) continue;
    const path = href.split(/[?#]/)[0].replace(/\/$/, "");
    if (/^\/[a-z]{2}(\/|$)/.test(path) && !/\.[a-z0-9]+$/i.test(path)) {
      internalLinks.add(`${BASE}${path}`);
    }
  }

  // 2. JSON-LD validity.
  const blocks = matchAll(
    html,
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  const visible = visibleText(html);
  for (const block of blocks) {
    try {
      const json = JSON.parse(block);
      const nodes = json["@graph"] ?? [json];
      for (const node of [nodes].flat()) {
        if (!node["@type"]) {
          errors.push({ url, rule: "jsonld", message: "JSON-LD node missing @type" });
        }
        // Google requires FAQPage / HowTo markup to match visible content.
        const mustBeVisible: string[] = [];
        if (node["@type"] === "FAQPage") {
          for (const q of node.mainEntity ?? []) if (q?.name) mustBeVisible.push(q.name);
        }
        if (node["@type"] === "HowTo") {
          for (const step of node.step ?? []) if (step?.text) mustBeVisible.push(step.text);
        }
        for (const text of mustBeVisible) {
          if (!visible.includes(normalizeText(text))) {
            errors.push({
              url,
              rule: "jsonld-visible",
              message: `${node["@type"]} text not visible on page: "${text.slice(0, 60)}"`,
            });
          }
        }
      }
    } catch {
      errors.push({ url, rule: "jsonld", message: "JSON-LD failed to parse" });
    }
  }

  // 3. hreflang reciprocity.
  const map = await hreflangMapOf(url, html);
  for (const [lang, target] of Object.entries(map)) {
    if (lang === "x-default" || target === url) continue;
    try {
      const back = await hreflangMapOf(target);
      const pointsBack = Object.values(back).some((v) => v === url);
      if (!pointsBack) {
        errors.push({
          url,
          rule: "hreflang-reciprocity",
          message: `alternate ${lang} → ${target} does not link back`,
        });
      }
    } catch (e) {
      errors.push({ url, rule: "hreflang-reciprocity", message: `could not fetch alternate ${target}: ${(e as Error).message}` });
    }
  }
}

async function main() {
  console.log(`SEO audit against ${BASE}`);
  const all = await collectSitemapUrls();
  const urls = all.slice(0, MAX_PAGES);
  if (all.length > urls.length) {
    console.log(`Auditing ${urls.length}/${all.length} URLs (SEO_AUDIT_MAX_PAGES=${MAX_PAGES}).`);
  } else {
    console.log(`Auditing ${urls.length} URLs.`);
  }

  for (const url of urls) {
    try {
      await auditPage(url);
    } catch (e) {
      errors.push({ url, rule: "fetch", message: (e as Error).message });
    }
  }

  // 6. Indexable internal pages missing from the sitemap. Only judged when
  //    the whole sitemap was audited (otherwise "missing" is meaningless).
  if (all.length === urls.length) {
    const inSitemap = new Set(all);
    for (const link of internalLinks) {
      if (inSitemap.has(link)) continue;
      try {
        const res = await fetch(link, { redirect: "manual" });
        if (res.status !== 200) continue;
        const robots = metaContent(await res.text(), "robots");
        if (!robots.some((r) => /noindex/i.test(r))) {
          errors.push({ url: link, rule: "sitemap-missing", message: "indexable page linked internally but not in the sitemap" });
        }
      } catch (e) {
        errors.push({ url: link, rule: "fetch", message: (e as Error).message });
      }
    }
  }

  for (const [map, rule] of [
    [titles, "duplicate-title"],
    [descriptions, "duplicate-description"],
  ] as const) {
    for (const [text, pages] of map) {
      // Pages that are hreflang alternates of each other are translations
      // (a term like "hreflang" or a name is legitimately identical).
      const translations = pages.every((a) =>
        pages.every((b) => a === b || Object.values(hreflangCache.get(a) ?? {}).includes(b)),
      );
      if (pages.length > 1 && !translations) {
        warnings.push({ url: pages.join(", "), rule, message: `"${text.slice(0, 80)}"` });
      }
    }
  }

  for (const w of warnings) console.warn(`  ! ${w.url}\n    [${w.rule}] ${w.message}`);
  if (errors.length === 0) {
    console.log(`✓ no SEO errors across ${urls.length} pages (${warnings.length} warning(s))`);
    process.exit(0);
  }
  for (const e of errors) console.error(`  ✗ ${e.url}\n    [${e.rule}] ${e.message}`);
  console.error(`\n${errors.length} issue(s) found.`);
  process.exit(1);
}

main();
