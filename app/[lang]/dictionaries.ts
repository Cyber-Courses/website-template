import "server-only";
import { type Locale } from "@/lib/i18n";

// Single source of truth lives in lib/i18n; re-exported here for the pages that
// already import locale helpers from this module.
export { hasLocale } from "@/lib/i18n";

export type Dictionary = {
  metadata: {
    homeTitle: string;
    homeDescription: string;
    blogTitle: string;
    blogDescription: string;
    searchTitle: string;
    searchDescription: string;
    sitemapTitle: string;
    sitemapDescription: string;
  };
  nav: {
    home: string;
    blog: string;
    search: string;
    contact: string;
    menu: string;
  };
  glossary: { title: string; intro: string };
  authors: {
    title: string;
    description: string;
    latestArticles: string;
    article: string;
    articles: string;
    expertise: string;
    website: string;
    viewProfile: string;
  };
  toggleTheme: string;
  footer: { rights: string; sitemap: string; rss: string };
  blog: {
    tableOfContents: string;
    relatedArticles: string;
    readMore: string;
    readingTime: string;
    publishedOn: string;
    updatedOn: string;
    byAuthor: string;
    writtenBy: string;
    estReadingTime: string;
    tags: string;
    share: string;
    noPosts: string;
    previous: string;
    next: string;
    page: string;
  };
  tag: { title: string; back: string };
  search: { placeholder: string; noResults: string };
  notFound: { title: string; cta: string };
  home: {
    heading: string;
    subheading: string;
    readBlog: string;
    eyebrow: string;
  };
};

const loaders: Record<Locale, () => Promise<Dictionary>> = {
  en: () =>
    import("./dictionaries/en.json").then((m) => m.default as Dictionary),
  fr: () =>
    import("./dictionaries/fr.json").then((m) => m.default as Dictionary),
  es: () =>
    import("./dictionaries/es.json").then((m) => m.default as Dictionary),
  de: () =>
    import("./dictionaries/de.json").then((m) => m.default as Dictionary),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return loaders[locale]();
}
