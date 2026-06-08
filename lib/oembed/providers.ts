/**
 * Curated oEmbed provider registry.
 *
 * A small, dependency-free subset of https://oembed.com/providers.json covering
 * the providers a content site embeds most. Two render strategies:
 *
 *  - `iframe`  — the provider's `html` is a self-contained <iframe> that works
 *                with no extra JavaScript. We render it directly.
 *  - `card`    — the provider's `html` relies on an external widget script
 *                (Twitter/X, Instagram, TikTok). We ignore the html and render a
 *                link card from the oEmbed metadata instead, so nothing breaks
 *                in a statically-rendered page.
 *
 * Unknown hosts fall back to best-effort `<link rel="alternate">` discovery in
 * `fetch.ts`, which is always treated as a `card`.
 */
export type EmbedStrategy = "iframe" | "card";

export interface OEmbedProvider {
  name: string;
  /** oEmbed JSON endpoint. */
  endpoint: string;
  /** URL patterns this provider claims. */
  schemes: RegExp[];
  strategy: EmbedStrategy;
  /** Some endpoints reject requests without an explicit `format=json`. */
  needsFormat?: boolean;
}

export const PROVIDERS: OEmbedProvider[] = [
  {
    name: "YouTube",
    endpoint: "https://www.youtube.com/oembed",
    schemes: [
      /^https?:\/\/(www\.)?youtube\.com\/watch\?/i,
      /^https?:\/\/(www\.)?youtube\.com\/shorts\//i,
      /^https?:\/\/youtu\.be\//i,
    ],
    strategy: "iframe",
  },
  {
    name: "Vimeo",
    endpoint: "https://vimeo.com/api/oembed.json",
    schemes: [/^https?:\/\/(www\.)?vimeo\.com\/\d+/i],
    strategy: "iframe",
  },
  {
    name: "Spotify",
    endpoint: "https://open.spotify.com/oembed",
    schemes: [/^https?:\/\/open\.spotify\.com\//i],
    strategy: "iframe",
  },
  {
    name: "SoundCloud",
    endpoint: "https://soundcloud.com/oembed",
    schemes: [/^https?:\/\/(www\.)?soundcloud\.com\//i],
    strategy: "iframe",
    needsFormat: true,
  },
  {
    name: "CodePen",
    endpoint: "https://codepen.io/api/oembed",
    schemes: [/^https?:\/\/codepen\.io\/[^/]+\/pen\//i],
    strategy: "iframe",
    needsFormat: true,
  },
  {
    name: "Dailymotion",
    endpoint: "https://www.dailymotion.com/services/oembed",
    schemes: [/^https?:\/\/(www\.)?dailymotion\.com\/video\//i, /^https?:\/\/dai\.ly\//i],
    strategy: "iframe",
  },
  {
    name: "X",
    endpoint: "https://publish.twitter.com/oembed",
    schemes: [
      /^https?:\/\/(www\.)?twitter\.com\/\w+\/status\/\d+/i,
      /^https?:\/\/(www\.)?x\.com\/\w+\/status\/\d+/i,
    ],
    strategy: "card",
  },
  {
    name: "Instagram",
    endpoint: "https://api.instagram.com/oembed",
    schemes: [/^https?:\/\/(www\.)?instagram\.com\/(p|reel|tv)\//i],
    strategy: "card",
  },
  {
    name: "TikTok",
    endpoint: "https://www.tiktok.com/oembed",
    schemes: [/^https?:\/\/(www\.)?tiktok\.com\/@[^/]+\/video\/\d+/i],
    strategy: "card",
  },
];

/** Returns the provider whose schemes match `url`, or `null`. */
export function matchProvider(url: string): OEmbedProvider | null {
  for (const provider of PROVIDERS) {
    if (provider.schemes.some((re) => re.test(url))) return provider;
  }
  return null;
}
