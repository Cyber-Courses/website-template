import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "./locale-switcher";
import { MobileNav } from "./mobile-nav";
import { ThemeToggle } from "./theme-toggle";
import type { Locale } from "@/lib/i18n";

type Dict = {
  nav: { home: string; blog: string; search: string; contact: string; menu: string };
  toggleTheme: string;
};

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dict }) {
  const links = [
    { href: `/${locale}/blog`, label: dict.nav.blog },
    { href: `/${locale}/search`, label: dict.nav.search },
  ];
  const contact = { href: `/${locale}/contact`, label: dict.nav.contact };
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-lg supports-backdrop-filter:bg-background/70">
      <div className="container mx-auto flex h-16 items-center justify-between gap-4 px-4">
        <div className="flex min-w-0 items-center gap-8">
          <Link
            href={`/${locale}`}
            aria-label={dict.nav.home}
            className="flex min-w-0 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <Logo />
          </Link>
          <nav className="hidden items-center gap-1 text-sm md:flex" aria-label="Primary">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <LocaleSwitcher current={locale} />
          <ThemeToggle label={dict.toggleTheme} />
          <Link
            href={contact.href}
            className={cn(buttonVariants({ size: "sm" }), "ml-2 hidden md:inline-flex")}
          >
            {contact.label}
          </Link>
          <MobileNav links={[...links, contact]} label={dict.nav.menu} />
        </div>
      </div>
    </header>
  );
}
