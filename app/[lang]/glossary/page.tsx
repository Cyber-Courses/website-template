import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { CollectionJsonLd } from "@/components/seo/collection-jsonld";
import { glossary } from "@/next-md-blog.config";
import { siteConfig } from "@/site.config";
import { LOCALES, hreflangFor, type Locale } from "@/lib/i18n";
import { toCollectionItems } from "@/lib/collection";
import { homeCrumb } from "@/lib/breadcrumbs";
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
  return {
    metadataBase: new URL(siteConfig.url),
    title: dict.glossary.title,
    description: dict.glossary.intro,
    alternates: {
      canonical: `${siteConfig.url}/${lang}/glossary`,
      languages: hreflangFor(siteConfig.url, "/glossary"),
    },
  };
}

export default async function GlossaryIndex({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const locale = lang;
  const dict = await getDictionary(locale);
  const terms = await glossary.getAll({ locale });
  const url = `${siteConfig.url}/${lang}/glossary`;

  return (
    <>
      <CollectionJsonLd
        url={url}
        name={dict.glossary.title}
        description={dict.glossary.intro}
        inLanguage={locale}
        items={toCollectionItems(terms, glossary, locale)}
      />
      <main id="main-content" className="container mx-auto px-4 py-12 max-w-3xl">
        <Breadcrumbs
          items={[homeCrumb(locale, dict), { name: dict.glossary.title }]}
        />
        <h1 className="mt-4 text-3xl md:text-4xl font-semibold tracking-tight">
          {dict.glossary.title}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {dict.glossary.intro}
        </p>
        <dl className="mt-10 space-y-6">
          {terms.map((term) => (
            <div key={term.slug} className="border-b pb-6 last:border-b-0">
              <dt className="text-lg font-semibold">
                <Link
                  href={`/${locale}/glossary/${term.slug}`}
                  className="hover:underline"
                >
                  {(term.frontmatter.title as string) ?? term.slug}
                </Link>
              </dt>
              {term.frontmatter.description && (
                <dd className="mt-1 text-muted-foreground">
                  {term.frontmatter.description as string}
                </dd>
              )}
            </div>
          ))}
        </dl>
      </main>
    </>
  );
}
