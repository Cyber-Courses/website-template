"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { DEFAULT_LOCALE, isLocale, type Locale } from "@/lib/i18n";
import { buttonVariants } from "@/components/ui/button";

/**
 * Wrapped by app/[lang]/layout.tsx, so it gets <html lang>, the site
 * header/footer, theme, and the locale switcher for free. We only need
 * the page body. Client component so we can read the locale from
 * useParams() without opting the rest of the layout into dynamic
 * rendering.
 */

type Copy = {
  eyebrow: string;
  heading: string;
  description: string;
  home: string;
  blog: string;
  search: string;
};

const COPY: Record<Locale, Copy> = {
  en: {
    eyebrow: "404",
    heading: "Page not found",
    description:
      "The link you followed may be broken, or the page may have moved. Try the blog index or search instead.",
    home: "Home",
    blog: "Browse the blog",
    search: "Search",
  },
  fr: {
    eyebrow: "404",
    heading: "Page introuvable",
    description:
      "Le lien suivi est peut-être cassé, ou la page a été déplacée. Essayez l’index du blog ou la recherche.",
    home: "Accueil",
    blog: "Voir le blog",
    search: "Rechercher",
  },
  es: {
    eyebrow: "404",
    heading: "Página no encontrada",
    description:
      "El enlace que seguiste puede estar roto, o la página se movió. Prueba el índice del blog o la búsqueda.",
    home: "Inicio",
    blog: "Ver el blog",
    search: "Buscar",
  },
  de: {
    eyebrow: "404",
    heading: "Seite nicht gefunden",
    description:
      "Der Link ist möglicherweise defekt oder die Seite wurde verschoben. Probiere den Blog-Index oder die Suche.",
    home: "Start",
    blog: "Zum Blog",
    search: "Suche",
  },
};

export default function NotFound() {
  const params = useParams<{ lang?: string }>();
  const lang = params?.lang;
  const locale: Locale = lang && isLocale(lang) ? lang : DEFAULT_LOCALE;
  const t = COPY[locale];

  return (
    <main
      id="main-content"
      className="container mx-auto flex flex-col items-center gap-6 px-4 py-24 text-center"
    >
      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
        {t.eyebrow}
      </p>
      <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
        {t.heading}
      </h1>
      <p className="max-w-prose text-muted-foreground">{t.description}</p>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
        <Link href={`/${locale}`} className={buttonVariants()}>
          {t.home}
        </Link>
        <Link
          href={`/${locale}/blog`}
          className={buttonVariants({ variant: "outline" })}
        >
          {t.blog}
        </Link>
        <Link
          href={`/${locale}/search`}
          className={buttonVariants({ variant: "ghost" })}
        >
          {t.search}
        </Link>
      </div>
    </main>
  );
}
