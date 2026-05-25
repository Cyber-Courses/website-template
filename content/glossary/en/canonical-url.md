---
title: "Canonical URL"
description: "The URL Google should treat as the master version of a page, declared via `<link rel=\"canonical\">` and (ideally) consistent across HTTP headers, sitemap, and hreflang annotations."
date: "2026-01-12"
---

A canonical URL is the URL you've nominated as the authoritative version
of a page. Search engines consolidate ranking signals (links, mentions,
clicks) onto the canonical and treat duplicates as the same content.

Set it via:

```html
<link rel="canonical" href="https://example.com/blog/post" />
```

Common pitfalls: trailing slashes, casing, query parameters, and
language variants. A wrong canonical is the single most common reason a
page silently de-indexes.
