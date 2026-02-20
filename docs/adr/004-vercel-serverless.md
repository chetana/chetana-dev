# ADR 004 — Vercel comme plateforme d'hébergement

## Statut
Accepté

## Contexte
Le site doit être déployé avec un minimum de configuration, avec support SSR et serverless functions.

## Décision
Déployer sur **Vercel** avec le preset Nitro `vercel`.

## Raisons
- Déploiement automatique depuis GitHub (CI/CD intégré)
- Support natif de Nuxt/Nitro (serverless functions)
- Edge network global (CDN)
- Variables d'environnement faciles à configurer
- Custom domain (chetana.dev)
- Free tier suffisant pour un site personnel

## Alternatives considérées
- **Netlify** : similaire mais moins bon support de Nuxt SSR
- **Cloudflare Pages** : bon mais écosystème plus complexe
- **Railway / Render** : serveurs traditionnels, pas serverless

## Conséquences
- Le site est serverless (cold starts possibles mais rares)
- Configuration via `nuxt.config.ts` : `nitro.preset = 'vercel'`
