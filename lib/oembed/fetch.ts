import { cache } from "react";
import { matchProvider, type EmbedStrategy } from "./providers";
import type { OEmbedResponse } from "./types";
import { siteConfig } from "@/site.config";

export interface ResolvedEmbed {
  data: OEmbedResponse;
  strategy: EmbedStrategy;
}

const TIMEOUT_MS = 5000;
const REVALIDATE_SECONDS = 60 * 60 * 24; // 1 day

async function fetchJson(endpoint: string): Promise<OEmbedResponse | null> {
  try {
    const res = await fetch(endpoint, {
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      // Build-time fetch; cache the JSON so repeated renders don't re-hit the API.
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as OEmbedResponse;
    if (!data || typeof data !== "object" || !data.type) return null;
    return data;
  } catch {
    return null;
  }
}

/**
 * Best-effort oEmbed discovery for hosts not in the registry: fetch the HTML
 * and parse `<link rel="alternate" type="application/json+oembed" href="…">`.
 * Always rendered as a `card` since we can't vouch for the embed html.
 */
async function discover(url: string): Promise<OEmbedResponse | null> {
  try {
    const res = await fetch(url, {
      headers: { accept: "text/html" },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(
      /<link[^>]+type=["']application\/json\+oembed["'][^>]*>/i,
    );
    if (!match) return null;
    const href = match[0].match(/href=["']([^"']+)["']/i)?.[1];
    if (!href) return null;
    const endpoint = href.replace(/&amp;/g, "&");
    return await fetchJson(endpoint);
  } catch {
    return null;
  }
}

function buildEndpoint(base: string, url: string, needsFormat?: boolean): string {
  const u = new URL(base);
  u.searchParams.set("url", url);
  u.searchParams.set("maxwidth", String(siteConfig.oembed.maxWidth));
  if (needsFormat) u.searchParams.set("format", "json");
  return u.toString();
}

/**
 * Resolve a URL to an oEmbed payload + render strategy, or `null` when the URL
 * isn't embeddable (caller then falls back to a plain link). Cached per-render.
 */
export const resolveEmbed = cache(
  async (url: string): Promise<ResolvedEmbed | null> => {
    if (!siteConfig.oembed.enabled) return null;

    const provider = matchProvider(url);
    if (provider) {
      const data = await fetchJson(
        buildEndpoint(provider.endpoint, url, provider.needsFormat),
      );
      return data ? { data, strategy: provider.strategy } : null;
    }

    if (siteConfig.oembed.discovery) {
      const data = await discover(url);
      return data ? { data, strategy: "card" } : null;
    }

    return null;
  },
);
