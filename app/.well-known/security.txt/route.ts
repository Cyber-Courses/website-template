import { siteConfig } from "@/site.config";

/**
 * security.txt (RFC 9116) — tells researchers where to report vulnerabilities.
 * Served at /.well-known/security.txt. `Expires` is required by the spec and is
 * set one year out on each request.
 */
export const dynamic = "force-dynamic";

export function GET() {
  const contact = siteConfig.organization.contactPoint.email;
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString();
  const langs = siteConfig.organization.contactPoint.availableLanguage;

  const lines = [
    `Contact: mailto:${contact}`,
    `Expires: ${expires}`,
    `Canonical: ${siteConfig.url}/.well-known/security.txt`,
    Array.isArray(langs) && langs.length
      ? `Preferred-Languages: ${langs.join(", ")}`
      : null,
  ].filter(Boolean);

  return new Response(lines.join("\n") + "\n", {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
