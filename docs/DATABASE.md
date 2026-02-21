# Base de donnees — Neon Serverless PostgreSQL

## Connexion

| Element | Detail |
|---------|--------|
| Driver | `@neondatabase/serverless` (HTTP, pas de pool TCP) |
| ORM | Drizzle ORM (type-safe, parameterized queries) |
| Helper | `server/utils/db.ts` → `getDB()` (singleton) |
| Config | `drizzle.config.ts` (dialect: postgresql) |
| Env vars | `DATABASE_URL` (Vercel) |

## Schema (`server/db/schema.ts`)

### users

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| email | varchar unique | Google email |
| name | varchar | Google display name |
| picture | text | Google profile picture URL |
| google_id | varchar unique | Google sub identifier |
| created_at | timestamp | Default: `now()` |
| last_login_at | timestamp | Updated on each auth call |

### health_entries

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| user_id | integer FK → users.id | Nullable (migration compat) |
| date | varchar | Format `"YYYY-MM-DD"` |
| pushups | integer | Objectif : 20 (avant 2026-02-17), 25 (apres) |
| validated | boolean | |
| validated_at | timestamp | |
| created_at | timestamp | |
| | | **Unique constraint**: `(user_id, date)` |

### projects

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| slug | varchar unique | URL slug |
| titleFr, titleEn, titleKm | text | Trilingue |
| descriptionFr, descriptionEn, descriptionKm | text | Trilingue |
| tags | jsonb | Tableau de strings |
| githubUrl, demoUrl, imageUrl | varchar | Liens optionnels |
| type | varchar | Default: `'project'` |
| featured | boolean | Mis en avant |
| createdAt | timestamp | Default: `now()` |

### blog_posts

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| slug | varchar unique | URL slug |
| titleFr, titleEn, titleKm | text | Trilingue |
| contentFr, contentEn, contentKm | text | Article complet (markdown) |
| excerptFr, excerptEn, excerptKm | text | Apercu |
| tags | jsonb | Tableau de strings |
| published | boolean | Seuls les publies sont affiches |
| createdAt, updatedAt | timestamp | |

### comments

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| postId | integer FK → blog_posts.id | |
| authorName | varchar | Max 100 caracteres |
| content | text | Max 2000 caracteres |
| approved | boolean | Default: `false` (moderation) |
| createdAt | timestamp | |

### messages

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| name | varchar | Max 100 caracteres |
| email | varchar | Valide par regex |
| content | text | Max 5000 caracteres |
| read | boolean | Default: `false` |
| createdAt | timestamp | |

### experiences

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| company | varchar | |
| roleFr, roleEn, roleKm | text | Trilingue |
| location | varchar | |
| dateStart, dateEnd | varchar | Format `"YYYY-MM"` |
| bulletsFr, bulletsEn, bulletsKm | jsonb | Tableaux de bullet points |
| sortOrder | integer | Ordre d'affichage |

### skills

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| category | varchar | Groupe (Backend, Frontend, Data...) |
| name | varchar | Nom de la competence |
| color | varchar | Couleur CSS pour le tag |
| sortOrder | integer | Ordre d'affichage |

### push_subscriptions

| Colonne | Type | Notes |
|---------|------|-------|
| id | serial PK | |
| endpoint | text unique | Push endpoint URL |
| p256dh | text | Public key |
| auth | text | Auth secret |
| createdAt | timestamp | |

## Routes API

### Lecture (GET) — publiques

| Route | Description | Filtrage |
|-------|-------------|----------|
| `GET /api/blog` | Liste des articles publies (sans contenu) | `published = true`, tri DESC createdAt |
| `GET /api/blog/:slug` | Article complet | `published = true` + slug |
| `GET /api/projects` | Tous les projets | Tri DESC createdAt |
| `GET /api/projects/:slug` | Projet par slug | |
| `GET /api/experiences` | Experiences CV | Tri ASC sortOrder |
| `GET /api/skills` | Competences groupees par categorie | Tri ASC sortOrder |
| `GET /api/comments/:postId` | Commentaires approuves d'un article | `approved = true` |

### Lecture (GET) — protegees (Google OAuth)

| Route | Description | Auth |
|-------|-------------|------|
| `GET /api/health/stats` | Statistiques pushups de l'utilisateur | Bearer token |
| `GET /api/health/entries` | Historique entries de l'utilisateur | Bearer token |

### Ecriture (POST)

| Route | Description | Auth |
|-------|-------------|------|
| `POST /api/comments` | Creer un commentaire | Publique (modere) |
| `POST /api/messages` | Envoyer un message contact | Publique (honeypot) |
| `POST /api/health/validate` | Valider les pushups du jour | Bearer token |

## Alimentation des donnees

### 1. Push du schema

```bash
npm run db:push          # drizzle-kit push → applique le schema sur Neon
```

### 2. Seed principal (`npm run db:seed`)

Script : `server/db/seed.ts` — experiences, competences, projets, articles initiaux

### 3. Seed health (`npm run db:seed-health`)

Script : `server/db/seed-health.ts` — entries pushups + projet `chet-health-strong`

### 4. Seed blog pushup

Script : `server/db/seed-blog-pushup.ts` — article "52 jours de pompes"

### 5. Migration health → multi-user

Script : `server/db/migrate-health-to-user.ts` — cree le user par defaut et assigne les entries existantes

### 6. Donnees creees en runtime

| Source | Table | Auth | Moderation |
|--------|-------|------|------------|
| Visiteurs (commentaires) | comments | Non | `approved: false` |
| Formulaire de contact | messages | Non | `read: false` |
| App Android (pushups) | health_entries | Google OAuth | Validation immediate |
| App Android (1er login) | users | Google OAuth | Auto-creation |
