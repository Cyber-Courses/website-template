import {
  slugifySeries,
  type ContentDoc,
  type ContentMetadata,
} from "@next-md-blog/core";
import { blog } from "@/next-md-blog.config";
import { fmString } from "@/lib/frontmatter";

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
