---
title: "Welcome to the blog"
description: "How this SEO-first Next.js template is wired together — and what you get on day one."
date: "2026-05-01"
updated: "2026-05-20"
author: "Your Name"
tags: ["seo", "nextjs", "template"]
image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80"
series: "getting-started"
seriesTitle: "Getting started with the SEO template"
seriesOrder: 1
---

This template ships every SEO primitive you'd otherwise wire by hand: canonical URLs, hreflang for every locale that has the post, OpenGraph + Twitter meta, JSON-LD with a single combined `@graph` (Organization + BlogPosting + BreadcrumbList), a sitemap that walks every locale, robots.txt, and an RSS feed.

## What's included

- **App Router pages** that wrap `MarkdownContent` from `@next-md-blog/core`.
- **Per-locale post folders** under `posts/{en,fr,es,de}`.
- **Per-post dynamic OG** at `/[lang]/blog/[slug]/opengraph-image`.
- **Auto-generated table of contents** from your markdown headings.

## Quick start

Edit `site.config.ts` to set your site name, URL, social handles, and analytics provider. Drop new posts into `posts/{locale}/your-slug.md` — they're indexed automatically.

### Frontmatter

The frontmatter recognized by `generateBlogPostMetadata` is documented inline in the file. The fields that have the most SEO impact are `title`, `description`, `date`, `updated`, `tags`, `image`, and `alternateLanguages`.

## Rich embeds

Paste a bare URL on its own line and it renders as a rich oEmbed — no shortcode, no plugin:

https://www.youtube.com/watch?v=dQw4w9WgXcQ

Known providers (YouTube, Vimeo, Spotify, …) embed inline; others fall back to a link card, and unrecognized URLs stay plain links.

## What's next

Open a few posts, view source, and confirm:

1. Exactly one `<script type="application/ld+json">` per page.
2. `<link rel="canonical">` pointing at the absolute URL.
3. `<link rel="alternate" hreflang="…">` for every locale that has a translation.

That's it — start writing.
