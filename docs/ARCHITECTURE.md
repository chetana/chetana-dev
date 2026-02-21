# Architecture — chetana.dev

## Vue d'ensemble

```
┌──────────────────────────────────────────────────────────────┐
│                        Clients                                │
│                                                               │
│  ┌────────────────┐   ┌───────────────┐   ┌──────────────┐  │
│  │  Web Browser   │   │ Android App   │   │ Android      │  │
│  │  (SSR + SPA)   │   │ (Kotlin/MVVM) │   │ Widget       │  │
│  └───────┬────────┘   └───────┬───────┘   └──────┬───────┘  │
│          │                    │                    │          │
│          │               Bearer <idToken>     Bearer token   │
│          │                    │                    │          │
└──────────┼────────────────────┼────────────────────┼──────────┘
           │                    │                    │
           ▼                    ▼                    ▼
┌──────────────────────────────────────────────────────────────┐
│                     Vercel Edge                               │
│  ┌────────────────────────────────────────────────────────┐  │
│  │              Nuxt 4 (SSR / Nitro)                      │  │
│  │                                                         │  │
│  │  ┌─────────────┐     ┌─────────────────────────────┐   │  │
│  │  │   Vue 3 SPA │     │  Nitro Server Routes        │   │  │
│  │  │   (pages,   │────▶│                             │   │  │
│  │  │  components,│     │  Public:                     │   │  │
│  │  │  composables│     │  /api/projects               │   │  │
│  │  │  )          │     │  /api/blog                   │   │  │
│  │  │             │     │  /api/comments               │   │  │
│  │  │             │     │  /api/messages               │   │  │
│  │  │             │     │                             │   │  │
│  │  │             │     │  Protected (Google OAuth):   │   │  │
│  │  │             │     │  /api/health/stats    🔒     │   │  │
│  │  │             │     │  /api/health/entries  🔒     │   │  │
│  │  │             │     │  /api/health/validate 🔒     │   │  │
│  │  └─────────────┘     └────────┬────────────────────┘   │  │
│  │                                │                        │  │
│  │                     ┌──────────▼──────────┐             │  │
│  │                     │  server/utils/       │             │  │
│  │                     │  ├── db.ts (Drizzle) │             │  │
│  │                     │  └── auth.ts         │             │  │
│  │                     │      requireAuth()   │             │  │
│  │                     │      ├── verify token│             │  │
│  │                     │      ├── upsert user │             │  │
│  │                     │      └── return user │             │  │
│  │                     └──────────┬───────────┘             │  │
│  └─────────────────────────────────┼───────────────────────┘  │
│                                    │                          │
│                         Drizzle ORM                           │
│                                    │                          │
│                    @neondatabase/serverless                    │
└────────────────────────────┼──────────────────────────────────┘
                             │
                     ┌───────▼────────┐
                     │ Neon PostgreSQL │
                     │  (serverless)   │
                     │                 │
                     │ ┌─────────────┐ │
                     │ │ users       │ │
                     │ │ health_     │ │
                     │ │  entries    │ │
                     │ │ projects    │ │
                     │ │ blog_posts  │ │
                     │ │ comments    │ │
                     │ │ messages    │ │
                     │ │ experiences │ │
                     │ │ skills      │ │
                     │ └─────────────┘ │
                     └─────────────────┘
```

## Stack technique

