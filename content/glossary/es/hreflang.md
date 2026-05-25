---
title: "hreflang"
description: "Una señal HTML y de sitemap que indica a los buscadores qué URL sirve qué idioma/región — el mecanismo principal de Google para mostrar la página correcta por audiencia."
date: "2026-01-15"
---

Las anotaciones `hreflang` indican a Google (y Yandex) qué URL de tu
sitio corresponde a qué idioma/región. Sin ellas, Google puede mostrar
tu página en inglés a una búsqueda francófona, partiendo el CTR.

Decláralas en tres sitios (Google lee cualquiera de ellos):
- `<link rel="alternate" hreflang="…" href="…">` en el `<head>`
- `<xhtml:link>` por entrada en tu sitemap XML
- Cabeceras HTTP `Link`

Incluye siempre `hreflang="x-default"` apuntando al idioma que se sirve
cuando ninguna otra regla coincide.
