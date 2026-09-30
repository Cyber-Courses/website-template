---
title: "Kanonische URL"
description: "Die URL, die Google als Master-Version einer Seite behandeln soll — per `<link rel=\"canonical\">` deklariert, konsistent mit Sitemap und hreflang."
date: "2026-01-12"
---

Eine kanonische URL ist die URL, die du als autoritative Version einer
Seite festlegst. Suchmaschinen konsolidieren Ranking-Signale (Links,
Mentions, Clicks) auf die Kanonische und behandeln Duplikate als
denselben Inhalt.

Deklaration:

```html
<link rel="canonical" href="https://example.com/blog/post" />
```

Häufige Fallen: trailing Slashes, Groß-/Kleinschreibung,
Query-Parameter, Sprach-Varianten. Eine falsche Kanonische ist der
häufigste stille Grund, warum Seiten deindexiert werden.
