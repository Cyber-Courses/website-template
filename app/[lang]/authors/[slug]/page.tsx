import type { Metadata } from "next";
import { pageTitle } from "@/lib/metadata";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { AuthorAvatar } from "@/components/author-avatar";
import { PostCard } from "@/components/post-card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { authorHref, authorLinks, resolveAuthorBySlug } from "@/lib/authors";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { homeCrumb } from "@/lib/breadcrumbs";
import { toCollectionItems } from "@/lib/collection";
import { PersonJsonLd } from "@/components/seo/person-jsonld";
import { CollectionJsonLd } from "@/components/seo/collection-jsonld";
import { blog } from "@/next-md-blog.config";
import { siteConfig } from "@/site.config";
import { LOCALES, hreflangFor } from "@/lib/i18n";
import { getDictionary, hasLocale } from "../../dictionaries";

type Params = { lang: string; slug: string };

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await blog.getAllAuthorSlugs(LOCALES);
  const out: Params[] = [];
  for (const lang of LOCALES) {
    for (const slug of slugs) out.push({ lang, slug });
  }
  return out;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) return {};
  const author = resolveAuthorBySlug(slug);
  if (!author) return { title: "Author not found" };
  const url = `${siteConfig.url}/${lang}/authors/${slug}`;
  return {
    metadataBase: new URL(siteConfig.url),
    title: pageTitle(author.name),
    description: author.bio ?? `Posts by ${author.name}.`,
    alternates: {
      canonical: url,
      languages: hreflangFor(siteConfig.url, `/authors/${slug}`),
    },
    openGraph: {
      type: "profile",
      url,
      title: author.name,
      ...(author.bio ? { description: author.bio } : {}),
    },
  };
}

export default async function AuthorPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang, slug } = await params;
  if (!hasLocale(lang)) notFound();
  const locale = lang;
  const dict = await getDictionary(locale);
  const author = resolveAuthorBySlug(slug);
  if (!author) notFound();
  const posts = await blog.getByAuthor(slug, { locale });
  const url = `${siteConfig.url}${authorHref(locale, slug)}`;
  const links = authorLinks(author, { website: dict.authors.website });

  return (
    <>
      <PersonJsonLd author={author} url={url} inLanguage={locale} />
      <CollectionJsonLd
        url={url}
        name={`${author.name} — ${dict.metadata.blogTitle}`}
        items={toCollectionItems(posts, blog, locale)}
        inLanguage={locale}
      />
      <main id="main-content" className="container mx-auto px-4 py-12">
        <Breadcrumbs
          items={[
            homeCrumb(locale, dict),
            { name: dict.authors.title, href: `/${locale}/authors` },
            { name: author.name },
          ]}
        />
        <header className="mt-8 flex flex-col gap-6 border-b pb-10 sm:flex-row sm:items-start">
          <AuthorAvatar name={author.name} src={author.avatar} size={96} />
          <div className="min-w-0 flex-1 space-y-4">
            <div className="space-y-1">
              <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
                {author.name}
              </h1>
              {author.jobTitle && (
                <p className="text-lg text-muted-foreground">{author.jobTitle}</p>
              )}
            </div>
            {author.bio && <p className="max-w-2xl text-pretty">{author.bio}</p>}
            {author.knowsAbout && author.knowsAbout.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="mr-1 text-sm text-muted-foreground">{dict.authors.expertise}</span>
                {author.knowsAbout.map((k) => (
                  <Badge key={k} variant="secondary">
                    {k}
                  </Badge>
                ))}
              </div>
            )}
            {links.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {links.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    rel="me noopener"
                    target="_blank"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    {l.label}
                    <ArrowUpRight data-icon="inline-end" aria-hidden />
                  </a>
                ))}
              </div>
            )}
          </div>
        </header>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">{dict.authors.latestArticles}</h2>
          {posts.length === 0 ? (
            <p className="mt-6 text-muted-foreground">{dict.blog.noPosts}</p>
          ) : (
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <PostCard key={p.slug} post={p} locale={locale} />
              ))}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
