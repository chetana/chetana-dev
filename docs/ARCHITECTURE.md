# Architecture — chetana.dev

## Vue d'ensemble

```
┌─────────────────────────────────────────────────────────┐
│                     Vercel Edge                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Nuxt 4 (SSR / Nitro)                 │  │
│  │  ┌─────────────┐     ┌────────────────────────┐   │  │
│  │  │   Vue 3 SPA │     │  Nitro Server Routes   │   │  │
│  │  │   (pages,   │────▶│  /api/projects         │   │  │
│  │  │  components,│     │  /api/blog             │   │  │
│  │  │  composables│     │  /api/comments         │   │  │
│  │  │  )          │     │  /api/messages          │   │  │
│  │  └─────────────┘     └────────┬───────────────┘   │  │
│  └───────────────────────────────┼───────────────────┘  │
│                                  │                       │
│                         Drizzle ORM                      │
│                                  │                       │
│                    @neondatabase/serverless               │
└──────────────────────────┼──────────────────────────────┘
                           │
                   ┌───────▼────────┐
                   │ Neon PostgreSQL │
                   │  (serverless)   │
                   └────────────────┘
```

## Stack technique

| Couche | Technologie | Justification |
|---|---|---|
| Frontend | Nuxt 4 (Vue 3, TypeScript) | SSR, DX, file-based routing |
| Backend | Nitro Server Routes | Serverless-ready, intégré à Nuxt |
| ORM | Drizzle ORM | Type-safe, léger, edge-compatible |
| DB Driver | @neondatabase/serverless | HTTP driver pour serverless |
| Base de données | Neon PostgreSQL | Serverless PostgreSQL, scaling auto |
| Migrations | drizzle-kit | Généré depuis le schéma TypeScript |
| Hosting | Vercel | Serverless functions, edge network |
| i18n | Composable custom | FR/EN toggle réactif via useState |

## Structure du projet

```
chetana-dev/
├── app/                        # Nuxt 4 app directory
│   ├── pages/                  # File-based routing
│   ├── components/             # Vue components (auto-imported)
│   ├── composables/            # Composables (auto-imported)
│   └── assets/css/             # CSS global
├── server/
│   ├── api/                    # Nitro API routes
│   ├── db/                     # Schema Drizzle + seed
│   └── utils/                  # DB helper
├── drizzle/migrations/         # Auto-generated SQL migrations
├── docs/                       # Architecture docs + ADRs
└── drizzle.config.ts           # Drizzle Kit config
```

## Schéma de base de données

6 tables principales :

- **projects** — Projets personnels (bilingue FR/EN)
- **blog_posts** — Articles de blog (bilingue, avec contenu Markdown)
- **comments** — Commentaires sur les articles (modérés)
- **messages** — Messages de contact (formulaire)
- **experiences** — Expériences CV (bilingue)
- **skills** — Compétences techniques (groupées par catégorie)

## Flux de données

1. **SSR** : Nuxt effectue le rendu côté serveur. Les pages appellent `useFetch()` qui hit les API routes.
2. **API Routes** : Chaque route utilise `getDB()` qui crée une connexion Drizzle → Neon.
3. **Neon** : Connexion HTTP (pas de pool TCP), idéal pour serverless.
4. **i18n** : Le composable `useI18n()` expose un `useState('locale')` réactif. Chaque composant utilise `t('key')` pour obtenir la traduction FR ou EN.

## Sécurité

- Validation des inputs sur toutes les routes POST
- Honeypot anti-spam sur le formulaire de contact
- Modération des commentaires (approved = false par défaut)
- Pas de SQL injection grâce à Drizzle (parameterized queries)
- `DATABASE_URL` en variable d'environnement (jamais dans le code)
