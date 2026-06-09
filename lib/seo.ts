import type { Metadata } from "next";
import { siteConfig } from "@/site.config";
import { LOCALES, type Locale } from "@/lib/i18n";

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
