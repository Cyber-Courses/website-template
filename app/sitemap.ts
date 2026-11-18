import type { MetadataRoute } from "next";
import type { ContentMetadata } from "@next-md-blog/core";
import { composeSitemap } from "@next-md-blog/core";
import { blog, glossary } from "@/next-md-blog.config";
import { siteConfig } from "@/site.config";
import { LOCALES, DEFAULT_LOCALE, hreflangFor } from "@/lib/i18n";
import { toAbsoluteUrl } from "@/lib/url";
import { resolveHeroImage } from "@/lib/frontmatter";
import { getPublishedAuthors } from "@/lib/authors";
import { seriesHreflang } from "@/lib/series";

/*
 * Google caps a single sitemap at 50,000 URLs / 50 MB. When you grow past
 * that, switch to sharded sitemaps via `generateSitemaps()` returning N
 * shard ids; Next will emit /sitemap.xml as an index that references
 * /sitemap/<id>.xml.
 */

type Entry = MetadataRoute.Sitemap[number];

/**
 * Newest `updated` / `date` across some docs. Used as `<lastmod>` for listing
 * pages so it only moves when their content does — a lastmod that changes on
 * every build teaches Google to ignore it site-wide.
 */
function newestDate(docs: ContentMetadata[]): Date | undefined {
  let newest: number | undefined;
  for (const d of docs) {
    for (const key of ["date", "updated"] as const) {
      const raw = d.frontmatter[key];
      if (typeof raw !== "string") continue;
      const t = new Date(raw).getTime();
      if (!Number.isNaN(t) && (newest === undefined || t > newest)) newest = t;
    }
  }
  return newest === undefined ? undefined : new Date(newest);
}

/** Collect every locale's docs of a collection once. */
async function allDocs(
  collection: typeof blog | typeof glossary,
): Promise<ContentMetadata[]> {
  const perLocale = await Promise.all(
    LOCALES.map((locale) => collection.getAll({ locale })),
  );
  return perLocale.flat();
}

/*
 * Indexable static routes only. /search, /sitemap (HTML), /blog/page/N and
 * /blog/tags/* are `noindex, follow`, and a noindex URL in the XML sitemap is
 * a contradictory signal (Search Console flags it), so they stay out.
 */
function staticEntry(
  path: string,
  opts: {
    changeFrequency: Entry["changeFrequency"];
    priority: number;
    lastModified?: Date;
  },
): Entry {
  return {
    url: `${siteConfig.url}/${DEFAULT_LOCALE}${path}`,
    ...(opts.lastModified ? { lastModified: opts.lastModified } : {}),
    changeFrequency: opts.changeFrequency,
    priority: opts.priority,
    alternates: { languages: hreflangFor(siteConfig.url, path || "/") },
  };
}

/**
 * Topic-cluster pillar pages (`/topics/<series>`), with hreflang limited to
 * the locales that actually have posts in each series.
 */
async function topicEntries(): Promise<Entry[]> {
  const slugs = await blog.getAllSeriesSlugs(LOCALES);
  const out: Entry[] = [];
  for (const slug of slugs) {
    const languages = await seriesHreflang(slug);
    const primary = languages["x-default"];
    if (!primary) continue;
    const posts = (
      await Promise.all(LOCALES.map((locale) => blog.getBySeries(slug, { locale })))
    ).flat();
    const lastModified = newestDate(posts);
    out.push({
      url: primary,
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: "weekly",
      priority: 0.7,
      alternates: { languages },
    });
  }
  return out;
}

/**
 * Google wants every language version listed as its own `<url>` (each with
 * the full set of `xhtml:link` alternates, itself included). Collection and
 * static entries arrive as one entry per page group keyed on the default
 * locale; fan each out to one entry per locale URL.
 */
function expandLocales(entries: Entry[]): Entry[] {
  const out: Entry[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    const languages = entry.alternates?.languages ?? {};
    const urls = Object.entries(languages)
      .filter(([lang]) => lang !== "x-default")
      .map(([, url]) => url as string);
    for (const url of urls.length ? urls : [entry.url]) {
      if (seen.has(url)) continue;
      seen.add(url);
      out.push({ ...entry, url });
    }
  }
  return out;
}

/**
 * Entity-escape a URL for inclusion in sitemap XML (sitemaps.org requires it).
 * Next does NOT escape `<image:loc>` values, so an image URL with a query
 * string (`?w=1600&q=80`) would otherwise emit a raw `&` and produce invalid
 * XML ("EntityRef: expecting ';'").
 */
function escapeXmlUrl(url: string): string {
  return url
    .replace(/&/g, "&amp;")
    .replace(/'/g, "&apos;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Map each post/term URL to its hero/OG image so the sitemap can carry
 * `<image:image>` entries (Google Images discovery). Built once across locales.
 */
async function buildImageMap(): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  for (const collection of [blog, glossary]) {
    for (const locale of LOCALES) {
      const docs = await collection.getAll({ locale });
      for (const doc of docs) {
        const image = resolveHeroImage(doc.frontmatter);
        if (image) {
          map.set(
            collection.url(doc.slug, locale),
            escapeXmlUrl(toAbsoluteUrl(image)),
          );
        }
      }
    }
  }
  return map;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, terms, authors, topics] = await Promise.all([
    allDocs(blog),
    allDocs(glossary),
    getPublishedAuthors(),
    topicEntries(),
  ]);
  const lastPost = newestDate(posts);
  const lastTerm = newestDate(terms);
  const lastAny = [lastPost, lastTerm]
    .filter((d): d is Date => !!d)
    .sort((a, b) => b.getTime() - a.getTime())[0];

  const staticEntries: Entry[] = [
    staticEntry("", { changeFrequency: "daily", priority: 1, lastModified: lastAny }),
    staticEntry("/blog", { changeFrequency: "weekly", priority: 0.7, lastModified: lastPost }),
    staticEntry("/glossary", { changeFrequency: "weekly", priority: 0.7, lastModified: lastTerm }),
    staticEntry("/authors", { changeFrequency: "monthly", priority: 0.5 }),
    ...authors.map((a) =>
      staticEntry(`/authors/${a.slug}`, { changeFrequency: "monthly", priority: 0.5 }),
    ),
    ...topics,
    // Trust pages: indexable and linked from every footer, so list them.
    ...["/contact", "/privacy", "/terms"].map((p) =>
      staticEntry(p, { changeFrequency: "yearly", priority: 0.3 }),
    ),
  ];

  const [entries, imageMap] = await Promise.all([
    composeSitemap({
      collections: [blog, glossary],
      locales: LOCALES,
      staticEntries,
    }),
    buildImageMap(),
  ]);
  return expandLocales(entries).map((entry) => {
    const image = imageMap.get(entry.url);
    return image ? { ...entry, images: [image] } : entry;
  });
}
