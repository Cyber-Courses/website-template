import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { PostCard } from "@/components/post-card";
import { blog } from "@/next-md-blog.config";
import { siteConfig } from "@/site.config";
import { LOCALES, hreflangFor, type Locale } from "@/lib/i18n";
import { getDictionary, hasLocale } from "./dictionaries";

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
    title: dict.metadata.homeTitle,
    description: dict.metadata.homeDescription,
    alternates: {
      canonical: `${siteConfig.url}/${lang}`,
      languages: hreflangFor(siteConfig.url, "/"),
    },
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();
  const locale = lang;
  const dict = await getDictionary(locale);
  const posts = await blog.getAll({ locale });
  const featured = posts.slice(0, 3);
  return (
    <main id="main-content">
      <section className="relative isolate overflow-hidden border-b">
        <div aria-hidden className="absolute inset-0 -z-10 bg-grid opacity-60" />
        <div aria-hidden className="absolute inset-0 -z-10 bg-glow" />
        <div className="container mx-auto flex flex-col items-center px-4 py-24 text-center md:py-32">
          <Badge
            variant="outline"
            className="h-auto min-h-7 max-w-full gap-2 bg-background/60 px-3 py-1 whitespace-normal backdrop-blur"
          >
            <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden />
            {dict.home.eyebrow}
          </Badge>
          <h1 className="mt-6 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl md:text-6xl">
            {dict.home.heading}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-muted-foreground text-pretty">
            {dict.home.subheading}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href={`/${locale}/blog`} className={buttonVariants({ size: "lg" })}>
              {dict.home.readBlog}
              <ArrowRight data-icon="inline-end" />
            </Link>
            <Link
              href={`/${locale}/contact`}
              className={buttonVariants({ size: "lg", variant: "outline" })}
            >
              {dict.nav.contact}
            </Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container mx-auto px-4 py-20">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
              {dict.metadata.blogTitle}
            </h2>
            <Link
              href={`/${locale}/blog`}
              className="inline-flex items-center gap-1 text-sm font-medium text-link hover:underline underline-offset-4"
            >
              {dict.home.readBlog}
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PostCard key={p.slug} post={p} locale={locale} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
