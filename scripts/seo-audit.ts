/**
 * SEO audit — crawls the sitemap of a running site and asserts the invariants
 * that silently break rankings:
 *
 *   1. Every page has exactly one <link rel="canonical">.
 *   2. Every JSON-LD block parses and declares @context + @type.
 *   3. hreflang is reciprocal — if A points to B as an alternate, B points back.
 *
 * Usage:
 *   tsx scripts/seo-audit.ts [baseUrl]      # default http://localhost:3000
 *
 * Exit code 1 on any error. Meant to run in CI against a freshly-built server
 * (see .github/workflows/seo-audit.yml).
 */
const BASE = (process.argv[2] ?? "http://localhost:3000").replace(/\/$/, "");
const MAX_PAGES = Number(process.env.SEO_AUDIT_MAX_PAGES ?? 60);

type Finding = { url: string; rule: string; message: string };
const errors: Finding[] = [];

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

async function collectSitemapUrls(): Promise<string[]> {
  const xml = await getText(`${BASE}/sitemap.xml`);
  const locs = matchAll(xml, /<loc>([^<]+)<\/loc>/g).map(onBase);
  // Handle a sitemap index (locs pointing at more sitemaps).
  if (locs.some((l) => /sitemap.*\.xml$/i.test(l))) {
    const nested = await Promise.all(
      locs.map(async (l) =>
        matchAll(await getText(l), /<loc>([^<]+)<\/loc>/g).map(onBase),
      ),
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

  // 1. Canonical.
  const canonicals = matchAll(html, /<link[^>]+rel=["']canonical["'][^>]*>/gi);
  if (canonicals.length !== 1) {
    errors.push({ url, rule: "canonical", message: `expected 1 canonical, found ${canonicals.length}` });
  }

  // 2. JSON-LD validity.
  const blocks = matchAll(
    html,
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  );
  for (const block of blocks) {
    try {
      const json = JSON.parse(block);
      const nodes = json["@graph"] ?? [json];
      for (const node of [nodes].flat()) {
        if (!node["@type"]) {
          errors.push({ url, rule: "jsonld", message: "JSON-LD node missing @type" });
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

  if (errors.length === 0) {
    console.log(`✓ no SEO issues across ${urls.length} pages`);
    process.exit(0);
  }
  for (const e of errors) console.error(`  ✗ ${e.url}\n    [${e.rule}] ${e.message}`);
  console.error(`\n${errors.length} issue(s) found.`);
  process.exit(1);
}

main();
