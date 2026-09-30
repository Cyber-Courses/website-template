import type { MetadataRoute } from "next";
import { composeSitemap } from "@next-md-blog/core";
import { blog, glossary } from "@/next-md-blog.config";
import { siteConfig } from "@/site.config";
import { LOCALES, DEFAULT_LOCALE, hreflangFor } from "@/lib/i18n";
import { toAbsoluteUrl } from "@/lib/url";
import { resolveHeroImage } from "@/lib/frontmatter";
import { getPublishedAuthors } from "@/lib/authors";

/*
 * Google caps a single sitemap at 50,000 URLs / 50 MB. When you grow past
 * that, switch to sharded sitemaps via `generateSitemaps()` returning N
 * shard ids; Next will emit /sitemap.xml as an index that references
 * /sitemap/<id>.xml.
 */

/*
 * Indexable static routes only. /search and /sitemap (the HTML sitemap) are
 * `noindex, follow`, and a noindex URL in the XML sitemap is a contradictory
 * signal (Search Console flags it), so they stay out.
 */
const STATIC_PATHS = ["", "/blog", "/glossary", "/authors"];

function staticEntry(
  path: string,
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly",
  priority = 0.7,
): MetadataRoute.Sitemap[number] {
  const url = `${siteConfig.url}/${DEFAULT_LOCALE}${path === "" ? "" : path}`;
  return {
    url,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: hreflangFor(siteConfig.url, path === "" ? "/" : path),
    },
  };
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
  const authorPaths = (await getPublishedAuthors()).map((a) => `/authors/${a.slug}`);
  const staticEntries = [
    ...STATIC_PATHS.map((p) =>
      staticEntry(p, p === "" ? "daily" : "weekly", p === "" ? 1 : 0.7),
    ),
    ...authorPaths.map((p) => staticEntry(p, "monthly", 0.5)),
  ];
  const [entries, imageMap] = await Promise.all([
    composeSitemap({
      collections: [blog, glossary],
      locales: LOCALES,
      staticEntries,
    }),
    buildImageMap(),
  ]);
  return entries.map((entry) => {
    const image = imageMap.get(entry.url);
    return image ? { ...entry, images: [image] } : entry;
  });
}
