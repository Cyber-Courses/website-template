---
title: "URL canónica"
description: "La URL que Google debe tratar como la versión maestra de una página, declarada con `<link rel=\"canonical\">` e idealmente consistente entre cabeceras HTTP, sitemap y anotaciones hreflang."
date: "2026-01-12"
---

Una URL canónica es la URL que has designado como versión autoritativa
de una página. Los buscadores consolidan las señales de posicionamiento
(enlaces, menciones, clics) sobre la canónica y tratan los duplicados
como el mismo contenido.

Se declara así:

```html
<link rel="canonical" href="https://example.com/blog/post" />
```

Errores comunes: barras finales, mayúsculas/minúsculas, parámetros de
consulta y variantes de idioma. Una canónica incorrecta es la causa
silenciosa más frecuente de desindexación.
