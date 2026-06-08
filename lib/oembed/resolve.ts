import { collections } from "@/next-md-blog.config";
import { siteConfig } from "@/site.config";
import { isLocale } from "@/lib/i18n";
import type { OEmbedResponse } from "./types";

/**
 * Build the oEmbed discovery endpoint URL for one of our own pages.
 * Used both by `<link rel="alternate" type="application/json+oembed">` tags and
 * by the /oembed route itself.
 */
export function oembedEndpoint(
  pageUrl: string,
  format: "json" | "xml" = "json",
): string {
  const u = new URL("/oembed", siteConfig.url);
  u.searchParams.set("url", pageUrl);
  if (format !== "json") u.searchParams.set("format", format);
  return u.toString();
}

/**
 * `alternates.types` entries advertising oEmbed discovery for `pageUrl`. Merge
 * into a page's Metadata so Next emits the standard
 * `<link rel="alternate" type="application/json+oembed" …>` tags.
 */
export function oembedDiscoveryTypes(
  pageUrl: string,
): Record<string, string> | undefined {
  if (!siteConfig.oembed.provide) return undefined;
  return {
    "application/json+oembed": oembedEndpoint(pageUrl, "json"),
    "text/xml+oembed": oembedEndpoint(pageUrl, "xml"),
  };
}

function absolute(src: string): string {
  return /^https?:\/\//i.test(src) ? src : `${siteConfig.url}${src}`;
}

function authorName(authors: (string | { name: string })[]): string | undefined {
  const first = authors[0];
  if (!first) return undefined;
  return typeof first === "string" ? first : first.name;
}

function authorUrl(authors: (string | { name: string; url?: string })[]): string | undefined {
  const first = authors[0];
  return typeof first === "object" ? first.url : undefined;
}

/**
 * Resolve a page URL on this site to an oEmbed `link` payload, or `null` if the
 * URL doesn't map to a known document. Matches `/{lang}/{segment}/{slug}`
 * against every configured collection.
 */
export async function resolveOEmbed(
  rawUrl: string,
): Promise<OEmbedResponse | null> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return null;
  }

  const site = new URL(siteConfig.url);
  if (parsed.host !== site.host) return null;

  const segments = parsed.pathname.split("/").filter(Boolean);
  // Expect [lang, segment, slug]
  if (segments.length < 3) return null;
  const [lang, segment, ...rest] = segments;
  if (!isLocale(lang)) return null;
  const slug = rest.join("/");

  const collection = collections.find((c) => c.config.pathSegment === segment);
  if (!collection) return null;

  const doc = await collection.getOne(slug, { locale: lang });
  if (!doc) return null;

  const fm = doc.frontmatter;
  const image =
    (typeof fm.ogImage === "string" && fm.ogImage) ||
    (typeof fm.image === "string" && fm.image) ||
    null;

  return {
    type: "link",
    version: "1.0",
    title: fm.title ?? slug,
    author_name: authorName(doc.authors),
    author_url: authorUrl(doc.authors),
    provider_name: siteConfig.name,
    provider_url: siteConfig.url,
    cache_age: 86400,
    ...(image ? { thumbnail_url: absolute(image) } : {}),
  };
}
