---
title: "Bienvenue sur le blog"
description: "Comment ce template Next.js orienté SEO est câblé — et ce que vous obtenez le premier jour."
date: "2026-05-01"
updated: "2026-05-20"
author: "Your Name"
tags: ["seo", "nextjs", "template"]
image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80"
---

Ce template embarque chaque primitive SEO qu'on devrait normalement câbler à la main : URLs canoniques, hreflang pour chaque langue disposant de la traduction, balises OpenGraph + Twitter, JSON-LD avec un unique `@graph` combiné (Organization + BlogPosting + BreadcrumbList), un sitemap qui parcourt toutes les langues, robots.txt, et un flux RSS.

## Ce qui est inclus

- **Des pages App Router** qui s'appuient sur `MarkdownContent` de `@next-md-blog/core`.
- **Des dossiers de posts par langue** sous `posts/{en,fr,es,de}`.
- **Une image OG dynamique par post** sur `/[lang]/blog/[slug]/opengraph-image`.
- **Une table des matières auto-générée** depuis les titres de votre markdown.

## Démarrage rapide

Modifiez `site.config.ts` pour définir le nom du site, l'URL, les handles sociaux et le fournisseur d'analytics. Déposez de nouveaux articles dans `posts/{locale}/your-slug.md` — ils sont indexés automatiquement.

## Et après

Ouvrez quelques articles, regardez la source, et confirmez :

1. Exactement un `<script type="application/ld+json">` par page.
2. Un `<link rel="canonical">` pointant vers l'URL absolue.
3. Un `<link rel="alternate" hreflang="…">` pour chaque langue disposant d'une traduction.

C'est tout — bonne écriture.
