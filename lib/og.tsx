import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { brand, logoMarkDataUri } from "@/lib/brand";
import { siteConfig } from "@/site.config";

/**
 * Branded Open Graph / Twitter card renderer shared by every
 * `opengraph-image.tsx`. Colors and theme come from `lib/brand.ts`; the font
 * is Inter from `assets/fonts` (Satori can't use next/font). To restyle all
 * social cards at once, edit `OgCard` below.
 */
export const ogSize = { width: 1200, height: 630 };

const fontsPromise = Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Inter-Regular.woff")),
  readFile(join(process.cwd(), "assets/fonts/Inter-SemiBold.woff")),
]);

type OgCardProps = {
  title: string;
  description?: string;
  /** Small label top-right, e.g. "Blog" or a tag. */
  eyebrow?: string;
};

function palette() {
  const c = brand.colors;
  return brand.og.theme === "dark"
    ? {
        background: c.base950,
        foreground: c.base50,
        muted: c.base400,
        subtle: c.base500,
        line: "rgba(255,255,255,0.06)",
        pillBorder: "rgba(255,255,255,0.14)",
        glow: `${c.brand600}66`,
      }
    : {
        background: c.white,
        foreground: c.base950,
        muted: c.base500,
        subtle: c.base400,
        line: "rgba(9,9,11,0.05)",
        pillBorder: c.base200,
        glow: `${c.brand500}33`,
      };
}

function titleSize(title: string) {
  if (title.length > 90) return 52;
  if (title.length > 55) return 60;
  return 72;
}

export function OgCard({ title, description, eyebrow }: OgCardProps) {
  const p = palette();
  const host = new URL(siteConfig.url).host;
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: p.background,
        backgroundImage: `radial-gradient(circle at 88% 0%, ${p.glow} 0%, transparent 45%), linear-gradient(${p.line} 1px, transparent 1px), linear-gradient(90deg, ${p.line} 1px, transparent 1px)`,
        backgroundSize: "100% 100%, 56px 56px, 56px 56px",
        color: p.foreground,
        fontFamily: "Inter",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoMarkDataUri({ size: 52 })} width={52} height={52} alt="" />
          <span style={{ fontSize: 30, fontWeight: 600, letterSpacing: -0.5 }}>
            {siteConfig.name}
          </span>
        </div>
        {eyebrow && (
          <span
            style={{
              display: "flex",
              fontSize: 22,
              color: p.muted,
              border: `1px solid ${p.pillBorder}`,
              borderRadius: 999,
              padding: "8px 20px",
            }}
          >
            {eyebrow}
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 1000 }}>
        <div
          style={{
            display: "block",
            fontSize: titleSize(title),
            fontWeight: 600,
            lineHeight: 1.08,
            letterSpacing: -2,
            lineClamp: 3,
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              display: "block",
              fontSize: 28,
              lineHeight: 1.4,
              color: p.muted,
              lineClamp: 2,
            }}
          >
            {description}
          </div>
        )}
        <div style={{ display: "flex", fontSize: 22, color: p.subtle, marginTop: 8 }}>
          {host}
        </div>
      </div>
    </div>
  );
}

/** Render an `OgCard` as a cached PNG response. */
export async function renderOgImage(props: OgCardProps) {
  const [regular, semibold] = await fontsPromise;
  return new ImageResponse(<OgCard {...props} />, {
    ...ogSize,
    fonts: [
      { name: "Inter", data: regular, weight: 400, style: "normal" },
      { name: "Inter", data: semibold, weight: 600, style: "normal" },
    ],
    headers: {
      // OG images are content-addressed by URL; safe to cache forever.
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
