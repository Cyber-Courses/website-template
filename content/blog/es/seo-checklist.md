---
title: "Una checklist SEO para sitios de contenido"
description: "Una checklist práctica y priorizada para sitios de contenido que quieren ganar tráfico orgánico en 2026."
date: "2026-04-15"
author: "Your Name"
tags: ["seo", "checklist", "guide"]
image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1600&q=80"
---

El listón del "buen SEO" sigue subiendo. Esta es la lista corta — las cosas que mueven rankings de forma consistente para sitios de contenido en 2026.

## Fundamentos

- **Una URL canónica por página.** Las canónicas mezcladas son la primera causa de pérdida de indexación.
- **Título y descripción no son opcionales.** Escríbelos para humanos; los buscadores irán detrás.
- **Define `lang` correctamente.** El atributo `lang` lo leen las herramientas de accesibilidad *y* los buscadores.

## Crawlabilidad

- **Sitemap con hreflang.** Los alternates por página ganan a los del sitemap-only porque sobreviven a la sindicación.
- **robots.txt** que no bloquee JS/CSS. Google necesita renderizar la página.
- **Enlazado interno.** Tres clics desde el home a cualquier página es la regla.

## Experiencia

- **CLS = 0.** El layout shift se arregla: dimensiona imágenes, reserva espacio para embeds y no cambies de tema sin pintar.
- **LCP < 2,5 s.** El paint más grande suele ser la imagen hero. Optimiza *esa*, no todas.
- **INP < 200 ms.** Recorta JS de cliente — la mayoría de sitios puede.

## Datos estructurados

Un único `@graph` con `Organization`, `BlogPosting` y `BreadcrumbList` cubre la mayoría de blogs. Añade `FAQPage` solo si el contenido es *realmente* una FAQ — Google penaliza las divergencias.

Esa es la lista corta. El resto es iterar.
