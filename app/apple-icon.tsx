import { ImageResponse } from "next/og";
import { logoMarkDataUri } from "@/lib/brand";

/**
 * Apple touch icon (180×180) for iOS home-screen bookmarks and social
 * scrapers; also the raster `logo` in Organization JSON-LD. Rendered from the
 * shared logo mark with square corners — iOS applies its own rounded mask.
 */
export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <img src={logoMarkDataUri({ size: 180, radius: 0 })} width={180} height={180} alt="" />
    ),
    size,
  );
}
