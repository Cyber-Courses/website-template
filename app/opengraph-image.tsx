import { renderOgImage, ogSize } from "@/lib/og";
import { siteConfig } from "@/site.config";

export const runtime = "nodejs";
export const alt = siteConfig.name;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    title: siteConfig.name,
    description: siteConfig.description,
  });
}
