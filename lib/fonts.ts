import { Inter, JetBrains_Mono } from "next/font/google";

/**
 * Typefaces. To change a font, swap the import and constructor here — the
 * CSS variable names stay the same, so nothing else needs to change.
 *
 * Want a distinct display face for headings (e.g. a serif)? Load it here with
 * `variable: "--font-brand-heading"` and add it to `fontVariables`; headings
 * fall back to the sans font when that variable is unset.
 *
 * OG images can't use next/font — they read `assets/fonts/*.woff` instead.
 */
const sans = Inter({
  variable: "--font-brand-sans",
  subsets: ["latin"],
  display: "swap",
});

const mono = JetBrains_Mono({
  variable: "--font-brand-mono",
  subsets: ["latin"],
  display: "swap",
});

/** Class names that define the font CSS variables; put on `<html>`. */
export const fontVariables = [sans.variable, mono.variable].join(" ");
