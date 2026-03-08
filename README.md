# chetana.dev

Portfolio dynamique, blog technique et projets personnels de **Chetana YIN** — Engineering Manager.

**Live** : [https://chetana.dev](https://chetana.dev)

## Stack

- **Nuxt 4** (Vue 3.5, TypeScript) — Frontend SSR + Server Routes (Nitro)
- **Neon PostgreSQL** — Base de donnees serverless
- **Drizzle ORM** — ORM type-safe
- **Vercel** — Deploiement serverless (auto-deploy on push to main)
- **Google OAuth** — Authentification stateless via ID Tokens (google-auth-library)
- **@nuxtjs/seo** — Sitemap, robots.txt, Schema.org, OG meta
- **i18n** — Trilingue FR/EN/KM via composable `useLocale()`

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — hero, stats, about, experience timeline, skills, education, contact |
| `/projects` | Liste des projets personnels |
| `/projects/health` | Suivi quotidien de pompes (streak, calendrier, validation) |
| `/projects/medialist` | Médiathèque — animés et jeux avec stats pondérées par note |
| `/projects/medialist/[slug]` | Détail d'un animé ou jeu + chat IA (Gemini) |
| `/projects/imagichet` | Génération et édition d'images avec Vertex AI Imagen 3 |
| `/blog` | Articles techniques et retours d'experience |
| `/blog/[slug]` | Article complet avec rendu markdown et commentaires |
| `/cv` | CV format A4 imprimable (PDF via `window.print()`) |
| `/contact` | Formulaire de contact |

## Design

### Light Theme

Le site utilise un **light theme** avec variables CSS centralisees :

```css
:root {
  --bg: #f8f9fa;
  --bg-card: #ffffff;
  --accent: #6c63ff;
  --accent-light: #5a52d5;
  --text: #1a1a2e;
  --text-muted: #6b7280;
  --border: #e5e7eb;
  --gradient: linear-gradient(135deg, #6c63ff 0%, #48c6ef 100%);
}
```

### Responsive mobile

Toutes les pages sont optimisees pour mobile (320px+) :

- Grids CSS avec `minmax(280px, 1fr)` pour le collapse automatique
- Breakpoints `@media (max-width: 768px)` pour les layouts principaux
- Breakpoint `@media (max-width: 480px)` pour le calendrier health
- `overflow-x: hidden` et `word-break: break-word` sur les contenus longs
- Navigation mobile avec hamburger menu et overlay

## Architecture

```
┌────────────────┐   ┌───────────────┐   ┌──────────────┐
│  Web Browser   │   │ Android App   │   │ Android      │
│  (SSR + SPA)   │   │ (Kotlin/MVVM) │   │ Widget       │
└───────┬────────┘   └───────┬───────┘   └──────┬───────┘
        │                    │ Bearer token      │
        ▼                    ▼                   ▼
┌──────────────────────────────────────────────────────┐
│              Nuxt 4 / Nitro (Vercel)                 │
│                                                       │
│  Public:                 Protected (OAuth 🔒):       │
│  /api/projects           /api/health/*               │
│  /api/blog               /api/coffre/*               │
│  /api/comments           /api/chat/*                 │
│  /api/messages           /api/medialist/*            │
│                          /api/imagenie/*             │
│                                                       │
│              requireAuth() → google-auth-library     │
└──────┬─────────────────────────┬─────────────────────┘
       │ Drizzle ORM             │ x-api-key
       ▼                         ▼
┌──────────────┐       ┌──────────────────────┐
│    Neon      │       │     chetaku-rs        │
│  PostgreSQL  │       │  (Axum / Cloud Run)   │
│  (9 tables)  │       │  media_entries table  │
└──────────────┘       └──────────┬────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │ Jikan API v4   RAWG API v1  │
                    │ (MyAnimeList)  (jeux vidéo) │
                    └────────────────────────────┘
```

> Voir [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) et [docs/DATABASE.md](docs/DATABASE.md) pour les details.

## Setup local

```bash
# Cloner le repo
git clone https://github.com/chetana/chetana-dev.git
cd chetana-dev

# Installer les dependances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env.local
# Editer .env.local avec DATABASE_URL et GOOGLE_CLIENT_ID

# Pousser le schema vers la DB
npm run db:push

# Seed des donnees initiales
npm run db:seed

# Lancer le dev server
npm run dev
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion Neon PostgreSQL |
| `GOOGLE_CLIENT_ID` | OAuth Web Client ID (Google Cloud Console) |
| `VAPID_PRIVATE_KEY` | Cle privee pour les push notifications |
| `VAPID_PUBLIC_KEY` | Cle publique pour les push notifications |
| `CRON_SECRET` | Secret pour les endpoints cron |
| `GCS_BUCKET_NAME` | Nom du bucket Google Cloud Storage (coffre chet_lys) |
| `GCS_SERVICE_ACCOUNT_JSON` | JSON stringifie du service account GCS (Storage Object Admin) |
| `RAWG_API_KEY` | Clé API rawg.io (medialist — sync jeux) |
| `CHETAKU_API_URL` | URL de chetaku-rs (défaut: `https://chetaku-rs-mef67kip3a-ew.a.run.app`) |
| `CHETAKU_API_KEY` | Clé secrète partagée avec chetaku-rs |
| `MEDIALIST_OWNER_EMAIL` | Email du propriétaire (seul autorisé à ajouter/éditer) |
| `VERTEX_PROJECT_ID` | Projet GCP pour Vertex AI Imagen (imagichet) |
| `VERTEX_LOCATION` | Région Vertex AI (ex: `us-central1`) |

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de developpement |
| `npm run build` | Build production (preset Vercel) |
| `npm run preview` | Preview du build |
| `npm run db:generate` | Generer les migrations SQL |
| `npm run db:push` | Pousser le schema vers la DB |
| `npm run db:seed` | Alimenter la DB (experiences, skills, projects, blog) |
| `npm run db:seed-health` | Seed des donnees health tracker + projet |
| `npm run db:seed-blog-light` | Seed de l'article "Dark theme to light theme" |
| `npm run db:studio` | Ouvrir Drizzle Studio (GUI) |

## Structure du projet

```
app/
  assets/css/main.css    # Variables CSS, boutons, tags, cards, grids, responsive
  components/            # Nav, Hero, Footer, Timeline, SkillCard, BlogCard, ProjectCard
  composables/           # useLocale() (i18n FR/EN/KM)
  pages/
    index.vue            # Homepage
    blog/                # Liste + detail articles
    projects/
      health.vue         # Health tracker (pompes)
      medialist/
        index.vue        # Médiathèque + section profil stats
        [slug].vue       # Detail animé/jeu + chat IA Gemini
      imagichet.vue      # Génération d'images Imagen 3
server/
  api/                   # Routes REST
    health/              # Endpoints proteges (Google OAuth) — daily pushup tracker
    coffre/              # Endpoints proteges (Google OAuth) — coffre a souvenirs chet_lys
    chat/                # Chat chet_lys (messages GCS + traductions Gemini)
    medialist/
      sync.post.ts       # Proxy POST /sync vers chetaku-rs (protege, owner only)
      update.post.ts     # Proxy PATCH /media/{id} vers chetaku-rs (protege)
      chat.post.ts       # Chat IA sur un animé/jeu (Gemini + Google Search)
    imagenie/
      generate.post.ts   # Génération image Imagen 3 (generate, bgswap)
  middleware/
    cors.ts              # CORS pour /api/coffre/* (chetlys.vercel.app)
  utils/
    db.ts                # Connexion Neon singleton
    auth.ts              # requireAuth() — verification Google ID Token + upsert user
    gcs.ts               # GCS bucket + signed URLs v4 (Node.js crypto natif)
    vertex.ts            # Fonctions Gemini (translate, transcribe, suggest, chat)
    imagen.ts            # Fonctions Imagen 3 (generate, bgswap)
  db/
    schema.ts            # Schema Drizzle
    seed.ts              # Seeds
cors.json                # Config CORS du bucket GCS
drizzle/                 # Migrations auto-generees
docs/                    # Architecture, Database, Medialist, ADRs
```

## Base de donnees

9 tables PostgreSQL sur Neon :

| Table | Description | Auth |
|---|---|---|
| `users` | Utilisateurs Google OAuth (email, name, picture, googleId) | — |
| `health_entries` | Suivi quotidien pompes (scoped par userId) | Google OAuth |
| `projects` | Projets perso avec tags, GitHub/demo URLs | Public |
| `blog_posts` | Articles trilingues FR/EN/KM avec tags | Public |
| `comments` | Commentaires sur les articles (moderation) | Public |
| `messages` | Messages du formulaire contact | Public |
| `experiences` | CV : postes, entreprises, bullets trilingues | Public |
| `skills` | Competences par categorie avec couleur | Public |
| `push_subscriptions` | Abonnements push web | Public |

## API

### Endpoints publics

| Endpoint | Methode | Description |
|---|---|---|
| `/api/experiences` | GET | Liste des experiences CV |
| `/api/skills` | GET | Skills groupes par categorie |
| `/api/projects` | GET | Liste des projets |
| `/api/projects/[slug]` | GET | Detail d'un projet |
| `/api/blog` | GET | Liste des articles publies |
| `/api/blog/[slug]` | GET | Detail d'un article |
| `/api/comments/[postId]` | GET | Commentaires d'un article |
| `/api/comments` | POST | Ajouter un commentaire |
| `/api/contact` | POST | Envoyer un message |

### Endpoints proteges (Google OAuth)

Requierent `Authorization: Bearer <google_id_token>` :

| Endpoint | Methode | Description |
|---|---|---|
| `/api/health/stats` | GET | Stats pompes de l'utilisateur (streak, total, today) |
| `/api/health/entries` | GET | Historique des jours de l'utilisateur |
| `/api/health/validate` | POST | Valider le jour courant pour l'utilisateur |
| `/api/coffre/list?prefix=` | GET | Liste les objets GCS avec delimiter `/` |
| `/api/coffre/sign-upload` | POST | Genere un signed URL PUT v4 (15 min) |
| `/api/coffre/sign-download?path=` | GET | Genere un signed URL GET v4 (1h) |
| `/api/coffre/delete?path=` | DELETE | Supprime un objet GCS |
| `/api/chat/messages?y=&m=&d=` | GET | Liste les messages GCS du jour |
| `/api/chat/messages?y=&m=&d=` | POST | Envoie un message (traduit automatiquement via Gemini) |
| `/api/chat/messages?y=&m=&d=&id=` | DELETE | Supprime un message (auteur uniquement) |
| `/api/chat/transcribe` | POST | Transcrit un audio base64 → texte + 3 traductions (Gemini) |
| `/api/chat/suggest` | POST | Suggestion/correction + traductions + lecon grammaticale (Gemini) |
| `/api/medialist/sync` | POST | Sync anime/game vers chetaku-rs (owner only) |
| `/api/medialist/update` | POST | Met à jour une entrée dans chetaku-rs (owner only) |
| `/api/medialist/chat` | POST | Chat IA Gemini sur un animé/jeu avec Google Search |
| `/api/imagenie/generate` | POST | Génère ou édite une image via Vertex AI Imagen 3 |

## Médiathèque (medialist)

Suivi d'animés et de jeux vidéo consommant l'API [chetaku-rs](https://github.com/chetana/chetaku-rs).

- **Liste** filtrée par type/statut, ajout et édition (owner only via Google OAuth)
- **Sync auto** depuis Jikan (MyAnimeList) et RAWG — métadonnées, cover, genres, studio
- **Section Profil** : genres pondérés par `love_score = count × avg_score`, distribution des notes, statuts, studios/devs favoris
- **Page détail** : chat IA contextuel (Gemini + Google Search grounding)

> Voir [docs/MEDIALIST.md](docs/MEDIALIST.md) pour les détails techniques.

## ImagiChet (imagichet)

Génération et édition d'images via **Vertex AI Imagen 3** (GCP project `cykt-399216`).

- **Mode génération** : texte → image (prompt, aspect ratio, seed optionnel)
- **Mode BGSWAP** : remplace l'arrière-plan d'une image avec un sujet + prompt décor
- Galerie persistante (GCS `gallery.json`) avec badges de mode
- Upload du sujet avec preview + compression 1024px

## Chat chet_lys

API chat pour l'application couple [chetlys.vercel.app](https://chetlys.vercel.app).

Messages stockes dans GCS : `chat/YYYY/MM/DD.json` (tableau de `ChatMessage`).

```typescript
interface ChatMessage {
  id: string       // `${Date.now()}-${random}`
  author: string   // prenom Google (firstName)
  text: string     // texte original
  fr: string       // traduction francaise (Gemini)
  en: string       // traduction anglaise (Gemini)
  kh: string       // traduction khmere (Gemini)
  ts: string       // ISO timestamp
  image?: string   // chemin GCS (YYYY/MM/DD/filename)
  source?: 'audio' // message transcrit depuis un vocal
}
```

### Fonctions Vertex AI (`server/utils/vertex.ts`)

| Fonction | Description |
|---|---|
| `geminiTranslateAll(text)` | Detecte la langue, corrige, traduit FR/EN/KH |
| `geminiTranscribeAndTranslate(audio, mime)` | Transcrit un audio + traduit en 3 langues |
| `geminiSuggest(text, lang)` | Correction + traductions + `lesson?` (explication grammaticale en FR ou KH) |

> ⚠️ `gemini-2.5-flash` active le thinking par defaut — toujours ajouter `thinkingConfig: { thinkingBudget: 0 }` dans `generationConfig`.

## Android Companion App

L'application Android native ([repo](https://github.com/chetana/dailypushup)) consomme les endpoints health :

- **Kotlin** / MVVM / Room (cache offline) / Retrofit 2
- **Google Sign-In** via Credential Manager → Bearer token
- **Widget home screen** avec streak 🔥 et validation one-tap ✅
- **WorkManager** sync toutes les 30 minutes
- **Light mode** avec le meme style beige/or que le portfolio

## SEO

- `useSeoMeta()` sur chaque page (title, description, OG, Twitter)
- `useSchemaOrg()` pour Person (global) et BlogPosting (articles)
- Sitemap dynamique via `/api/__sitemap__/urls`
- CV en `noindex` via `routeRules`

## Deploiement Vercel

⚠️ **Le deploiement n'est PAS automatique sur push** — toujours lancer manuellement :

```bash
git push origin main
npx vercel deploy --prod
```

Ne jamais utiliser `--prebuilt` : Vercel doit builder côté serveur pour installer correctement les dépendances Node.

- **Projet** : `chetana-cv`
- **Domaine** : chetana.dev
- **Variables d'env** : voir section "Variables d'environnement" ci-dessus

## Blog

Le blog utilise un renderer markdown custom (pas de dependance externe) qui supporte :
- Headings (`##`, `###`)
- **Bold** et *italic*
- Listes a puces (`- item`) et ordonnees (`1. item`)
- Separateurs horizontaux (`---`)
- Paragraphes automatiques

### Articles

- **52 jours de pompes** — Comment j'ai gamifie ma discipline avec du code, Android + OAuth
- **Claude Code en equipe** — Integration de l'IA dans le workflow engineering
- **Nuxt 4 + Neon + Drizzle** — Retour d'experience migration HTML statique vers stack moderne
- **Dark theme to light theme** — Pourquoi j'ai change apres 15 ans

## Documentation

- [Architecture](docs/ARCHITECTURE.md) — Vue d'ensemble, schema, auth flow
- [Database](docs/DATABASE.md) — Schema detaille, routes, seeds
- [Medialist](docs/MEDIALIST.md) — Fonctionnalités médiathèque + chetaku-rs
- [ADRs](docs/adr/) — Decisions architecturales

## Licence

MIT
