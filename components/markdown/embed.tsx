import { resolveEmbed } from "@/lib/oembed/fetch";
import type { OEmbedResponse } from "@/lib/oembed/types";

/**
 * Renders a bare URL as a rich oEmbed when the provider is known, degrading to
 * a link card (for script-based providers / discovery) and finally a plain
 * external link. RSC: the oEmbed fetch happens at render/build time.
 */
export async function MdEmbed({ url }: { url: string }) {
  const resolved = await resolveEmbed(url);

  if (!resolved) return <PlainLink url={url} />;

  const { data, strategy } = resolved;

  if (strategy === "iframe" && data.html && (data.type === "video" || data.type === "rich")) {
    return <IframeEmbed data={data} />;
  }

  if (data.type === "photo" && data.url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={data.url}
        alt={data.title ?? ""}
        width={data.width ?? undefined}
        height={data.height ?? undefined}
        className="rounded-md w-full h-auto my-6"
      />
    );
  }

  return <LinkCard url={url} data={data} />;
}

function IframeEmbed({ data }: { data: OEmbedResponse }) {
  const ratio =
    data.width && data.height ? (data.height / data.width) * 100 : 56.25; // 16:9 default
  return (
    <div
      className="not-prose my-6 overflow-hidden rounded-md border bg-muted [&>iframe]:absolute [&>iframe]:inset-0 [&>iframe]:h-full [&>iframe]:w-full [&>iframe]:border-0"
      style={{ position: "relative", paddingBottom: `${ratio}%` }}
      // Provider html for registry iframe providers is a self-contained <iframe>.
      dangerouslySetInnerHTML={{ __html: data.html ?? "" }}
    />
  );
}

function LinkCard({ url, data }: { url: string; data: OEmbedResponse }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="not-prose my-6 flex gap-4 overflow-hidden rounded-md border no-underline transition-colors hover:bg-muted/50"
    >
      {data.thumbnail_url && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={data.thumbnail_url}
          alt=""
          className="h-auto w-32 shrink-0 object-cover sm:w-40"
        />
      )}
      <div className="flex flex-col justify-center gap-1 p-4">
        {data.provider_name && (
          <span className="text-xs uppercase tracking-wide text-muted-foreground">
            {data.provider_name}
          </span>
        )}
        <span className="font-medium text-foreground">
          {data.title ?? url}
        </span>
        {data.author_name && (
          <span className="text-sm text-muted-foreground">
            {data.author_name}
          </span>
        )}
      </div>
    </a>
  );
}

function PlainLink({ url }: { url: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer nofollow">
      {url}
    </a>
  );
}
