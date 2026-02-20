# chetana.dev

Portfolio dynamique, blog technique et projets personnels de **Chetana YIN** — Engineering Manager.

## Stack

- **Nuxt 4** (Vue 3, TypeScript) — Frontend + Server Routes
- **Neon PostgreSQL** — Base de données serverless
- **Drizzle ORM** — ORM type-safe
- **Vercel** — Déploiement serverless

## Setup local

```bash
# Cloner le repo
git clone https://github.com/your-user/chetana-dev.git
cd chetana-dev

# Installer les dépendances
npm install

# Copier et configurer les variables d'environnement
cp .env.example .env
# Editer .env avec votre DATABASE_URL Neon

# Pousser le schéma vers la DB
npm run db:push

# Seed des données initiales
npm run db:seed

# Lancer le dev server
npm run dev
```

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build production |
| `npm run preview` | Preview du build |
| `npm run db:generate` | Générer les migrations SQL |
| `npm run db:push` | Pousser le schéma vers la DB |
| `npm run db:seed` | Alimenter la DB avec les données initiales |
| `npm run db:studio` | Ouvrir Drizzle Studio (GUI) |

## Structure

```
app/                  # Nuxt 4 app (pages, components, composables)
server/               # API routes + DB schema
  api/                # Routes GET/POST (projects, blog, comments, messages)
  db/                 # Schema Drizzle, connexion, seed
docs/                 # Architecture + ADRs
drizzle/              # Migrations auto-générées
```

## Déploiement Vercel

1. Connecter le repo GitHub à Vercel
2. Configurer la variable `DATABASE_URL` dans les settings Vercel
3. Déployer — Vercel détecte Nuxt automatiquement

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- ADRs dans `docs/adr/`

## Licence

MIT
