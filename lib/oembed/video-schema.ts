import { resolveEmbed } from "./fetch";

/**
 * Scan post content for bare-URL video embeds (YouTube, Vimeo, Dailymotion…)
 * and build Schema.org `VideoObject` nodes for them, so embedded videos qualify
 * for video rich results / the Video tab.
 *
 * oEmbed doesn't expose `uploadDate` or `description`, both of which Google
 * wants — we fall back to the post's publish date and description/title.
 * Reuses `resolveEmbed` (React-cached), so it shares results with the render
 * pass that produces the actual embeds — no duplicate fetches.
 */
const BARE_URL_LINE = /^https?:\/\/\S+$/;

function extractEmbedUrl(html?: string): string | undefined {
  if (!html) return undefined;
  const src = html.match(/<iframe[^>]*\ssrc=["']([^"']+)["']/i)?.[1];
  return src ? src.replace(/&amp;/g, "&") : undefined;
}

function bareUrls(content: string): string[] {
  const seen = new Set<string>();
  let inFence = false;
  for (const raw of content.split(/\r?\n/)) {
    const line = raw.trim();
    if (line.startsWith("```")) {
      inFence = !inFence;
      continue;
    }
    if (!inFence && BARE_URL_LINE.test(line)) seen.add(line);
  }
  return [...seen];
}

export async function collectVideoObjects(
  content: string,
  opts: { datePublished?: string; fallbackDescription?: string },
): Promise<Record<string, unknown>[]> {
  const urls = bareUrls(content);
  const resolved = await Promise.all(
    urls.map(async (url) => ({ url, embed: await resolveEmbed(url) })),
  );

  const videos: Record<string, unknown>[] = [];
  for (const { url, embed } of resolved) {
    if (!embed || embed.data.type !== "video") continue;
    const { data } = embed;
    videos.push({
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: data.title ?? "Video",
      description: data.title ?? opts.fallbackDescription ?? "Video",
      ...(data.thumbnail_url ? { thumbnailUrl: data.thumbnail_url } : {}),
      ...(opts.datePublished ? { uploadDate: opts.datePublished } : {}),
      ...(extractEmbedUrl(data.html) ? { embedUrl: extractEmbedUrl(data.html) } : {}),
      contentUrl: url,
      ...(data.author_name ? { creator: { "@type": "Person", name: data.author_name } } : {}),
    });
  }
  return videos;
}
