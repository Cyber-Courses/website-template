import type { Metadata } from "next";
import type { Collection, ContentDoc } from "@next-md-blog/core";
import { siteConfig } from "@/site.config";
import { LOCALES, DEFAULT_LOCALE, hreflangFor, type Locale } from "@/lib/i18n";
import { toIsoDateTime } from "@/lib/schema-dates";
import { oembedDiscoveryTypes } from "@/lib/oembed/resolve";

/** Google truncates SERP titles around 60 characters. */
export const MAX_TITLE_LENGTH = 60;

/**
 * Render a page title with the ` | Site Name` suffix only when the result
 * still fits in {@link MAX_TITLE_LENGTH}; otherwise return the bare title so
 * the primary keyword isn't pushed past the SERP cut-off.
 */
export function fitTitle(title: string, siteName: string = siteConfig.name): string {
  const suffixed = `${title} | ${siteName}`;
  return suffixed.length <= MAX_TITLE_LENGTH ? suffixed : title;
}

/**
 * `Metadata["title"]` for a page under the `[lang]` layout: an absolute title
 * (bypassing the layout's `%s | Site` template) built with {@link fitTitle}.
 */
export function pageTitle(title: string): { absolute: string } {
  return { absolute: fitTitle(title) };
}

/**
 * Clamp a meta description to Google's ~160-char snippet width, cutting at a
 * word boundary and adding an ellipsis when it has to shorten.
 */
export function clampDescription(text: string, max = 160): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > max * 0.6 ? cut.slice(0, space) : cut).replace(/[\s,;:.–—-]+$/, "")}…`;
}

type Robots = NonNullable<Metadata["robots"]>;
type AlternateTypes = NonNullable<NonNullable<Metadata["alternates"]>["types"]>;

/**
 * Yoast emits these snippet directives on every indexable page, on top of
 * `index, follow`. They let Google show large image previews and uncapped
 * text/video snippets in the SERP. We mirror them at the top level (the
 * `<meta name="robots">` tag, matching Yoast) and on googleBot.
 */
const PREVIEW = {
  "max-image-preview": "large",
  "max-snippet": -1,
  "max-video-preview": -1,
} as const;

/**
 * Build a robots object with Yoast-style preview directives, honouring a
 * document's `noindex` / `nofollow` frontmatter. A custom `robots` frontmatter
 * string is respected verbatim (the author opted out of our defaults).
 */
export function previewRobots(fm?: {
  noindex?: boolean;
  nofollow?: boolean;
  robots?: string;
}): Robots {
  if (fm?.robots) return fm.robots;
  const index = !fm?.noindex;
  const follow = !fm?.nofollow;
  return {
    index,
    follow,
    ...PREVIEW,
    googleBot: { index, follow, ...PREVIEW },
  };
}

/**
 * RSS autodiscovery `<link>` set — current locale first, then the rest. WP/Yoast
 * advertise the feed on every page; we keep parity (and add it back on pages
 * whose `alternates` would otherwise drop the layout-level entry).
 */
export function feedDiscoveryTypes(lang: Locale): AlternateTypes {
  return {
    "application/rss+xml": [
      { url: `/${lang}/feed.xml`, title: `${siteConfig.name} — ${lang}` },
      ...LOCALES.filter((l) => l !== lang).map((l) => ({
        url: `/${l}/feed.xml`,
        title: `${siteConfig.name} — ${l}`,
      })),
    ],
  };
}

/**
 * Yoast's `twitter:label1/data1` + `label2/data2` pairs (author + estimated
 * reading time). Returned as an `other` metadata record since Next has no
 * first-class slot for them.
 */
export function articleTwitterLabels(opts: {
  author?: string;
  readingTime?: number;
  labels: { writtenBy: string; estReadingTime: string; readingUnit: string };
}): Record<string, string> {
  const out: Record<string, string> = {};
  if (opts.author) {
    out["twitter:label1"] = opts.labels.writtenBy;
    out["twitter:data1"] = opts.author;
  }
  if (typeof opts.readingTime === "number") {
    out["twitter:label2"] = opts.labels.estReadingTime;
    out["twitter:data2"] = `${opts.readingTime} ${opts.labels.readingUnit}`;
  }
  return out;
}

/**
 * Metadata for a simple static page (privacy, terms, contact, …): canonical +
 * hreflang + a website-type OG block. `path` is the locale-less route (e.g.
 * `/privacy`).
 */
export function staticPageMetadata(opts: {
  lang: Locale;
  path: string;
  title: string;
  description: string;
}): Metadata {
  const url = `${siteConfig.url}/${opts.lang}${opts.path}`;
  return {
    metadataBase: new URL(siteConfig.url),
    title: pageTitle(opts.title),
    description: clampDescription(opts.description),
    alternates: {
      canonical: url,
      languages: hreflangFor(siteConfig.url, opts.path),
    },
    openGraph: { type: "website", url, title: opts.title },
  };
}

/**
 * Build the full per-document Metadata for a collection page (blog post,
 * glossary term, …): hreflang + x-default, the collection's base metadata,
 * timezone-corrected OG times, preview robots, and feed + oEmbed autodiscovery.
 * Pass `twitter` to add the author / reading-time `twitter:label` pairs.
 */
export async function buildDocumentMetadata(opts: {
  collection: Collection;
  doc: ContentDoc;
  slug: string;
  locale: Locale;
  twitter?: Parameters<typeof articleTwitterLabels>[0];
}): Promise<Metadata> {
  const { collection, doc, slug, locale, twitter } = opts;

  // Hreflang: only locales that have a translation; x-default → en, else self.
  const languages = await collection.hreflangMap(slug, LOCALES);
  const url = collection.url(slug, locale);
  languages["x-default"] = languages[DEFAULT_LOCALE] ?? url;

  const meta = await collection.metadata(doc, {
    locale,
    titleTemplate: "bare",
    alternateLanguages: languages,
  });
  // Suffix with the site name only when it still fits in ~60 chars.
  meta.title = { absolute: fitTitle(String(meta.title)) };

  // Give OG article times a timezone (Google flags bare dates).
  const og = meta.openGraph as
    | { publishedTime?: string; modifiedTime?: string }
    | undefined;
  if (og?.publishedTime) og.publishedTime = toIsoDateTime(og.publishedTime);
  if (og?.modifiedTime) og.modifiedTime = toIsoDateTime(og.modifiedTime);

  meta.robots = previewRobots(doc.frontmatter);
  meta.alternates = {
    ...meta.alternates,
    types: { ...feedDiscoveryTypes(locale), ...oembedDiscoveryTypes(url) },
  };
  if (twitter) {
    meta.other = { ...meta.other, ...articleTwitterLabels(twitter) };
  }

  return { metadataBase: new URL(siteConfig.url), ...meta };
}
