---
title: "URL canonique"
description: "L'URL que Google doit traiter comme version principale d'une page, déclarée via `<link rel=\"canonical\">` et cohérente avec sitemap et hreflang."
date: "2026-01-12"
---

Une URL canonique est l'URL que vous désignez comme version
faisant autorité d'une page. Les moteurs consolident les signaux de
classement (liens, mentions, clics) sur la canonique et traitent les
doublons comme un même contenu.

À déclarer ainsi :

```html
<link rel="canonical" href="https://example.com/blog/post" />
```

Pièges courants : barres obliques finales, casse, paramètres de
requête, variantes linguistiques. Une mauvaise canonique est la
première cause silencieuse de désindexation.
