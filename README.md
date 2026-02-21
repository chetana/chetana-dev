# chetana.dev

Portfolio dynamique, blog technique et projets personnels de **Chetana YIN** — Engineering Manager.

**Live** : [https://chetana.dev](https://chetana.dev)

## Stack

- **Nuxt 4** (Vue 3.5, TypeScript) — Frontend SSR + Server Routes (Nitro)
- **Neon PostgreSQL** — Base de donnees serverless
- **Drizzle ORM** — ORM type-safe
- **Vercel** — Deploiement serverless (auto-deploy on push to main)
- **@nuxtjs/seo** — Sitemap, robots.txt, Schema.org, OG meta
- **i18n** — Bilingue FR/EN via composable `useLocale()`

## Pages

| Route | Description |
|---|---|
| `/` | Homepage — hero, stats, about, experience timeline, skills, education, contact |
| `/projects` | Liste des projets personnels |
| `/projects/health` | Suivi quotidien de pompes (streak, calendrier, validation) |
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

## Setup local

```bash
# Cloner le repo
git clone https://github.com/chetana/chetana-dev.git
cd chetana-dev

# Installer les dependances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env.local
# Editer .env.local avec votre DATABASE_URL Neon

# Pousser le schema vers la DB
npm run db:push

# Seed des donnees initiales
npm run db:seed

# Lancer le dev server
npm run dev
```

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de developpement |
| `npm run build` | Build production (preset Vercel) |
| `npm run preview` | Preview du build |
| `npm run db:generate` | Generer les migrations SQL |
| `npm run db:push` | Pousser le schema vers la DB |
| `npm run db:seed` | Alimenter la DB (experiences, skills, projects, blog) |
| `npm run db:seed-health` | Seed des donnees health tracker (Jan-Fev 2026) |
| `npm run db:seed-blog-light` | Seed de l'article "Dark theme to light theme" |
| `npm run db:studio` | Ouvrir Drizzle Studio (GUI) |

## Structure du projet

```
app/
  assets/css/main.css    # Variables CSS, boutons, tags, cards, grids, responsive
  components/            # Nav, Hero, Footer, Timeline, SkillCard, BlogCard, ProjectCard, CommentSection
  composables/           # useLocale() (i18n FR/EN)
  pages/                 # Routes Nuxt (index, blog, projects, cv, contact)
server/
  api/                   # Routes REST (GET/POST: blog, projects, comments, experiences, skills, health)
  db/
    schema.ts            # Schema Drizzle (projects, blogPosts, comments, messages, experiences, healthEntries, skills)
    seed.ts              # Seed principal (experiences, skills, projects, blog posts)
    seed-health.ts       # Seed health tracker
    seed-blog-light.ts   # Seed article dark-to-light theme
  utils/db.ts            # Connexion Neon + fallback DATABASE_URL
drizzle/                 # Migrations auto-generees
```

## Base de donnees

7 tables PostgreSQL sur Neon :

| Table | Description |
|---|---|
| `experiences` | CV : postes, entreprises, bullets FR/EN |
| `skills` | Competences par categorie avec couleur |
| `projects` | Projets perso avec tags, GitHub/demo URLs |
| `blog_posts` | Articles bilingues FR/EN avec tags |
| `comments` | Commentaires sur les articles (moderation) |
| `messages` | Messages du formulaire contact |
| `health_entries` | Suivi quotidien pompes (date, count, validation) |

## API

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
| `/api/health/stats` | GET | Stats pompes (streak, total, today) |
| `/api/health/entries` | GET | Historique des jours |
| `/api/health/validate` | POST | Valider le jour courant |

## SEO

- `useSeoMeta()` sur chaque page (title, description, OG, Twitter)
- `useSchemaOrg()` pour Person (global) et BlogPosting (articles)
- Sitemap dynamique via `/api/__sitemap__/urls`
- CV en `noindex` via `routeRules`

## Deploiement Vercel

Le deploiement est automatique sur push to `main`.

- **Projet** : `chetana-cv`
- **Domaine** : chetana.dev
- **Variables d'env** : `NUXT_DATABASE_URL` + `DATABASE_URL`

## Blog

Le blog utilise un renderer markdown custom (pas de dependance externe) qui supporte :
- Headings (`##`, `###`)
- **Bold** et *italic*
- Listes a puces (`- item`) et ordonnees (`1. item`)
- Separateurs horizontaux (`---`)
- Paragraphes automatiques

### Articles

- **Claude Code en equipe** — Integration de l'IA dans le workflow engineering
- **Nuxt 4 + Neon + Drizzle** — Retour d'experience migration HTML statique vers stack moderne
- **Dark theme to light theme** — Pourquoi j'ai change apres 15 ans (article long, bilingue)

## Licence

MIT
