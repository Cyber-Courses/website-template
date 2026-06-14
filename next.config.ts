import type { NextConfig } from "next";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import bundleAnalyzer from "@next/bundle-analyzer";

// Dev-only bundle inspection: `ANALYZE=true npm run build` opens treemaps.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/**
 * Content-Security-Policy. Pragmatic for a template: `'unsafe-inline'` is kept
 * for scripts/styles because Next injects inline bootstrap without a nonce
 * (tighten with nonce-based CSP via middleware if you need it). `frame-src`
 * lists the oEmbed iframe providers from `lib/oembed/providers.ts` — keep the
 * two in sync. `connect-src`/`script-src` cover the optional analytics
 * providers; trim to the one you actually use.
 */
const csp = {
  "default-src": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  "frame-ancestors": ["'self'"],
  "form-action": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'",
    "https://va.vercel-scripts.com",
    "https://plausible.io",
    "https://*.umami.is",
    "https://www.googletagmanager.com",
  ],
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "font-src": ["'self'", "data:"],
  "media-src": ["'self'", "https:"],
  "manifest-src": ["'self'"],
  "worker-src": ["'self'", "blob:"],
  "connect-src": [
    "'self'",
    "https://*.vercel-insights.com",
    "https://plausible.io",
    "https://*.umami.is",
    "https://www.google-analytics.com",
  ],
  "frame-src": [
    "https://www.youtube.com",
    "https://www.youtube-nocookie.com",
    "https://player.vimeo.com",
    "https://open.spotify.com",
    "https://w.soundcloud.com",
    "https://codepen.io",
    "https://geo.dailymotion.com",
    "https://www.dailymotion.com",
  ],
  "upgrade-insecure-requests": [],
};

const cspValue = Object.entries(csp)
  .map(([directive, sources]) =>
    sources.length ? `${directive} ${sources.join(" ")}` : directive,
  )
  .join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspValue },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

type RedirectEntry = {
  source: string;
  destination: string;
  permanent: boolean;
};

async function loadRedirects(): Promise<RedirectEntry[]> {
  try {
    const raw = await readFile(
      join(process.cwd(), "redirects.json"),
      "utf-8",
    );
    const data = JSON.parse(raw) as Array<Record<string, unknown>>;
    return data
      .filter(
        (r) =>
          typeof r.source === "string" &&
          typeof r.destination === "string" &&
          // Skip example/scaffolding entries by convention.
          r.source !== "/old-post-slug",
      )
      .map((r) => ({
        source: r.source as string,
        destination: r.destination as string,
        permanent: r.permanent !== false,
      }));
  } catch {
    return [];
  }
}

const nextConfig: NextConfig = {
  // Don't advertise the framework/version (info-leak hygiene).
  poweredByHeader: false,
  // Trim per-page JS by tree-shaking heavy libs at import time.
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@base-ui/react",
      "@next-md-blog/core",
      "react-markdown",
    ],
  },
  // Partial Pre-Rendering (PPR) is now gated behind Next 16's unified
  // `cacheComponents` flag, which flips every data fetch to dynamic-by-default
  // unless wrapped in `use cache`. For a fully-static content site like this
  // template the migration cost outweighs the win, so we leave it off. To opt
  // in: set `cacheComponents: true`, mark every page-level loader with
  // `use cache`, replace `export const revalidate = N` with `cacheLife()`,
  // and ensure every `generateStaticParams` returns ≥1 entry.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  async redirects() {
    return loadRedirects();
  },
};

export default withBundleAnalyzer(nextConfig);
