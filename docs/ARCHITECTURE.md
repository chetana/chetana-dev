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
│  │  │             │     │  /api/coffre/*        🔒     │   │  │
│  │  │             │     │  /api/chat/*          🔒     │   │  │
│  │  │             │     │  /api/medialist/*     🔒     │   │  │
│  │  │             │     │  /api/imagenie/*      🔒     │   │  │
│  │  └─────────────┘     └────────┬────────────────────┘   │  │
│  │                                │                        │  │
│  │                     ┌──────────▼──────────┐             │  │
│  │                     │  server/utils/       │             │  │
│  │                     │  ├── db.ts (Drizzle) │             │  │
│  │                     │  ├── auth.ts         │             │  │
│  │                     │  ├── gcs.ts          │             │  │
│  │                     │  ├── vertex.ts       │             │  │
│  │                     │  └── imagen.ts       │             │  │
│  │                     └──────────┬───────────┘             │  │
│  └─────────────────────────────────┼───────────────────────┘  │
│                                    │                          │
│                         Drizzle ORM                           │
│                                    │                          │
│                    @neondatabase/serverless                    │
└────────────────────────────┼──────────────────────────────────┘
                             │
               ┌─────────────┼──────────────────────┐
               ▼             ▼                       ▼
       ┌───────────────┐  ┌──────────────────┐  ┌──────────────────┐
       │ Neon          │  │   chetaku-rs     │  │ Google Cloud     │
       │ PostgreSQL    │  │   (Axum/Cloud    │  │ Storage (GCS)    │
       │ (3 tables)    │  │   Run, Rust)     │  │ chat/, coffre/,  │
       └───────────────┘  │   media_entries  │  │ gallery.json     │
                          └────────┬─────────┘  └──────────────────┘
                                   │
                        ┌──────────┴──────────────────┐
                        ▼             ▼                ▼
                   ┌──────────┐  ┌──────────┐  ┌──────────┐
                   │  Jikan   │  │   RAWG   │  │   TMDB   │
                   │ (MAL v4) │  │ (games)  │  │  (v3)    │
                   └──────────┘  └──────────┘  └──────────┘
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
│   ├── pages/
│   │   ├── index.vue
│   │   ├── blog/
│   │   ├── projects/
│   │   │   └── imagichet.vue   # Génération images Imagen 3
│   │   ├── passions/
│   │   │   ├── index.vue       # Cartes TCG interactives (Médiathèque, Vélo, Voyage)
│   │   │   └── medialist/
│   │   │       ├── index.vue   # Liste + section profil stats
│   │   │       └── [slug].vue  # Détail + chat IA Gemini
│   │   └── ...
│   ├── components/             # Vue components (auto-imported)
│   ├── composables/            # Composables (auto-imported)
│   └── assets/css/             # CSS global
├── server/
│   ├── api/                    # Nitro API routes
│   │   ├── coffre/             # Protected — GCS file manager
│   │   ├── chat/               # Protected — chat chet_lys (GCS + Gemini)
│   │   ├── medialist/          # Protected — proxy chetaku-rs + enrichissement TMDB
│   │   │   ├── search.get.ts
│   │   │   ├── add.post.ts
│   │   │   ├── update.post.ts
│   │   │   ├── [id].delete.ts
│   │   │   ├── detail.get.ts
│   │   │   └── chat.post.ts
│   │   └── imagenie/           # Protected — Vertex AI Imagen 3
│   │       └── generate.post.ts
│   ├── db/                     # Schema Drizzle + seeds + migrations
│   ├── middleware/
│   │   └── cors.ts             # CORS pour /api/coffre/*
│   └── utils/
│       ├── db.ts               # Drizzle connection singleton
│       ├── auth.ts             # requireAuth() — Google token verification
│       ├── gcs.ts              # GCS bucket + signed URLs v4
│       ├── vertex.ts           # Gemini (translate, suggest, transcribe, chat)
│       └── imagen.ts           # Imagen 3 (generate, bgswap)
├── docs/                       # Architecture docs + ADRs
├── drizzle.config.ts
└── nuxt.config.ts              # runtimeConfig: all env vars
```

## Schema de base de donnees

Les tables Neon gérées par chetana-dev (Drizzle) :

- **users** — Utilisateurs Google OAuth (email, name, picture, googleId)
- **comments** — Commentaires sur les articles (moderes)
- **messages** — Messages de contact (formulaire)

> Les données portfolio (blog_posts, projects, experiences, skills, media_entries) sont gérées par **chetaku-rs** (`api.chetana.dev`). Le suivi de pompes (health_entries, push_subscriptions) est géré par **pushup-tracker** (`pushup.chetana.dev`).

> Voir [DATABASE.md](DATABASE.md) pour le schema detaille, les routes API et les scripts de seed.

## Authentification Google OAuth

### Flow

```
Web Browser / App                        Backend Nuxt/Nitro
  │                                          │
  │── Google Sign-In (GIS / Credential Mgr)  │
  │   → obtient Google ID Token              │
  │                                          │
  │── GET /api/coffre/list                   │
  │   Authorization: Bearer <idToken>  ────► │
  │                                          │── verifyIdToken() via google-auth-library
  │                                          │── upsert user dans table users
  │                                          │── retourne les donnees
  │◄──────────────────────────────────────── │
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
2. **API Routes portfolio** (`/api/blog`, `/api/projects`, `/api/experiences`, `/api/skills`) : Ces routes proxient vers `api.chetana.dev` (chetaku-rs) via `$fetch`. Les réponses snake_case sont converties en camelCase pour les composants Vue (ex : `date_start → dateStart`, `role_fr → roleFr`).
3. **API Routes publiques directes** (`/api/comments`, `/api/messages`) : Utilisent `getDB()` → Drizzle → Neon.
4. **API Routes protegees** : Les endpoints coffre/chat/medialist/imagenie appellent `requireAuth(event)` en debut de handler.
5. **Neon** : Connexion HTTP (pas de pool TCP), ideal pour serverless.
6. **i18n** : Le composable `useI18n()` expose un `useState('locale')` reactif.

## Chat chet_lys

API chat temps réel pour [chetlys.vercel.app](https://chetlys.vercel.app).

Messages stockés dans GCS : `chat/YYYY/MM/DD.json` (tableau de `ChatMessage`).

### Fichiers chat

```
server/
  api/chat/
    messages.get.ts    # GET  — liste les messages du jour
    messages.post.ts   # POST — sauvegarde + traduit via Gemini si traductions vides
    messages.delete.ts # DELETE — vérifie auteur === user.firstName
    transcribe.post.ts # POST — audio base64 → texte + 3 traductions (Gemini)
    suggest.post.ts    # POST — correction + traductions + leçon grammaticale
  utils/
    vertex.ts          # geminiTranslateAll, geminiTranscribeAndTranslate, geminiSuggest
```

### Fonctions Vertex AI (`vertex.ts`)

| Fonction | maxTokens | Description |
|---|---|---|
| `coupleContext(author?)` | — | Contexte partagé : genre (Chet=homme), pronoms bang/oun, NFD normalization |
| `geminiTranslateAll(text, author?)` | 300 | Detecte langue, corrige, traduit FR/EN/KH — retourne `lang` |
| `geminiTranscribeAndTranslate(audio, mime, author?)` | 500 | Transcrit audio + traduit |
| `geminiSuggest(text, authorLang)` | 500 | Correction + traductions + `lesson?` |

`coupleContext(author?)` est injecté dans les 3 fonctions Gemini pour :
- Préciser que Chet est un HOMME (accord masculin obligatoire)
- Définir les pronoms khmer : Chet = "bang" (បង), Lys = "oun" (អូន)
- Détecter "Chétana" via NFD normalization + regex `/^(chet|chetana)$/i`

`GeminiSuggestion.lesson` : explication grammaticale dans la **langue NATALE** de l'auteur (FR pour Chet, KH pour Lys, quelle que soit la langue du message) — absent si aucune faute.

`authorLang` dans `suggest.post.ts` : déterminé **côté backend** depuis le token Google (`requireAuth`) — même NFD normalization que `coupleContext`.

> ⚠️ `gemini-2.5-flash` thinking activé par défaut → toujours ajouter `thinkingConfig: { thinkingBudget: 0 }` dans `generationConfig`.

---

## Section Passions (`/passions`)

Page de loisirs personnels avec des cartes TCG interactives, accessible depuis la navigation principale (lien "Passions" dans `Nav.vue`, clé i18n `nav.passions`).

### Cartes TCG

4 cartes affichées en grille desktop / carousel mobile avec scroll-snap :

| Carte | Statut | Route | Accent |
|---|---|---|---|
| Médiathèque | Live | `/passions/medialist` | violet |
| Vélo | Live | `/passions/velo` | bleu |
| Natation | Live | `/passions/natation` | cyan |
| Course | Live | `/passions/course` | orange |
| Voyage | Bientôt | — | vert |

### Effet interactif desktop

- `mousemove` → `perspective(800px) rotateX/rotateY` (effet tilt 3D)
- Shine radial positionné dynamiquement selon la position de la souris dans la carte

### Scroll-snap mobile

```css
.cards-wrapper {
  display: flex;
  overflow-x: auto;
  scroll-snap-type: x mandatory;
}
.card {
  scroll-snap-align: center;
}
```

Chaque carte occupe 100% de la largeur. Le swipe horizontal ne bloque pas le scroll vertical natif.

### Entrance animations

`IntersectionObserver` sur chaque carte : à chaque fois qu'une carte entre dans le viewport (snap), une animation tilt-in sinusoïdale (~800ms) est déclenchée.

Dots de navigation cliquables en bas de l'écran — `activeIdx` est mis à jour réactivement via l'observer.

### Routing médiathèque

La médiathèque a été déplacée de `/projects/medialist` vers `/passions/medialist` :

- Fichiers : `app/pages/passions/medialist/index.vue` + `[slug].vue`
- Back-links dans les pages détail pointent vers `/passions` (← Passions)
- L'ancien slug `/projects/medialist` dans la DB pointe désormais vers `demoUrl: https://chetana.dev/passions/medialist`
- La route `/projects/[slug].vue` sert désormais le rendu d'articles projet depuis la DB

### Pages Strava (Vélo / Natation / Course)

Les pages `/passions/velo`, `/passions/natation` et `/passions/course` appellent **directement** l'API chetaku-rs depuis le client (pas de proxy Nuxt) :

```typescript
const API_BASE = 'https://chetaku-rs-267131866578.europe-west1.run.app'
const { data: stats } = useFetch(`${API_BASE}/strava/stats?sport=cycling`)
const { data: activities } = useFetch(`${API_BASE}/strava/activities?sport=cycling`)
```

Les endpoints sont publics (GET uniquement) — pas besoin de proxy pour masquer une clé. Le POST `/strava/sync` (protégé par `x-api-key`) est déclenché manuellement, pas depuis le frontend.

---

## Coffre a souvenirs — chet_lys

API GCS pour l'application SvelteKit `chet_lys` (chetlys.vercel.app). Permet d'uploader, lister, telecharger et supprimer des photos/videos stockees dans Google Cloud Storage.

### Fichiers

```
server/
  api/coffre/
    list.get.ts          # GET /api/coffre/list?prefix=YYYY/MM/DD/
    sign-upload.post.ts  # POST /api/coffre/sign-upload { path, contentType }
    sign-download.get.ts # GET /api/coffre/sign-download?path=
    delete.delete.ts     # DELETE /api/coffre/delete?path=
  middleware/
    cors.ts              # CORS pour /api/coffre/* — autorise chetlys.vercel.app
  utils/
    gcs.ts               # getGcsBucket() + signedPutUrl() + signedGetUrl()
cors.json                # Config CORS bucket GCS (PUT/GET depuis chetlys.vercel.app)
```

### Signed URLs v4 (Node.js natif)

Le SDK `@google-cloud/storage` est bundle par Nitro/Rollup, ce qui casse ses prototypes de classes. La solution : implementation v4 avec le module `crypto` natif de Node.js (`createHash`, `createSign`).

```
Canonical request :
  METHOD\n/bucket/path\nqueryString\ncanonicalHeaders\nsignedHeaders\nUNSIGNED-PAYLOAD
  → SHA-256(canonicalRequest) = hash
  → stringToSign = "GOOG4-RSA-SHA256\ndatetime\nscope\nhash"
  → signature = RSA-SHA256(stringToSign, private_key) en hex
  → URL : https://storage.googleapis.com/bucket/path?...&X-Goog-Signature=<hex>
```

Toutes les variables d'environnement sont lues avec `.trim()` pour eviter les `%0A` dans les URLs (Vercel ajoute parfois un `\n` en fin de valeur).

### Convention de nommage GCS

```
YYYY/MM/DD/filename.ext
```

Le prefix seul suffit pour le drill-down temporel, sans base de donnees.

### CORS

Deux niveaux :
1. **Nuxt middleware** `cors.ts` : permet a `chetlys.vercel.app` d'appeler `chetana.dev/api/coffre/*`
2. **Bucket GCS** (`cors.json`) : permet a `chetlys.vercel.app` de faire des PUT directs sur GCS

## Services externes

### pushup-tracker (Nuxt — Cloud Run)

Suivi quotidien de pompes extrait dans un service dédié. Exposé via `pushup.chetana.dev`.

- **URL** : `https://pushup.chetana.dev` (alias de `pushup-tracker-267131866578.europe-west1.run.app`)
- **Repo** : `pushup-tracker` — Nuxt 3, node-server preset, Cloud Run europe-west1
- **DB** : tables `users`, `health_entries`, `push_subscriptions` dans le même Neon PostgreSQL
- **Auth** : Google OAuth (même flow Bearer token)
- **Notifications push** : web-push + Cloud Scheduler (4x/jour)
- **Redirect** : `chetana.dev/projects/health` → 301 vers `pushup.chetana.dev`

### chetaku-rs (Rust/Axum — Cloud Run)

Service dédié au portfolio, à la médiathèque et aux activités sportives Strava, hébergé sur Cloud Run (`europe-west1`). Exposé publiquement via le domaine `api.chetana.dev`.

- **URL** : `https://chetaku-rs-267131866578.europe-west1.run.app` (alias `api.chetana.dev`)
- **Auth** : header `x-api-key` sur les endpoints d'écriture
- **DB** : tables `blog_posts`, `projects`, `experiences`, `skills`, `media_entries`, `strava_activities`, `stats_cache` dans Neon PostgreSQL
- **Sources** : Jikan (MyAnimeList), RAWG (jeux), TMDB (films/séries), Strava API v3

**Endpoints portfolio** (`/blog`, `/projects`, `/experiences`, `/skills`) : Nuxt proxie ces endpoints via `server/api/`. Les réponses snake_case sont mappées en camelCase avant d'être retournées au client.

**Endpoints médiathèque** : Nuxt appelle via proxies `server/api/medialist/` — l'API key n'est jamais exposée au client. La page `/passions/medialist` est **en lecture seule** ; la gestion (ajout/édition/suppression) se fait via `admin.chetana.dev`.

**Endpoints Strava** (`/strava/activities`, `/strava/stats`) : publics — appelés directement depuis les pages velo/natation/course sans proxy Nuxt.

**Cache DB** (`stats_cache`) : les agrégations coûteuses sont mises en cache dans `stats_cache` (TTL 30s). Indispensable sur Cloud Run scale-to-zero — aucun cache in-memory ne survit aux redémarrages.

> Voir [docs/MEDIALIST.md](MEDIALIST.md) et le [README chetaku-rs](https://github.com/chetana/chetaku-rs).

### Google Cloud Storage (GCS)

Bucket GCS pour :
- **Chat chet_lys** : `chat/YYYY/MM/DD.json` (messages JSON), `YYYY/MM/DD/filename` (images)
- **Coffre chet_lys** : `YYYY/MM/DD/filename` (photos/vidéos)
- **ImagiChet** : `gallery.json` (métadonnées galerie), images générées

### Vertex AI (GCP `cykt-399216`)

- **Gemini** (`gemini-2.5-flash`) : traduction, transcription audio, correction grammaticale, chat IA contextuel
- **Imagen 3** : génération d'images (texte → image, BGSWAP)
- Auth : service account `coffre-backend@cykt-399216.iam.gserviceaccount.com` via JWT RS256

> ⚠️ `thinkingConfig: { thinkingBudget: 0 }` obligatoire pour Gemini 2.5 Flash (sinon les tokens de thinking consomment tout `maxOutputTokens`).

---

## Securite

- **Google OAuth** sur tous les endpoints proteges (coffre, chat, medialist, imagenie) — Bearer token verifie
- Validation des inputs sur toutes les routes POST
- Honeypot anti-spam sur le formulaire de contact
- Moderation des commentaires (approved = false par defaut)
- Pas de SQL injection grace a Drizzle (parameterized queries)
- `DATABASE_URL`, `GOOGLE_CLIENT_ID`, `GCS_*` en variables d'environnement (jamais dans le code)
- Donnees scopees par userId (aucun utilisateur ne peut voir les donnees d'un autre)
- Signed URLs GCS avec expiration courte (PUT: 15 min, GET: 1h)
