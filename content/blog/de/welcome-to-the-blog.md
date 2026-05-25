---
title: "Willkommen im Blog"
description: "Wie diese SEO-orientierte Next.js-Vorlage aufgebaut ist — und was du am ersten Tag bekommst."
date: "2026-05-01"
updated: "2026-05-20"
author: "Your Name"
tags: ["seo", "nextjs", "template"]
image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80"
---

Diese Vorlage liefert jedes SEO-Primitive mit, das du sonst von Hand verdrahten würdest: kanonische URLs, hreflang für jede Sprache mit Übersetzung, OpenGraph- und Twitter-Tags, JSON-LD mit einem kombinierten `@graph` (Organization + BlogPosting + BreadcrumbList), eine Sitemap, die alle Sprachen durchläuft, robots.txt und ein RSS-Feed.

## Was enthalten ist

- **App-Router-Seiten**, die `MarkdownContent` aus `@next-md-blog/core` einbinden.
- **Sprach-Ordner** unter `posts/{en,fr,es,de}`.
- **Dynamisches OG-Bild pro Beitrag** auf `/[lang]/blog/[slug]/opengraph-image`.
- **Automatisch erzeugtes Inhaltsverzeichnis** aus deinen Markdown-Überschriften.

## Schneller Einstieg

Bearbeite `site.config.ts`, um Sitename, URL, Social-Handles und Analytics-Provider festzulegen. Lege neue Beiträge unter `posts/{locale}/dein-slug.md` ab — sie werden automatisch indiziert.

## Wie geht es weiter

Öffne ein paar Beiträge, schau in den Quelltext und prüfe:

1. Genau ein `<script type="application/ld+json">` pro Seite.
2. Ein `<link rel="canonical">`, das auf die absolute URL zeigt.
3. Ein `<link rel="alternate" hreflang="…">` für jede Sprache mit Übersetzung.

Das war's — viel Erfolg beim Schreiben.