| Couche | Technologie | Justification |
|---|---|---|
| Frontend | Nuxt 4 (Vue 3, TypeScript) | SSR, DX, file-based routing |
| Backend | Nitro Server Routes | Serverless-ready, integre a Nuxt |
| ORM | Drizzle ORM | Type-safe, leger, edge-compatible |
| DB Driver | @neondatabase/serverless | HTTP driver pour serverless |
| Base de donnees | Neon PostgreSQL | Serverless PostgreSQL, scaling auto |
| Auth | google-auth-library | Verification Google ID Tokens (stateless) |
| Migrations | drizzle-kit | Genere depuis le schema TypeScript |
| Hosting | Vercel | Serverless functions, edge network |
| i18n | Composable custom | FR/EN toggle reactif via useState |

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
│   │   └── health/             # Protected health endpoints
│   ├── db/                     # Schema Drizzle + seed + migrations
│   │   ├── schema.ts           # Tables: users, health_entries, projects, ...
│   │   ├── seed-health.ts      # Seed health data + project
│   │   ├── seed-blog-pushup.ts # Blog post about the pushup journey
│   │   └── migrate-health-to-user.ts  # One-time migration script
│   └── utils/
│       ├── db.ts               # Drizzle connection singleton
│       └── auth.ts             # requireAuth() — Google token verification
├── docs/                       # Architecture docs + ADRs
├── drizzle.config.ts           # Drizzle Kit config
└── nuxt.config.ts              # runtimeConfig: googleClientId, databaseUrl
```

## Schema de base de donnees

9 tables principales :

- **users** — Utilisateurs Google OAuth (email, name, picture, googleId)
- **health_entries** — Suivi quotidien de pushups (scoped par userId, contrainte unique userId+date)
- **projects** — Projets personnels (trilingue FR/EN/KM)
- **blog_posts** — Articles de blog (trilingue, Markdown)
- **comments** — Commentaires sur les articles (moderes)
- **messages** — Messages de contact (formulaire)
- **experiences** — Experiences CV (trilingue)
- **skills** — Competences techniques (groupees par categorie)
- **push_subscriptions** — Abonnements push web

> Voir [DATABASE.md](DATABASE.md) pour le schema detaille, les routes API et les scripts de seed.

## Authentification Google OAuth

### Flow

```
Android App                              Backend Nuxt/Nitro
  │                                          │
  │── Google Sign-In (Credential Manager)    │
  │   → obtient Google ID Token              │
  │                                          │
  │── GET /api/health/stats                  │
  │   Authorization: Bearer <idToken>  ────► │
  │                                          │── verifyIdToken() via google-auth-library
  │                                          │── upsert user dans table users
  │                                          │── query scopee au userId
  │◄──────────────────────────────────────── │── retourne les donnees
```

### Pourquoi pas de sessions ?

Le client principal est une app Android native. Les sessions/cookies sont pensees pour le web. L'approche stateless (Bearer token) est :
- Compatible avec le serverless Vercel (pas d'etat cote serveur)
- Simple a implementer cote Android (OkHttp interceptor)
- Securisee (tokens Google verifies cryptographiquement)

### requireAuth() (`server/utils/auth.ts`)

1. Extrait le Bearer token du header `Authorization`
2. Verifie le token avec `OAuth2Client.verifyIdToken()`
3. Upsert l'utilisateur (cree au premier login, met a jour name/picture sinon)
4. Gere la migration : si un user existe par email avec un googleId placeholder, le lie au vrai googleId
5. Retourne `{ id, email, name, picture }`
6. Throw 401 si token absent/invalide/expire

## Flux de donnees

1. **SSR** : Nuxt effectue le rendu cote serveur. Les pages appellent `useFetch()` qui hit les API routes.
2. **API Routes publiques** : Chaque route utilise `getDB()` qui cree une connexion Drizzle → Neon.
3. **API Routes protegees** : Les endpoints health appellent `requireAuth(event)` en debut de handler, puis filtrent avec `eq(healthEntries.userId, user.id)`.
4. **Neon** : Connexion HTTP (pas de pool TCP), ideal pour serverless.
5. **i18n** : Le composable `useI18n()` expose un `useState('locale')` reactif.

## Securite

- **Google OAuth** sur les endpoints health (Bearer token verifie)
- Validation des inputs sur toutes les routes POST
- Honeypot anti-spam sur le formulaire de contact
- Moderation des commentaires (approved = false par defaut)
- Pas de SQL injection grace a Drizzle (parameterized queries)
- `DATABASE_URL` et `GOOGLE_CLIENT_ID` en variables d'environnement (jamais dans le code)
- Donnees scopees par userId (aucun utilisateur ne peut voir les donnees d'un autre)
