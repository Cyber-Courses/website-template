---
title: "hreflang"
description: "Une annotation HTML et sitemap qui indique aux moteurs quelle URL sert quelle langue/région, pour que Google serve la bonne page à chaque audience."
date: "2026-01-15"
---

Les annotations `hreflang` indiquent à Google (et Yandex) quelle URL de
votre site correspond à quelle langue/région. Sans elles, Google peut
servir votre page anglaise à un internaute francophone, divisant le CTR
par deux.

Déclarez-les à trois endroits (Google lit n'importe lequel) :
- `<link rel="alternate" hreflang="…" href="…">` dans le `<head>`
- `<xhtml:link>` par entrée dans votre sitemap XML
- En-têtes HTTP `Link`

Incluez toujours `hreflang="x-default"` pointant vers la locale servie
quand aucune autre règle ne s'applique.
