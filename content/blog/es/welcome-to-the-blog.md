---
title: "Bienvenido al blog"
description: "Cómo está montada esta plantilla de Next.js centrada en SEO — y qué obtienes el primer día."
date: "2026-05-01"
updated: "2026-05-20"
author: "Your Name"
tags: ["seo", "nextjs", "template"]
image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1600&q=80"
---

Esta plantilla incluye cada primitiva SEO que normalmente conectarías a mano: URLs canónicas, hreflang para cada idioma con traducción, etiquetas OpenGraph + Twitter, JSON-LD con un único `@graph` combinado (Organization + BlogPosting + BreadcrumbList), un sitemap que recorre todos los idiomas, robots.txt y un feed RSS.

## Qué incluye

- **Páginas del App Router** que envuelven `MarkdownContent` de `@next-md-blog/core`.
- **Carpetas de posts por idioma** bajo `posts/{en,fr,es,de}`.
- **Imagen OG dinámica por post** en `/[lang]/blog/[slug]/opengraph-image`.
- **Tabla de contenidos auto-generada** desde los títulos de tu markdown.

## Empezar rápido

Edita `site.config.ts` para fijar nombre del sitio, URL, handles sociales y proveedor de analítica. Suelta posts nuevos en `posts/{locale}/tu-slug.md` — se indexan automáticamente.

## Qué sigue

Abre algunos posts, mira el código fuente y comprueba:

1. Exactamente un `<script type="application/ld+json">` por página.
2. Un `<link rel="canonical">` que apunta a la URL absoluta.
3. Un `<link rel="alternate" hreflang="…">` por cada idioma con traducción.

Y ya — a escribir.
