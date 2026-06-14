import type { Collection, ContentMetadata } from "@next-md-blog/core";
import { fmTitle } from "@/lib/frontmatter";

/**
 * Map documents to `{ name, url }` items for `CollectionJsonLd` (and similar
 * listing schemas), using each doc's title and the collection's canonical URL.
 */
export function toCollectionItems(
  docs: ContentMetadata[],
  collection: Collection,
  locale: string,
): { name: string; url: string }[] {
  return docs.map((doc) => ({
    name: fmTitle(doc),
    url: collection.url(doc.slug, locale),
  }));
}
