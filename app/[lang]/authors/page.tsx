import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { AuthorAvatar } from "@/components/author-avatar";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CollectionJsonLd } from "@/components/seo/collection-jsonld";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { authorHref, getPublishedAuthors } from "@/lib/authors";
import { homeCrumb } from "@/lib/breadcrumbs";
import { LOCALES } from "@/lib/i18n";
import { staticPageMetadata } from "@/lib/metadata";
import { blog } from "@/next-md-blog.config";
import { siteConfig } from "@/site.config";
import { getDictionary, hasLocale } from "../dictionaries";

type Params = { lang: string };

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return staticPageMetadata({
    lang,
    path: "/authors",
    title: dict.authors.title,
    description: dict.authors.description,
  });
}

export default async function AuthorsIndex({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const locale = lang;
  const dict = await getDictionary(locale);
  const authors = await Promise.all(
    (await getPublishedAuthors()).map(async (a) => ({
      ...a,
      postCount: (await blog.getByAuthor(a.slug, { locale })).length,
    })),
  );
  const url = `${siteConfig.url}/${locale}/authors`;

  return (
    <>
      <CollectionJsonLd
        url={url}
        name={dict.authors.title}
        description={dict.authors.description}
        inLanguage={locale}
        items={authors.map((a) => ({
          name: a.name,
          url: `${siteConfig.url}${authorHref(locale, a.slug)}`,
        }))}
      />
      <main id="main-content" className="container mx-auto px-4 py-12">
        <Breadcrumbs items={[homeCrumb(locale, dict), { name: dict.authors.title }]} />
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">
          {dict.authors.title}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">{dict.authors.description}</p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {authors.map((a) => (
            <Card
              key={a.slug}
              className="group relative gap-4 p-6 transition-[box-shadow,transform] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-foreground/5 hover:ring-foreground/15"
            >
              <div className="flex items-center gap-4">
                <AuthorAvatar name={a.name} src={a.avatar} size={56} />
                <div className="min-w-0">
                  <h2 className="truncate text-lg font-semibold tracking-tight">
                    <Link
                      href={authorHref(locale, a.slug)}
                      className="outline-none after:absolute after:inset-0 after:rounded-xl focus-visible:after:ring-3 focus-visible:after:ring-ring/50"
                    >
                      {a.name}
                    </Link>
                  </h2>
                  {a.jobTitle && (
                    <p className="truncate text-sm text-muted-foreground">{a.jobTitle}</p>
                  )}
                </div>
              </div>
              {a.bio && <p className="line-clamp-3 text-sm text-muted-foreground">{a.bio}</p>}
              {a.knowsAbout && a.knowsAbout.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {a.knowsAbout.slice(0, 4).map((k) => (
                    <Badge key={k} variant="secondary">
                      {k}
                    </Badge>
                  ))}
                </div>
              )}
              <div className="mt-auto flex items-center justify-between border-t pt-4 text-sm">
                <span className="text-muted-foreground">
                  {a.postCount} {a.postCount === 1 ? dict.authors.article : dict.authors.articles}
                </span>
                <span className="inline-flex items-center gap-1 font-medium text-link">
                  {dict.authors.viewProfile}
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </span>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </>
  );
}
