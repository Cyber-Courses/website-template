---
title: "hreflang"
description: "Eine HTML- und Sitemap-Annotation, die Suchmaschinen sagt, welche URL welche Sprache/Region bedient — Googles Hauptmechanismus, um pro Zielgruppe die richtige Seite zu ranken."
date: "2026-01-15"
---

`hreflang`-Annotationen sagen Google (und Yandex), welche URL deiner
Seite welcher Sprache/Region entspricht. Ohne sie kann Google deine
englische Seite einer französischen Suche ausspielen — die CTR halbiert
sich.

Deklariere sie an drei Stellen (Google liest jede davon):
- `<link rel="alternate" hreflang="…" href="…">` im `<head>`
- `<xhtml:link>` pro Eintrag in deiner XML-Sitemap
- HTTP-Header `Link`

Setze immer `hreflang="x-default"` auf die Locale, die ausgeliefert
wird, wenn keine andere Regel passt.
