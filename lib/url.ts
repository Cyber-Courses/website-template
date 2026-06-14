import { siteConfig } from "@/site.config";

/** True for absolute `http(s)://` URLs. */
export function isAbsoluteUrl(src: string): boolean {
  return /^https?:\/\//i.test(src);
}

/**
 * Resolve a possibly site-relative path to an absolute URL. Absolute inputs are
 * returned unchanged; relative ones are prefixed with `base` (the site origin).
 */
export function toAbsoluteUrl(src: string, base: string = siteConfig.url): string {
  return isAbsoluteUrl(src) ? src : `${base}${src}`;
}
