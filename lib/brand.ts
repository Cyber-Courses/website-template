/**
 * Brand constants for places CSS variables can't reach: generated images
 * (favicon, apple-icon, Open Graph cards via Satori), the web manifest and
 * the browser `theme-color`.
 *
 * The site UI itself is themed by `app/theme.css`. When you rebrand, change
 * the palette in both files — the hex values below mirror the Tailwind v4
 * palette steps referenced there (default: `indigo` brand on `zinc` base).
 */
export const brand = {
  colors: {
    /** --brand-500 / --brand-600 / --brand-700 in theme.css */
    brand500: "#625fff",
    brand600: "#4f39f6",
    brand700: "#432dd7",
    /** --base-* in theme.css (neutral scale) */
    base50: "#fafafa",
    base200: "#e4e4e7",
    base400: "#9f9fa9",
    base500: "#71717b",
    base800: "#27272a",
    base900: "#18181b",
    base950: "#09090b",
    white: "#ffffff",
  },
  /** Open Graph / social card appearance. */
  og: {
    /** "dark" stands out in social feeds; "light" matches a light site. */
    theme: "dark" as "dark" | "light",
  },
} as const;

const c = brand.colors;

/** Browser UI color (address bar, PWA title bar) per color scheme. */
export const themeColor = { light: c.white, dark: c.base950 } as const;

/**
 * The logo mark, as raw SVG geometry on a 32×32 grid. Shared by the React
 * `<LogoMark>`, the favicon, the apple-icon and OG images so the mark is
 * defined exactly once. Replace these paths (or the whole mark) to rebrand.
 */
export const logoMark = {
  viewBox: "0 0 32 32",
  radius: 8,
  /** Filled shape (top layer). */
  fill: "M16 8.75 24.5 13.25 16 17.75 7.5 13.25Z",
  /** Stroked shape (bottom layer). */
  stroke: "M7.5 18.25 16 22.75 24.5 18.25",
  strokeWidth: 2.25,
} as const;

/** Standalone SVG markup of the mark, for image routes. */
export function logoMarkSvg({
  background = c.brand600,
  foreground = c.white,
  size = 32,
  radius = logoMark.radius,
}: {
  background?: string;
  foreground?: string;
  size?: number;
  /** Corner radius on the 32-unit grid; 0 for platforms that mask icons (iOS). */
  radius?: number;
} = {}) {
  const m = logoMark;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="${m.viewBox}"><rect width="32" height="32" rx="${radius}" fill="${background}"/><path d="${m.fill}" fill="${foreground}" stroke="${foreground}" stroke-width="1.5" stroke-linejoin="round"/><path d="${m.stroke}" fill="none" stroke="${foreground}" stroke-width="${m.strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/** The mark as a data URI, for `<img>` inside ImageResponse (Satori). */
export function logoMarkDataUri(options?: Parameters<typeof logoMarkSvg>[0]) {
  return `data:image/svg+xml;base64,${Buffer.from(logoMarkSvg(options)).toString("base64")}`;
}
