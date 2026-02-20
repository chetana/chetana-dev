# ADR 002 — Neon PostgreSQL comme base de données

## Statut
Accepté

## Contexte
Le site a besoin d'une base de données relationnelle pour stocker projets, articles, commentaires, messages et données CV. L'hébergement est serverless (Vercel).

## Décision
Utiliser **Neon PostgreSQL** avec le driver HTTP `@neondatabase/serverless`.

## Raisons
- PostgreSQL serverless : pas de serveur à gérer
- Driver HTTP : compatible avec les environnements edge/serverless (pas de TCP)
- Free tier généreux pour un site personnel
- Branching de DB pour le développement (feature de Neon)
- Auto-scaling et auto-suspend

## Alternatives considérées
- **Supabase** : plus lourd, SDK propre, features non nécessaires (auth, realtime)
- **PlanetScale** : MySQL, pas PostgreSQL
- **SQLite (Turso)** : moins de features SQL, écosystème plus jeune
- **PostgreSQL self-hosted** : overhead de gestion serveur

## Conséquences
- Dépendance au service Neon (vendor lock-in modéré, c'est du PostgreSQL standard)
- Latence légèrement supérieure au TCP direct (HTTP)
- Nécessité de configurer `DATABASE_URL` en variable d'environnement
