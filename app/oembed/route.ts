import { NextResponse } from "next/server";
import { siteConfig } from "@/site.config";
import { resolveOEmbed } from "@/lib/oembed/resolve";
import { getImageDims } from "@/lib/image-dims";
import type { OEmbedResponse } from "@/lib/oembed/types";

/**
 * oEmbed provider endpoint (https://oembed.com/#section2.2).
 *
 *   GET /oembed?url=<page>&format=json|xml&maxwidth=&maxheight=
 *
 * Returns a `link`-type oEmbed document for any blog/glossary page on this site
 * so other sites can render a rich card when our URLs are pasted. Discovery is
 * advertised via <link rel="alternate" type="application/json+oembed"> tags in
 * each page's <head> (see lib/oembed/resolve.ts).
 */

const CORS = { "Access-Control-Allow-Origin": "*" } as const;
const CACHE = { "Cache-Control": "public, max-age=86400, s-maxage=86400" } as const;

export async function GET(req: Request) {
  if (!siteConfig.oembed.provide) {
    return NextResponse.json({ error: "Not Found" }, { status: 404, headers: CORS });
  }

  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const format = (searchParams.get("format") ?? "json").toLowerCase();

  if (format !== "json" && format !== "xml") {
    return new NextResponse("Not Implemented", { status: 501, headers: CORS });
  }
  if (!url) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400, headers: CORS });
  }

  const payload = await resolveOEmbed(url);
  if (!payload) {
    return NextResponse.json({ error: "Not Found" }, { status: 404, headers: CORS });
  }

  // Enrich thumbnail with real dimensions (consumers expect width/height).
  if (payload.thumbnail_url) {
    const dims = await getImageDims(payload.thumbnail_url);
    payload.thumbnail_width = dims.width;
    payload.thumbnail_height = dims.height;
  }

  if (format === "xml") {
    return new NextResponse(toXml(payload), {
      headers: { "Content-Type": "text/xml; charset=utf-8", ...CORS, ...CACHE },
    });
  }

  return NextResponse.json(payload, {
    headers: { "Content-Type": "application/json; charset=utf-8", ...CORS, ...CACHE },
  });
}

export function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      ...CORS,
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toXml(payload: OEmbedResponse): string {
  const rows = Object.entries(payload)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `  <${k}>${escapeXml(String(v))}</${k}>`)
    .join("\n");
  return `<?xml version="1.0" encoding="utf-8" standalone="yes"?>\n<oembed>\n${rows}\n</oembed>`;
}
