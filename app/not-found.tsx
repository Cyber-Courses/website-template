import Link from "next/link";
import type { Metadata } from "next";

import { siteConfig } from "@/site.config";
import {
  DEFAULT_LOCALE,
  LOCALES,
  localeNames,
  type Locale,
} from "@/lib/i18n";
import { fontVariables } from "@/lib/fonts";
import { LogoMark } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import "./globals.css";

/**
 * Fires for URLs that don't match any route in the entire app — including
 * paths outside the [lang] segment (so proxy.ts didn't redirect them
 * either). No root layout exists, so we own the <html>/<body> shell.
 *
 * Rendered in the default locale (we can't statically know the user's
 * intended language for an orphan path), with a locale switcher so the
 * user can land somewhere useful in their language.
 */

const COPY: Record<Locale, { heading: string; description: string; home: string }> =
  {
    en: {
      heading: "Page not found",
      description: "The page you’re looking for doesn’t exist on this site.",
      home: "Go to the homepage",
    },
    fr: {
      heading: "Page introuvable",
      description: "La page que vous cherchez n’existe pas sur ce site.",
      home: "Aller à l’accueil",
    },
    es: {
      heading: "Página no encontrada",
      description: "La página que buscas no existe en este sitio.",
      home: "Ir al inicio",
    },
    de: {
      heading: "Seite nicht gefunden",
      description: "Die gesuchte Seite existiert auf dieser Website nicht.",
      home: "Zur Startseite",
    },
  };

export const metadata: Metadata = {
  title: `${COPY[DEFAULT_LOCALE].heading} | ${siteConfig.name}`,
  robots: { index: false, follow: false },
};

export default function RootNotFound() {
  const t = COPY[DEFAULT_LOCALE];
  return (
    <html
      lang={DEFAULT_LOCALE}
      className={fontVariables}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
          <LogoMark className="size-10" />
          <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            404
          </p>
          <h1 className="text-4xl font-semibold tracking-tight md:text-5xl">
            {t.heading}
          </h1>
          <p className="max-w-prose text-muted-foreground">{t.description}</p>
          <Link href={`/${DEFAULT_LOCALE}`} className={buttonVariants({ size: "lg" })}>
            {t.home}
          </Link>
          <nav
            aria-label="Languages"
            className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground"
          >
            {LOCALES.map((loc) => (
              <Link
                key={loc}
                href={`/${loc}`}
                hrefLang={loc}
                className="hover:text-foreground hover:underline"
              >
                {localeNames[loc]}
              </Link>
            ))}
          </nav>
        </main>
      </body>
    </html>
  );
}
