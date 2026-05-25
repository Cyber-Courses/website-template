---
title: "An SEO checklist for content-driven sites"
description: "A practical, prioritized checklist for content sites that want to win organic traffic in 2026."
date: "2026-04-15"
author: "Your Name"
tags: ["seo", "checklist", "guide"]
image: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=1600&q=80"
series: "getting-started"
seriesTitle: "Getting started with the SEO template"
seriesOrder: 2
faq:
  - question: "Do I still need a meta description if Google rewrites it?"
    answer: "Yes. Google rewrites ~70% of descriptions but uses yours as the starting point. A good one is shown verbatim and drives CTR; a missing one cedes control entirely."
  - question: "How many hreflang annotations are too many?"
    answer: "None — but every annotation must be reciprocated. If /en links to /fr, /fr must link to /en. Asymmetric maps get ignored by Google."
  - question: "Should I add FAQPage schema to every blog post?"
    answer: "Only when the post actually contains FAQs. Google penalizes pages where the JSON-LD doesn't match visible content."
howto:
  name: "Audit an existing site against this checklist"
  description: "A 30-minute pass that surfaces 80% of the typical issues."
  totalTime: "PT30M"
  tool: ["Search Console", "Screaming Frog (free up to 500 URLs)", "Lighthouse"]
  yield: "A prioritized punch-list of SEO fixes."
  steps:
    - name: "Run a crawl with Screaming Frog"
      text: "Export the report. Filter for 4xx, 5xx, redirects, and pages over 1MB."
    - name: "Check canonical consistency"
      text: "In the same report, look for pages whose canonical differs from the URL itself. Investigate every mismatch."
    - name: "Verify hreflang reciprocity"
      text: "Use a hreflang validator to find one-way references. Fix the source page on each."
    - name: "Lighthouse on the top 5 landing pages"
      text: "Aim for ≥ 90 on SEO and ≥ 90 on Performance. Note any CLS > 0.1 or LCP > 2.5s."
    - name: "Check Search Console coverage report"
      text: "Look for 'Discovered – currently not indexed' and 'Crawled – currently not indexed'. These are usually quality / canonical issues, not crawl issues."
---

The bar for "good SEO" keeps moving. This is the short list — the things that consistently move rankings for content sites in 2026.

## Foundations

- **One canonical URL per page.** Mixed canonicals are the single most common reason pages stop indexing.
- **Title and description are not optional.** Write them for humans first; search engines will follow.
- **Set `lang` correctly.** The HTML `lang` attribute is read by accessibility tools *and* by search engines.

## Crawlability

- **Sitemap with hreflang.** Per-page alternates beat sitemap-only declarations because they survive content syndication.
- **robots.txt** that doesn't block JS/CSS. Google needs to render the page.
- **Internal links.** Three clicks from the homepage to any page is the rule of thumb.

## Page experience

- **CLS = 0.** Layout shift is fixable: dimension your images, reserve space for embeds, and don't toggle themes without paint.
- **LCP < 2.5s.** The biggest paint is usually the hero image. Optimize *that* one, not all of them.
- **INP < 200ms.** Trim client JS — most sites can.

## Structured data

A single `@graph` containing `Organization`, `BlogPosting`, and `BreadcrumbList` covers most blog use cases. Add `FAQPage` only when the on-page content is *actually* an FAQ — Google penalizes mismatches.

That's the short list. Everything else is iteration.
