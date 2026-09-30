import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { siteConfig } from "@/site.config";
import type { Locale } from "@/lib/i18n";

type Dict = {
  metadata: { homeDescription: string };
  nav: { blog: string; search: string; contact: string };
  authors: { title: string };
  footer: { rights: string; sitemap: string; rss: string };
};

const linkClass = "text-muted-foreground transition-colors hover:text-foreground";

export function SiteFooter({ locale, dict }: { locale: Locale; dict: Dict }) {
  const year = new Date().getFullYear();
  const links = [
    { href: `/${locale}/blog`, label: dict.nav.blog },
    { href: `/${locale}/authors`, label: dict.authors.title },
    { href: `/${locale}/search`, label: dict.nav.search },
    { href: `/${locale}/contact`, label: dict.nav.contact },
    { href: `/${locale}/sitemap`, label: dict.footer.sitemap },
    { href: `/${locale}/feed.xml`, label: dict.footer.rss },
  ];
  return (
    <footer className="mt-24 border-t bg-surface">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm space-y-3">
            <Logo />
            <p className="text-sm text-muted-foreground">{dict.metadata.homeDescription}</p>
          </div>
          <nav
            className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:grid-cols-3"
            aria-label="Footer"
          >
            {links.map((l) => (
              <Link key={l.href} href={l.href} className={linkClass}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-10 flex flex-col gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {siteConfig.name}. {dict.footer.rights}
          </p>
          <div className="flex gap-6">
            <Link href={`/${locale}/privacy`} className={linkClass}>
              Privacy
            </Link>
            <Link href={`/${locale}/terms`} className={linkClass}>
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
