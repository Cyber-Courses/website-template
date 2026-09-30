import { slugifyAuthor } from "@next-md-blog/core";
import type { RichAuthor } from "@/components/seo/person-jsonld";
import { blog } from "@/next-md-blog.config";
import { siteConfig } from "@/site.config";
import { LOCALES, type Locale } from "@/lib/i18n";

export type SiteAuthor = RichAuthor & { slug: string };

/** Authors declared in `site.config.ts`, with their URL slug. */
function configuredAuthors(): SiteAuthor[] {
  return (siteConfig.authors ?? []).map((a) => ({ ...a, slug: slugifyAuthor(a.name) }));
}

export function resolveAuthorBySlug(slug: string): SiteAuthor | null {
  return configuredAuthors().find((a) => a.slug === slug) ?? null;
}

export function resolveAuthorByName(name: string | undefined): SiteAuthor | null {
  return name ? resolveAuthorBySlug(slugifyAuthor(name)) : null;
}

/**
 * Authors that get a profile page: declared in site.config AND credited on at
 * least one post (that's what `authors/[slug]` statically generates).
 */
export async function getPublishedAuthors(): Promise<SiteAuthor[]> {
  const slugs = new Set(await blog.getAllAuthorSlugs(LOCALES));
  return configuredAuthors().filter((a) => slugs.has(a.slug));
}

export function authorHref(locale: Locale, slug: string) {
  return `/${locale}/authors/${slug}`;
}

const PROFILE_LABELS: [RegExp, string][] = [
  [/(^|\.)linkedin\.com$/, "LinkedIn"],
  [/(^|\.)github\.com$/, "GitHub"],
  [/(^|\.)(x|twitter)\.com$/, "X"],
  [/(^|\.)bsky\.app$/, "Bluesky"],
  [/(^|\.)youtube\.com$/, "YouTube"],
];

/** Outbound profile links (website, handles, `sameAs`), labelled and de-duped. */
export function authorLinks(author: RichAuthor, labels: { website: string }) {
  const urls = [
    author.url,
    author.twitter && `https://x.com/${author.twitter.replace(/^@/, "")}`,
    author.github && `https://github.com/${author.github.replace(/^@/, "")}`,
    ...(author.sameAs ?? []),
  ].filter((u): u is string => Boolean(u));
  const seen = new Set<string>();
  const links: { label: string; href: string }[] = [];
  for (const href of urls) {
    let host: string;
    try {
      host = new URL(href).hostname;
    } catch {
      continue;
    }
    const label =
      href === author.url
        ? labels.website
        : (PROFILE_LABELS.find(([re]) => re.test(host))?.[1] ?? host);
    const key = `${label}:${href.replace(/\/$/, "")}`;
    if (seen.has(key) || links.some((l) => l.label === label && label !== host)) continue;
    seen.add(key);
    links.push({ label, href });
  }
  return links;
}
