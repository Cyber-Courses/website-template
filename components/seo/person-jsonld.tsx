import { JsonLd } from "./json-ld";
import type { Author } from "@next-md-blog/core";

/** Author + optional E-E-A-T fields not present on the core `Author` type. */
export type RichAuthor = Author & {
  jobTitle?: string;
  knowsAbout?: readonly string[];
  sameAs?: readonly string[];
};

export function PersonJsonLd({
  author,
  url,
  inLanguage,
}: {
  author: RichAuthor;
  url: string;
  inLanguage?: string;
}) {
  // Merge explicit profiles with the ones derivable from handles, de-duped.
  const sameAs = [
    ...(author.sameAs ?? []),
    author.twitter && `https://twitter.com/${author.twitter.replace(/^@/, "")}`,
    author.github && `https://github.com/${author.github.replace(/^@/, "")}`,
    author.url,
  ].filter(
    (s, i, arr): s is string =>
      typeof s === "string" && s.length > 0 && arr.indexOf(s) === i,
  );

  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${url}#person`,
    name: author.name,
    url,
    description: author.bio,
    image: author.avatar,
    email: author.email,
    jobTitle: author.jobTitle,
    knowsAbout: author.knowsAbout?.length ? author.knowsAbout : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    inLanguage,
  };
  return <JsonLd data={data} />;
}
