import {
  slugifySeries,
  type ContentDoc,
  type ContentMetadata,
} from "@next-md-blog/core";
import { blog } from "@/next-md-blog.config";
import { fmString } from "@/lib/frontmatter";
import { siteConfig } from "@/site.config";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";

export interface ResolvedSeries {
  slug: string;
  title: string;
  posts: ContentMetadata[];
  /** Position of the current post in the series (0-based), or -1 if absent. */
  index: number;
  prev: ContentMetadata | null;
  next: ContentMetadata | null;
}

/**
 * Resolve the topic-cluster series a post belongs to (from `series`
 * frontmatter), with its sibling posts and prev/next neighbours. Returns `null`
 * when the post declares no series.
 */
export async function resolveSeries(
  post: ContentDoc,
  locale: string,
): Promise<ResolvedSeries | null> {
  const raw = fmString(post.frontmatter, "series");
  if (!raw) return null;
  const slug = slugifySeries(raw);
  const posts = await blog.getBySeries(slug, { locale });
  const index = posts.findIndex((p) => p.slug === post.slug);
  return {
    slug,
    title: fmString(post.frontmatter, "seriesTitle") ?? raw,
    posts,
    index,
    prev: index > 0 ? posts[index - 1] : null,
    next: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null,
  };
}

/**
 * Hreflang map for a series pillar (`/topics/<series>`): only the locales that
 * have posts in the series (the page 404s elsewhere); x-default → the default
 * locale when present, else the first available one.
 */
export async function seriesHreflang(series: string): Promise<Record<string, string>> {
  const languages: Record<string, string> = {};
  for (const locale of LOCALES) {
    const posts = await blog.getBySeries(series, { locale });
    if (posts.length) languages[locale] = `${siteConfig.url}/${locale}/topics/${series}`;
  }
  const xDefault = languages[DEFAULT_LOCALE] ?? Object.values(languages)[0];
  if (xDefault) languages["x-default"] = xDefault;
  return languages;
}
