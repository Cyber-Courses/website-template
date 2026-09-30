# Design system

A clean, neutral SaaS look — one brand color on a cool gray base, Inter type,
soft radii — built so you can rebrand by editing a handful of values rather
than hunting through components.

## Where things live

| What | File | Notes |
|---|---|---|
| Colors, radius, content width, font features | `app/theme.css` | **The file to edit.** Light + dark tokens. |
| Tailwind wiring (tokens → utilities), base styles, prose | `app/globals.css` | Rarely needs touching. |
| Fonts | `lib/fonts.ts` | Inter (sans) + JetBrains Mono. |
| Logo mark geometry, hex mirror of the palette, OG theme | `lib/brand.ts` | Used by favicon, apple-icon, OG images, manifest. |
| Logo component | `components/brand/logo.tsx` | `<Logo />` (mark + name), `<LogoMark />`. |
| Social card layout | `lib/og.tsx` | Every `opengraph-image.tsx` renders `OgCard`. |
| UI primitives | `components/ui/*` | shadcn/ui (`base-nova` style, Base UI). |

## Token layers

```
Tailwind palette     --color-indigo-600, --color-zinc-200 …   (built in)
       ↓
Palettes             --brand-50…950, --base-50…950            (theme.css)
       ↓
Semantic tokens      --primary, --muted-foreground, --border … (theme.css, light + .dark)
       ↓
Utilities            bg-primary, text-muted-foreground, border (globals.css @theme)
```

**Rule:** components use semantic utilities (`bg-primary`, `text-muted-foreground`,
`border`, `bg-surface`, `text-link`) or the brand scale (`bg-brand-50`) — never
raw palette classes like `bg-indigo-600`. That's what makes a palette swap
restyle everything.

### Semantic tokens

| Token | Use |
|---|---|
| `background` / `foreground` | Page |
| `surface` | Subtle alternate bands (footer, feature sections) |
| `card`, `popover` (+ `-foreground`) | Raised surfaces |
| `primary` (+ `-foreground`) | Main actions, logo tile, focus accents |
| `secondary`, `muted`, `accent` (+ `-foreground`) | Quiet fills, secondary text, hovers |
| `link` | Inline text links (tuned separately for dark-mode contrast) |
| `destructive`, `success`, `warning`, `info` | Status (callouts, alerts) |
| `border`, `input`, `ring` | Lines, fields, focus rings |
| `chart-1…5` | Data viz |

Extra utilities: `bg-grid` and `bg-glow` (decorative hero backgrounds, token-based).

## Recipes

**Change the brand color** — in `app/theme.css`, replace `indigo` with any
Tailwind scale (`violet`, `blue`, `emerald`, `rose`, `orange`…). Then update the
hex values in `lib/brand.ts` (`brand500/600/700`) so the favicon and OG images
match. Hex values for every scale are in `node_modules/tailwindcss/theme.css`.

**Warmer or cooler grays** — replace `zinc` with `neutral`, `slate`, `gray` or
`stone` in `theme.css` (and the `base*` hex values in `lib/brand.ts`).

**Use your own exact brand color** — point the palette at literal values
instead of Tailwind vars, e.g. `--brand-600: oklch(0.55 0.2 250);`. Only the
steps referenced by semantic tokens matter (400, 500, 600 by default).

**Rounder / sharper UI** — `--radius` in `theme.css` (all radii derive from it).

**Wider / narrower layout** — `--content-width` in `theme.css`.

**Fonts** — swap the `next/font/google` import in `lib/fonts.ts`; keep the
`variable` names. For a separate heading face, load it with
`variable: "--font-brand-heading"`. If the new font lacks Inter's character
variants, set `--font-features: normal`. OG images use the `.woff` files in
`assets/fonts/` — replace them to match.

**Logo** — edit the SVG paths in `lib/brand.ts` (`logoMark`, 32×32 grid). The
header, footer, favicon, apple-icon and OG images all update. For a fully
custom logo, replace the body of `LogoMark` and `logoMarkSvg`.

**Social cards** — `brand.og.theme` switches dark/light; `OgCard` in
`lib/og.tsx` holds the layout.

**Adding shadcn components** — `npx shadcn@latest add <component>`. They read
the same tokens, so they match automatically.

## Accessibility notes

- White on `primary` (brand-600) is ≥ 4.5:1 in both modes; `link` uses
  brand-400 on dark backgrounds for the same reason. Re-check contrast if you
  pick a light brand color (yellow, lime, cyan): use `--primary: var(--brand-700)`
  or a dark `--primary-foreground`.
- Focus rings use `ring` (brand) at 50% opacity; reduced motion is respected
  globally in `globals.css`.
