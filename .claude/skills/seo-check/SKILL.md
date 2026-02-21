---
name: seo-check
description: Audit SEO of chetana.dev (meta tags, JSON-LD, sitemap, robots)
allowed-tools: WebFetch, Bash, Read
---

# SEO Audit for chetana.dev

Run a full SEO audit on the live site.

## Checks to perform

1. **Homepage** (`https://chetana.dev`)
   - Verify og:title, og:description, og:type present
   - Verify twitter:card, twitter:title, twitter:description
   - Verify JSON-LD: Person, WebSite, WebPage schemas
   - Verify `<html lang="fr">` (or "en")
   - Verify all content sections render (no 500 errors)

2. **Blog post** (`https://chetana.dev/blog/claude-code-equipe-engineering`)
   - Verify og:type = "article"
   - Verify JSON-LD BlogPosting schema with datePublished, author
   - Verify dynamic title and description

3. **CV page** (`https://chetana.dev/cv`)
   - Verify `<meta name="robots" content="noindex, nofollow">`

4. **Sitemap** (`https://chetana.dev/sitemap.xml`)
   - List all URLs
   - Verify dynamic blog/project slugs are included
   - Verify /cv is excluded or present (acceptable either way)

5. **robots.txt** (`https://chetana.dev/robots.txt`)
   - Verify it allows crawling
   - Verify it references the sitemap

## Report format
Present results as a table with Pass/Fail status for each check.
