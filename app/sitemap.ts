import type { MetadataRoute } from "next";
import { composeSitemap } from "@next-md-blog/core";
import { blog, glossary } from "@/next-md-blog.config";
import { siteConfig } from "@/site.config";
import { LOCALES, DEFAULT_LOCALE, hreflangFor } from "@/lib/i18n";
import { toAbsoluteUrl } from "@/lib/url";
import { resolveHeroImage } from "@/lib/frontmatter";

/*
 * Google caps a single sitemap at 50,000 URLs / 50 MB. When you grow past
 * that, switch to sharded sitemaps via `generateSitemaps()` returning N
 * shard ids; Next will emit /sitemap.xml as an index that references
 * /sitemap/<id>.xml.
 */

const STATIC_PATHS = ["", "/blog", "/glossary", "/search", "/sitemap"];

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
          map.set(collection.url(doc.slug, locale), toAbsoluteUrl(image));
        }
      }
    }
  }
  return map;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = STATIC_PATHS.map((p) =>
    staticEntry(p, p === "" ? "daily" : "weekly", p === "" ? 1 : 0.7),
  );
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
