---
title: "Canonical URL"
description: "The URL Google should treat as a page's master version, declared via `<link rel=\"canonical\">` and consistent with headers, sitemap and hreflang."
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
