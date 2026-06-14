import type { BlogPostFrontmatter } from "@next-md-blog/core";

/**
 * Typed, defensive accessors for markdown frontmatter.
 *
 * The core `frontmatter` type is loosely typed (`[key: string]: unknown`), so
 * reading fields otherwise scatters `as string` casts and `typeof` guards
 * across every page. These helpers centralize that, returning sensible defaults
 * and removing the casts at call sites.
 */
type Frontmatter = BlogPostFrontmatter;

type DocLike = { slug: string; frontmatter: Frontmatter };

/** A non-empty string field, or `undefined`. */
export function fmString(fm: Frontmatter, key: string): string | undefined {
  const value = fm[key];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

/** A string-array field (e.g. `tags`), filtered to strings; `[]` when absent. */
export function fmStringArray(fm: Frontmatter, key: string): string[] {
  const value = fm[key];
  return Array.isArray(value)
    ? value.filter((v): v is string => typeof v === "string")
    : [];
}

/** Display title for a document — frontmatter `title`, falling back to slug. */
export function fmTitle(doc: DocLike): string {
  return fmString(doc.frontmatter, "title") ?? doc.slug;
}

/** Hero / social image — `ogImage`, then `image`, else `null`. */
export function resolveHeroImage(fm: Frontmatter): string | null {
  return fmString(fm, "ogImage") ?? fmString(fm, "image") ?? null;
}
