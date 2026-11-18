import type { Metadata } from "next";
import { clampDescription, pageTitle, socialMetadata } from "@/lib/metadata";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { homeCrumb, blogCrumb } from "@/lib/breadcrumbs";
import { toCollectionItems } from "@/lib/collection";
import { CollectionJsonLd } from "@/components/seo/collection-jsonld";
import { blog } from "@/next-md-blog.config";
import { siteConfig } from "@/site.config";
import { LOCALES, type Locale } from "@/lib/i18n";
import { getDictionary, hasLocale } from "../../../dictionaries";

type Params = { lang: string; tag: string };

export const dynamicParams = false;

export async function generateStaticParams() {
  const out: Params[] = [];
  for (const lang of LOCALES) {
    const posts = await blog.getAll({ locale: lang });
    const tags = new Set<string>();
    for (const p of posts)
      for (const t of (p.frontmatter.tags as string[] | undefined) ?? [])
        tags.add(t.toLowerCase());
    for (const tag of tags) out.push({ lang, tag });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, tag } = await params;
  if (!hasLocale(lang)) return {};
  const locale = lang;
  const dict = await getDictionary(locale);
  const decoded = decodeURIComponent(tag);
  const url = `${siteConfig.url}/${lang}/blog/tags/${tag}`;
  const title = `${dict.tag.title} "${decoded}"`;
  const description = clampDescription(
    `${dict.tag.title} ${decoded}. ${dict.metadata.blogDescription}`,
  );
  return {
    title: pageTitle(title),
    description,
    alternates: { canonical: url },
    ...socialMetadata({ lang: locale, url, title, description }),
    // Tag archives are thin, near-duplicate listings of posts that already
    // have their own URLs (and topic pillars cover real clusters). Keep them
    // crawlable for link discovery but out of the index — and therefore out
    // of the XML sitemap. Drop this if you curate tags into real hub pages.
    robots: { index: false, follow: true },
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang, tag } = await params;
  if (!hasLocale(lang)) notFound();
  const locale = lang;
  const dict = await getDictionary(locale);
  const decoded = decodeURIComponent(tag).toLowerCase();
  const posts = await blog.getAll({ locale });
  const filtered = posts.filter((p) =>
    ((p.frontmatter.tags as string[] | undefined) ?? [])
      .map((t) => t.toLowerCase())
      .includes(decoded),
  );
  if (filtered.length === 0) notFound();
  const url = `${siteConfig.url}/${locale}/blog/tags/${tag}`;
  return (
    <>
      <CollectionJsonLd
        url={url}
        name={`${dict.tag.title}: #${decoded}`}
        inLanguage={locale}
        items={toCollectionItems(filtered, blog, locale)}
      />
      <main id="main-content" className="container mx-auto px-4 py-12">
      <Breadcrumbs
        items={[
          homeCrumb(locale, dict),
          blogCrumb(locale, dict),
          { name: `#${decoded}` },
        ]}
      />
      <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
        {dict.tag.title}: <span className="text-muted-foreground">#{decoded}</span>
      </h1>
      <div className="mt-3">
        <Link href={`/${locale}/blog`} className="text-sm underline">
          ← {dict.tag.back}
        </Link>
      </div>
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <PostCard key={p.slug} post={p} locale={locale} />
        ))}
      </section>
      </main>
    </>
  );
}
