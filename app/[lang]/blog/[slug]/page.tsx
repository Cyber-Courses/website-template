import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cache } from "react";
import rehypeSlug from "rehype-slug";
import { MarkdownContent, authorNamesFromFrontmatter } from "@next-md-blog/core";

import { blog } from "@/next-md-blog.config";
import { collectVideoObjects } from "@/lib/oembed/video-schema";
import { buildDocumentMetadata } from "@/lib/metadata";
import { normalizeSchemaDates } from "@/lib/schema-dates";
import { relatedPosts } from "@/lib/related-posts";
import { resolveSeries } from "@/lib/series";
import {
  fmString,
  fmStringArray,
  fmTitle,
  resolveHeroImage,
} from "@/lib/frontmatter";
import { homeCrumb, blogCrumb, toJsonLdBreadcrumbs } from "@/lib/breadcrumbs";
import { LOCALES, type Locale } from "@/lib/i18n";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { SeriesNav } from "@/components/series-nav";
import { TableOfContents } from "@/components/table-of-contents";
import { ReadingProgress } from "@/components/reading-progress";
import { PostCard } from "@/components/post-card";
import { JsonLd } from "@/components/seo/json-ld";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { markdownComponents } from "@/components/markdown/components";
import { extractHeadings } from "@/lib/toc";
import { getImageDims } from "@/lib/image-dims";
import { getDictionary, hasLocale } from "../../dictionaries";

type Params = { lang: string; slug: string };

const fetchPost = cache((locale: Locale, slug: string) =>
  blog.getOne(slug, { locale }),
);

const fetchAll = cache((locale: Locale) => blog.getAll({ locale }));

// generateStaticParams enumerates every post; anything else 404s (no soft-404s
// or arbitrary-URL rendering for crawlers/scrapers).
export const dynamicParams = false;

export async function generateStaticParams() {
  const all: { lang: string; slug: string }[] = [];
  for (const lang of LOCALES) {
    const posts = await blog.getAll({ locale: lang });
    for (const p of posts) all.push({ lang, slug: p.slug });
  }
  return all;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const locale = lang as Locale;
  const post = await fetchPost(locale, slug);
  if (!post) return { title: "Not found" };
  const dict = await getDictionary(locale);

  return buildDocumentMetadata({
    collection: blog,
    doc: post,
    slug,
    locale,
    twitter: {
      author: authorNamesFromFrontmatter(post.frontmatter)[0],
      readingTime: post.readingTime,
      labels: {
        writtenBy: dict.blog.writtenBy,
        estReadingTime: dict.blog.estReadingTime,
        readingUnit: dict.blog.readingTime,
      },
    },
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const locale = lang as Locale;
  const dict = await getDictionary(locale);
  const post = await fetchPost(locale, slug);
  if (!post) notFound();

  const fm = post.frontmatter;
  const title = fmTitle(post);
  const description = fmString(fm, "description");
  const date = fmString(fm, "date");
  const updated = fmString(fm, "updated");
  const tags = fmStringArray(fm, "tags");
  const headings = extractHeadings(post.content);

  const related = relatedPosts(post, await fetchAll(locale));
  const series = await resolveSeries(post, locale);

  // One breadcrumb source for the JSON-LD trail (home → blog → post).
  const jsonLd = normalizeSchemaDates(
    blog.schemaGraph(
      post,
      toJsonLdBreadcrumbs([
        homeCrumb(locale, dict),
        blogCrumb(locale, dict),
        { name: title, href: `/${locale}/blog/${slug}` },
      ]),
      { locale, speakable: true },
    ),
  );

  const heroImage = resolveHeroImage(fm);
  // Real dimensions for the hero so it reserves space (CLS = 0).
  const heroDims = heroImage ? await getImageDims(heroImage) : null;

  // VideoObject JSON-LD for any bare-URL video embeds in the body.
  const videoObjects = normalizeSchemaDates(
    await collectVideoObjects(post.content, {
      datePublished: date,
      fallbackDescription: description,
    }),
  );

  return (
    <>
      <ReadingProgress />
      <JsonLd data={jsonLd} />
      {videoObjects.map((v, i) => (
        <JsonLd key={i} data={v} />
      ))}
      <main id="main-content" className="container mx-auto px-4 py-10">
        <Breadcrumbs
          items={[
            homeCrumb(locale, dict),
            blogCrumb(locale, dict),
            ...(series
              ? [{ name: series.title, href: `/${locale}/topics/${series.slug}` }]
              : []),
            { name: title },
          ]}
        />

        {series && (
          <SeriesNav
            series={series}
            locale={locale}
            labels={{ previous: dict.blog.previous, next: dict.blog.next }}
          />
        )}

        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_240px]">
          <article>
            <header className="space-y-4 mb-8">
              <h1 className="text-3xl md:text-5xl font-semibold tracking-tight">
                {title}
              </h1>
              {description && (
                <p className="text-lg text-muted-foreground">{description}</p>
              )}
              <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-2 items-center">
                {date && (
                  <span>
                    {dict.blog.publishedOn}{" "}
                    <time dateTime={date}>
                      {new Date(date).toLocaleDateString(locale, {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  </span>
                )}
                {updated && updated !== date && (
                  <span>
                    {dict.blog.updatedOn}{" "}
                    <time dateTime={updated}>
                      {new Date(updated).toLocaleDateString(locale)}
                    </time>
                  </span>
                )}
                <span>
                  {post.readingTime} {dict.blog.readingTime}
                </span>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary">
                      <Link href={`/${locale}/blog/tags/${encodeURIComponent(t.toLowerCase())}`}>
                        {t}
                      </Link>
                    </Badge>
                  ))}
                </div>
              )}
            </header>
            {heroImage && heroDims && (
              // LCP element: prioritized (eager + fetchpriority=high + preload)
              // so it isn't lazy-loaded. Real dims keep CLS at 0.
              <Image
                src={heroImage}
                alt={fmString(fm, "title") ?? ""}
                width={heroDims.width}
                height={heroDims.height}
                priority
                // Next 16's `priority` emits the preload but not fetchpriority
                // on the <img> — set it explicitly so the LCP element is hinted.
                fetchPriority="high"
                sizes="(min-width: 1024px) 768px, 100vw"
                className="rounded-lg w-full h-auto mb-8"
              />
            )}
            <Separator className="mb-8" />
            <div className="prose dark:prose-invert max-w-none prose-headings:scroll-mt-20">
              <MarkdownContent
                content={post.content}
                components={markdownComponents}
                rehypePlugins={[rehypeSlug]}
              />
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-6">
              <TableOfContents items={headings} title={dict.blog.tableOfContents} />
            </div>
          </aside>
        </div>

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-semibold mb-6">{dict.blog.relatedArticles}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <PostCard key={r.slug} post={r} locale={locale} />
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  );
}
