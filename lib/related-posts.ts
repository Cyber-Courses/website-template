import type { ContentDoc, ContentMetadata } from "@next-md-blog/core";
import { fmStringArray } from "@/lib/frontmatter";

/** Count of tags shared between two tag lists (case-insensitive). */
function tagOverlap(a: string[], b: string[]): number {
  const set = new Set(a.map((t) => t.toLowerCase()));
  return b.reduce((n, t) => n + (set.has(t.toLowerCase()) ? 1 : 0), 0);
}

/**
 * Posts (excluding `post`) that share ≥1 tag with it, ranked by overlap and
 * capped at `limit`.
 */
export function relatedPosts(
  post: ContentDoc,
  all: ContentMetadata[],
  limit = 3,
): ContentMetadata[] {
  const tags = fmStringArray(post.frontmatter, "tags");
  return all
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({
      post: p,
      score: tagOverlap(tags, fmStringArray(p.frontmatter, "tags")),
    }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.post);
}
