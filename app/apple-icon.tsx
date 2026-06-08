import { ImageResponse } from "next/og";

/**
 * Apple touch icon (180×180) — the favicon WordPress/Yoast emit as
 * `<link rel="apple-touch-icon">` for iOS home-screen bookmarks and many social
 * scrapers. Mirrors the mark in `app/icon.svg`. Edit both together if rebranding.
 */
export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#fafafa",
          fontSize: 110,
          fontWeight: 700,
          letterSpacing: "-6px",
        }}
      >
        S
      </div>
    ),
    size,
  );
}
