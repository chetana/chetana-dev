# Base de données — Neon Serverless PostgreSQL

## Connexion

| Élément | Détail |
|---------|--------|
| Driver | `@neondatabase/serverless` (HTTP, pas de pool TCP) |
| ORM | Drizzle ORM (type-safe, parameterized queries) |
| Helper | `server/utils/db.ts` → `getDB()` (singleton) |
| Config | `drizzle.config.ts` (dialect: postgresql) |
| Env vars | `NUXT_DATABASE_URL` + `DATABASE_URL` (Vercel) |

## Schéma (`server/db/schema.ts`)

### projects

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| slug | varchar unique | URL slug |
| titleFr, titleEn | text | Bilingue |
| descriptionFr, descriptionEn | text | Bilingue |
| tags | jsonb | Tableau de strings |
| githubUrl, demoUrl, imageUrl | varchar | Liens optionnels |
| type | varchar | Default: `'project'` |
| featured | boolean | Mis en avant |
| createdAt | timestamp | Default: `now()` |

### blogPosts

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| slug | varchar unique | URL slug |
| titleFr, titleEn | text | Bilingue |
| contentFr, contentEn | text | Article complet (markdown basique) |
| excerptFr, excerptEn | text | Aperçu |
| tags | jsonb | Tableau de strings |
| published | boolean | Seuls les publiés sont affichés |
| createdAt, updatedAt | timestamp | |

### comments

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| postId | integer FK → blogPosts.id | |
| authorName | varchar | Max 100 caractères |
| content | text | Max 2000 caractères, anti-spam (>2 liens rejeté) |
| approved | boolean | Default: `false` (modération) |
| createdAt | timestamp | |

### messages

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| name | varchar | Max 100 caractères |
| email | varchar | Validé par regex |
| content | text | Max 5000 caractères |
| read | boolean | Default: `false` |
| createdAt | timestamp | |

### experiences

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| company | varchar | |
| roleFr, roleEn | text | Bilingue |
| location | varchar | |
| dateStart, dateEnd | varchar | Format `"YYYY-MM"` |
| bulletsFr, bulletsEn | jsonb | Tableaux de bullet points (peut contenir du HTML) |
| sortOrder | integer | Ordre d'affichage |

### skills

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| category | varchar | Groupe (Backend, Frontend, Data…) |
| name | varchar | Nom de la compétence |
| color | varchar | Couleur CSS pour le tag |
| sortOrder | integer | Ordre d'affichage |

### healthEntries

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| date | varchar unique | Format `"YYYY-MM-DD"` |
| pushups | integer | Objectif : 20 (avant 2026-02-17), 25 (après) |
| validated | boolean | |
| validatedAt | timestamp | |
| createdAt | timestamp | |

## Routes API

### Lecture (GET)

| Route | Description | Filtrage |
|-------|-------------|----------|
| `GET /api/blog` | Liste des articles publiés (sans contenu) | `published = true`, tri DESC createdAt |
| `GET /api/blog/:slug` | Article complet | `published = true` + slug |
| `GET /api/projects` | Tous les projets | Tri DESC createdAt |
| `GET /api/projects/:slug` | Projet par slug | |
| `GET /api/experiences` | Expériences CV | Tri ASC sortOrder |
| `GET /api/skills` | Compétences groupées par catégorie | Tri ASC sortOrder |
| `GET /api/comments/:postId` | Commentaires approuvés d'un article | `approved = true`, tri DESC createdAt |
| `GET /api/health/entries` | Toutes les entrées santé | Tri ASC date |
| `GET /api/health/stats` | Statistiques (streaks, totaux, objectif) | Calculé dynamiquement |
| `GET /api/__sitemap__/urls` | Entrées dynamiques pour le sitemap | Blog publiés + projets |

### Écriture (POST)

| Route | Description | Validation |
|-------|-------------|------------|
| `POST /api/comments` | Créer un commentaire | `postId`, `authorName` (100 chars), `content` (2000 chars, max 2 liens) |
| `POST /api/messages` | Envoyer un message contact | `name` (100 chars), `email` (regex), `content` (5000 chars), honeypot `website` |
| `POST /api/health/validate` | Valider les pushups du jour | Crée ou met à jour l'entrée du jour |

## Alimentation des données

### 1. Push du schéma

```bash
npm run db:push          # drizzle-kit push → applique le schéma sur Neon
```

### 2. Seed principal (`npm run db:seed`)

Script : `server/db/seed.ts`

Crée les données initiales :
- **6 expériences** : miLibris (2012) → Kelkoo (2014) → S4M (2016) → Smart&Soft (2017) → DJUST (2019) → DJUST actuel (2023)
- **40+ compétences** groupées en 6 catégories : Backend, Data & Infra, Domaine métier, Management, Frontend & Mobile, AI-Augmented Dev
- **2 projets** : chetana-dev (portfolio), claude-code-skills
- **2 articles de blog** : claude-code-equipe-engineering, nuxt4-neon-drizzle-portfolio

### 3. Seed health (`npm run db:seed-health`)

Script : `server/db/seed-health.ts`

- Entrées du 1er janvier au 21 février 2026 (toutes validées)
- 20 pushups/jour avant le 17 février, 25 après
- Crée aussi le projet `chet-health-strong`

### 4. Seed blog light (`npm run db:seed-blog-light`)

Script : `server/db/seed-blog-light.ts`

- Article unique bilingue : "Du thème sombre au thème clair : pourquoi j'ai changé après 15 ans"

### 5. Données créées en runtime

| Source | Table | Modération |
|--------|-------|------------|
| Visiteurs (commentaires) | comments | `approved: false` par défaut |
| Formulaire de contact | messages | `read: false` par défaut |
| Bouton pushups quotidien | healthEntries | Validation immédiate |

### Pas d'interface admin

Le contenu (articles, projets, expériences, compétences) est géré via les scripts de seed ou accès direct à la base. Il n'y a pas de CMS ni de panneau d'administration.
