# chetana.dev - Portfolio & Blog

## Stack
- **Frontend**: Nuxt 4 (Vue 3.5) + TypeScript
- **Backend**: Nitro server routes (REST API)
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Deployment**: Vercel (auto-deploy on push to main)
- **SEO**: @nuxtjs/seo (sitemap, robots, schema.org)
- **i18n**: Custom `useLocale()` composable (FR/EN) — NOT `useI18n` (conflicts with nuxt-seo-utils)

## Key paths
- Pages: `app/pages/`
- Components: `app/components/`
- i18n translations: `app/composables/useI18n.ts` (exports `useLocale`)
- Server API: `server/api/`
- DB schema: `server/db/schema.ts`
- DB connection: `server/utils/db.ts`

## Commands
- `npm run dev` — dev server
- `npm run build` — production build
- `npm run db:push` — push schema to Neon
- `npm run db:seed` — seed database

## Environment
- Use nvm node: `export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"`
- Windows npm does NOT work in WSL — always use nvm node
- DATABASE_URL in `.env.local` (pulled from Vercel)

## Vercel
- Project: `chetana-cv` (prj_BrYuLeLY4ghfWvEvoTGyu6PRK6b7)
- Team: `chetana-yins-projects` (team_P2gbZVxXm3tykn0fOxxIhYXN)
- Domain: chetana.dev
- GitHub: chetana/chetana-dev (auto-deploy on push)
- Env var: `NUXT_DATABASE_URL` + `DATABASE_URL` both set

## SEO notes
- `useSeoMeta()` on every page for OG/Twitter meta
- `useSchemaOrg()` in app.vue for global Person schema
- Blog posts get BlogPosting JSON-LD
- CV page has `routeRules: { '/cv': { robots: false } }` for noindex
- Sitemap sources: static pages + `/api/__sitemap__/urls` for dynamic slugs
