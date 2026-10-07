# Website Template

An SEO-optimized, internationalized Next.js starter.

## Overview

This is the base template the Cyber-Courses content sites (e.g. `computer-internals`, `reverse-engineering`, the hardening guides, the forensics field references) are built from — not a standalone product. It provides:

- i18n routing via an `app/[lang]` segment
- SEO scaffolding: sitemap, robots, OpenGraph image, JSON-LD, `llms.txt`
- shadcn/ui components
- A Markdown/JSON content pipeline for a blog and a glossary (`content/blog`, `content/glossary`)

## Getting started

```bash
npm install
npm run dev
```

See `DESIGN.md` for the design system, and `AGENTS.md` / `CLAUDE.md` for repo conventions.
