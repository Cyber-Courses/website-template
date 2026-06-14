import { siteConfig } from "@/site.config";
import { toAbsoluteUrl } from "@/lib/url";
import type { Locale } from "@/lib/i18n";

/** A breadcrumb. `href` is a site-relative path; omit it for the current page. */
export type Crumb = { name: string; href?: string };

/** Home crumb — present on every page's trail. */
export function homeCrumb(locale: Locale, dict: { nav: { home: string } }): Crumb {
  return { name: dict.nav.home, href: `/${locale}` };
}

/** Blog-index crumb. */
export function blogCrumb(
  locale: Locale,
  dict: { metadata: { blogTitle: string } },
): Crumb {
  return { name: dict.metadata.blogTitle, href: `/${locale}/blog` };
}

/**
 * Convert a nav breadcrumb trail to Schema.org `BreadcrumbList` items (absolute
 * URLs). One source for both the visual `<Breadcrumbs>` and the JSON-LD avoids
 * the two drifting apart.
 */
export function toJsonLdBreadcrumbs(
  crumbs: Crumb[],
): { name: string; url: string }[] {
  return crumbs.map((c) => ({
    name: c.name,
    url: c.href ? toAbsoluteUrl(c.href) : siteConfig.url,
  }));
}
