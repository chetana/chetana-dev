---
description: Repository Information Overview
alwaysApply: true
---

# chetana.dev Information

## Summary
A full-stack portfolio, technical blog, and personal projects platform built with Nuxt 4 and TypeScript. Features bilingual content (FR/EN), dynamic blog posts with comments, project showcase, health tracker (daily pushups), and CV export. Deployed on Vercel with auto-deployment on pushes to main branch.

## Structure
- **app/** — Frontend components, pages, assets, and i18n composable
- **server/** — Nitro API routes and database utilities
- **server/db/** — Drizzle schema and seed scripts
- **drizzle/** — Auto-generated database migrations
- **public/** — Static assets (PWA icons, push service worker)
- **docs/** — Architecture documentation and ADRs

## Language & Runtime
**Language**: TypeScript 5.7.3  
**Runtime**: Node.js (via nvm; Windows npm does NOT work in WSL)  
**Framework**: Nuxt 4 (Vue 3.5)  
**Build System**: Nuxt build tool  
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- `nuxt@3.16.0` — Full-stack Vue framework with SSR and server routes
- `vue@3.5.13` — Reactive UI framework
- `drizzle-orm@0.38.3` — Type-safe ORM for PostgreSQL
- `@nuxtjs/seo@3.4.0` — SEO meta, sitemap, robots.txt, Schema.org JSON-LD
- `@vite-pwa/nuxt@1.1.1` — Progressive Web App support with Workbox
- `@neondatabase/serverless@0.10.4` — Neon PostgreSQL serverless client
- `web-push@3.6.7` — Web push notifications support
- `vue-router@4.5.0` — Client-side routing

**Development Dependencies**:
- `drizzle-kit@0.30.4` — Database schema generation and migration management
- `@nuxt/devtools@2.3.0` — Development tooling

## Database
**Type**: PostgreSQL (Neon serverless)  
**Connection**: Via `@neondatabase/serverless` client  
**ORM**: Drizzle with type-safe schema  
**Configuration File**: `drizzle.config.ts`

**Schema** (7 tables):
- `experiences` — CV positions with FR/EN descriptions
- `skills` — Technical skills grouped by category
- `projects` — Personal projects with tags and URLs
- `blog_posts` — Blog articles with bilingual content and markdown
- `comments` — Article comments with moderation support
- `messages` — Contact form submissions
- `health_entries` — Daily health tracker (pushups streak/count)

## Build & Installation
```bash
npm install
cp .env.example .env.local
# Configure .env.local with DATABASE_URL from Neon
npm run db:push
npm run db:seed
npm run dev
```

**Build Commands**:
```bash
npm run dev          # Development server (Nuxt + Nitro)
npm run build        # Production build (Vercel preset)
npm run preview      # Preview production build locally
npm run generate     # Static site generation
```

**Database Commands**:
```bash
npm run db:push                # Push schema to Neon
npm run db:generate            # Generate SQL migrations
npm run db:migrate             # Run migrations
npm run db:seed                # Initial seed (all content)
npm run db:seed-health         # Health tracker seed
npm run db:studio              # Drizzle Studio GUI
npm run db:seed-blog-*         # Specific blog post seeds
```

## API Routes
**Server Location**: `server/api/`

**Main Endpoints**:
- `GET /api/experiences` — CV experiences list
- `GET /api/skills` — Skills by category
- `GET /api/projects` — Project list
- `GET /api/projects/[slug]` — Project detail
- `GET /api/blog` — Published articles list
- `GET /api/blog/[slug]` — Article with markdown rendering
- `GET /api/comments/[postId]` — Article comments
- `POST /api/comments` — Add comment
- `POST /api/messages` — Contact form submission
- `GET /api/health/stats` — Pushup streak and stats
- `GET /api/health/entries` — Health history
- `POST /api/health/validate` — Log daily entry
- `GET /api/__sitemap__/urls` — Dynamic sitemap source

## Internationalization
**System**: Custom `useLocale()` composable (NOT `useI18n`)  
**Locales**: French (FR) default, English (EN)  
**File**: `app/composables/useLocale.ts`  
**Implementation**: Locale state managed via composable, affects all page metadata

## SEO & PWA
**SEO**:
- Dynamic sitemap via `/api/__sitemap__/urls`
- `useSeoMeta()` on all pages for OG/Twitter meta
- `useSchemaOrg()` for Person (global) and BlogPosting (articles)
- CV page in `noindex` via route rules

**PWA**:
- Manifest configuration in `nuxt.config.ts`
- Service worker with Workbox runtime caching
- Font caching (Google Fonts) with 1-year expiration
- Auto-update strategy for new versions

## Deployment
**Platform**: Vercel (serverless)  
**Preset**: Vercel Nitro preset in `nuxt.config.ts`  
**Auto-deployment**: Pushes to `main` branch trigger builds  
**Domain**: chetana.dev  
**Environment Variables**: `DATABASE_URL`, `VAPID_PRIVATE_KEY`, `VAPID_PUBLIC_KEY`, `CRON_SECRET`

## Configuration Files
- **nuxt.config.ts** — Nuxt config with SEO, PWA, Nitro preset, runtime config
- **drizzle.config.ts** — Drizzle migrations and schema setup
- **tsconfig.json** — Extends Nuxt-generated config
- **vercel.json** — Vercel-specific configuration
- **.env.example** — Environment variable template (DATABASE_URL required)

## Entry Points
**Frontend**: `app/app.vue` (root component with Nav/NuxtPage/Footer layout)  
**Pages**: `app/pages/` (Nuxt file-based routing)  
**Components**: `app/components/` (Nav, Hero, Footer, Timeline, Cards, CommentSection)
