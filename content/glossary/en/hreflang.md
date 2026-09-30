---
title: "hreflang"
description: "An HTML and sitemap signal telling search engines which URL serves which language/region, so Google can rank the right page for each audience."
date: "2026-01-15"
---

`hreflang` annotations tell Google (and Yandex) which URL on your site
corresponds to which language/region. Without them, Google may serve your
English page to a French searcher, halving CTR.

Declare them in three places (Google reads any of them):
- `<link rel="alternate" hreflang="…" href="…">` in `<head>`
- `<xhtml:link>` per entry in your XML sitemap
- HTTP `Link` headers

Always include `hreflang="x-default"` pointing at the locale shown when
no other rule matches.
