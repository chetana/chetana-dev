# ADR 003 — Drizzle ORM

## Statut
Accepté

## Contexte
On a besoin d'un ORM/query builder pour interagir avec PostgreSQL de manière type-safe depuis TypeScript.

## Décision
Utiliser **Drizzle ORM** avec `drizzle-kit` pour les migrations.

## Raisons
- Type-safe de bout en bout (schéma TypeScript → requêtes typées)
- Léger (~7KB), pas de runtime lourd
- Compatible avec le driver HTTP de Neon
- Migrations générées automatiquement depuis le schéma
- API intuitive proche du SQL

## Alternatives considérées
- **Prisma** : plus lourd, nécessite un runtime binaire, moins adapté au serverless edge
- **Kysely** : bon query builder mais pas de schéma déclaratif natif
- **SQL brut** : pas de type-safety, risque d'erreurs

## Conséquences
- Le schéma est défini en TypeScript (`server/db/schema.ts`)
- Les migrations sont générées avec `drizzle-kit generate` et appliquées avec `drizzle-kit push`
