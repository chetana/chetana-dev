# ADR 001 — Nuxt 4 comme framework frontend/backend

## Statut
Accepté

## Contexte
Le site actuel est en HTML/CSS/JS pur. On veut ajouter un blog, des projets, des commentaires et un formulaire de contact. Il faut un framework qui gère à la fois le frontend et le backend (API).

## Décision
Utiliser **Nuxt 4** (Vue 3, TypeScript) avec les server routes Nitro pour les API.

## Raisons
- SSR natif pour le SEO
- Server routes intégrées (pas besoin d'un backend séparé)
- File-based routing
- Auto-import des composants et composables
- Déploiement Vercel en un clic (preset `vercel`)
- Compatibilité Nuxt 4 via `future.compatibilityVersion: 4`

## Alternatives considérées
- **Next.js** : écosystème React, pas de préférence pour React
- **Astro** : bon pour le static, moins adapté pour les features dynamiques (comments, messages)
- **HTML pur + API séparée** : trop de glue code, pas de SSR

## Conséquences
- Le développeur doit connaître Vue 3 + TypeScript
- Les API routes sont des fonctions serverless (cold start possible)
