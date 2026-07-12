#!/usr/bin/env node
/**
 * Pousse UN article de blog via l'API chetaku-rs (comme le back-office admin).
 * Idempotent : DELETE (par slug) puis POST. Aucun secret dans le code.
 *
 *   API_KEY=xxx node scripts/push-article.mjs
 *   # ou, pour lire la clé depuis l'admin :
 *   set -a; source ~/Chetana/chetana-admin/.env; set +a; node scripts/push-article.mjs
 */
const API_BASE = process.env.API_BASE || 'https://chetaku.chetana.fr'
const API_KEY = process.env.API_KEY
if (!API_KEY) {
  console.error('❌ API_KEY manquante. Lance : API_KEY=<clé> node scripts/push-article.mjs')
  process.exit(1)
}
const H = { 'content-type': 'application/json', 'x-api-key': API_KEY }

const ARTICLE = {
  slug: 'learn-chetana-architecture-deux-microservices',
  published: true,
  title_fr: 'L\'archi de learn.chetana.fr : deux microservices pour une petite app',
  title_en: 'Inside learn.chetana.fr: two microservices for a small app',
  excerpt_fr: 'Pourquoi une plateforme d\'apprentissage perso mérite un front Nuxt SSR ET une API Rust séparée — le pattern BFF, le découpage contenu/état, et le serverless qui rend tout ça gratuit au repos.',
  excerpt_en: 'Why a personal learning platform deserves both a Nuxt SSR front AND a separate Rust API — the BFF pattern, the content/state split, and serverless that makes it free at rest.',
  tags: ['Architecture', 'Nuxt', 'Rust', 'Axum', 'Scaleway', 'BFF', 'Serverless'],
  content_fr: `« Deux microservices pour un projet perso, n'est-ce pas de la sur-ingénierie ? » C'est la première question qu'on m'a posée sur [learn.chetana.fr](https://learn.chetana.fr). Voici pourquoi le découpage se justifie — et ce que j'aurais perdu à tout mettre dans un seul Nuxt.

## Le principe : séparer le contenu de l'état

Une plateforme de cours, c'est deux natures de données radicalement différentes :

- **le contenu** — les cours, les leçons, les quiz. Écrit une fois, versionné, diffable. C'est du **markdown dans le repo**, servi par le front. Il n'a pas besoin de base de données : Git *est* sa base de données.
- **l'état utilisateur** — ta progression, tes scores, tes cartes de révision. Il change à chaque interaction, appartient à chaque personne, doit survivre aux déploiements.

Confondre les deux, c'est se condamner à traiter du contenu statique comme de la donnée dynamique (ou l'inverse). Le découpage tombe naturellement :

- **learn-web** (Nuxt 4 SSR) : le contenu + l'interface. Le markdown des cours vit à côté du code, rendu en SSR pour le SEO et la vitesse.
- **learn-api** (Rust / Axum) : le seul propriétaire de la base de données. Progression, scoring, algorithme de répétition espacée (SM-2), notes. Une API REST versionnée qu'un futur client — app mobile, CLI — consommerait à l'identique.

## Le pattern BFF : le navigateur ne parle jamais à l'API

C'est le cœur de la sécurité, et le détail que beaucoup ratent. Le front n'appelle **jamais** learn-api directement. Ses routes serveur (Nitro, le serveur embarqué de Nuxt) proxifient les appels en y injectant l'access token JWT de l'utilisateur :

\`\`\`
navigateur ──cookie httpOnly──> Nitro (session, token) ──Bearer JWT──> learn-api
\`\`\`

Ce qu'on y gagne, concrètement :

1. **le token ne quitte jamais le serveur** — pas de JWT en localStorage à voler par une faille XSS ; juste un cookie httpOnly que le JavaScript ne peut pas lire ;
2. **zéro CORS** — le navigateur ne voit qu'une seule origine ;
3. **les secrets restent côté serveur** — la config Logto, les clés, dans le runtime Nitro, jamais dans le bundle envoyé au client.

Un *Backend For Frontend* : une façade qui possède la session et adapte les appels pour SON front. C'est le même pattern que sur mes projets pro — la bonne pratique n'a pas de taille minimale de projet.

## Rust pour l'état : pourquoi pas juste du Nuxt ?

J'aurais pu tout faire dans les routes serveur de Nuxt. J'ai choisi un service Rust séparé pour l'état parce qu'un service d'état gagne à être **strict et durable** :

- **validation JWT par JWKS** avec cache et refresh automatique sur rotation de clés ;
- **erreurs RFC 7807** (\`application/problem+json\`), **OpenAPI** généré, **migrations sqlx** ;
- **tests d'intégration sur une vraie base Postgres** jetable — la logique de progression et l'algorithme SM-2 testés contre le vrai moteur, pas des mocks.

Le typage strict de Rust et la performance d'Axum en font un socle qui ne bouge pas. Et la frontière nette (une API versionnée) m'oblige à une discipline que le tout-en-un dissout : chaque changement d'état passe un contrat explicite.

## Le serverless qui rend le luxe gratuit

« Deux services, ça coûte le double ? » Non — parce que les deux conteneurs ET la base PostgreSQL sont en **Serverless Scaleway**, scale-to-zero. Au repos, tout dort : la facture est quasi nulle. La contrepartie — un cold start de quelques secondes à la première requête après une pause — est parfaitement acceptable pour une plateforme d'apprentissage.

C'est ça qui change l'équation : le découpage en microservices, historiquement réservé aux équipes qui peuvent payer l'infra correspondante, devient abordable pour un projet solo. Le scale-to-zero démocratise la bonne architecture.

## La discipline, quelle que soit la taille

Tout ça tourne en **TDD** de bout en bout : les fonctions pures (arbre de cours, SM-2, fusion de progression) testées avant d'être écrites, les endpoints Rust contre un Postgres réel, une CI qui bloque le rouge. Coder vite — surtout avec des agents — ne dispense pas de vérifier : ça l'exige davantage.

## Le verdict

Sur-ingénierie ? Non. Chaque brique répond à un besoin réel : le BFF pour la sécurité, Rust pour un état fiable, le serverless pour le coût, le TDD pour la sérénité. La vraie sur-ingénierie aurait été d'ajouter Kubernetes, un bus de messages ou un cache distribué pour cent utilisateurs. La bonne architecture n'est pas la plus grosse — c'est la plus **juste** : celle où chaque pièce se justifie, et où l'on peut suivre une requête du clic jusqu'à la base sans se perdre.`,
  content_en: `"Two microservices for a personal project — isn't that over-engineering?" That was the first question I got about [learn.chetana.fr](https://learn.chetana.fr). Here's why the split is justified.

## The principle: separate content from state

A course platform has two radically different kinds of data:

- **content** — courses, lessons, quizzes. Written once, versioned, diffable. It's **markdown in the repo**, served by the front. It needs no database: Git *is* its database.
- **user state** — your progress, scores, review cards. Changes on every interaction, belongs to each person, must survive deploys.

Hence the split: **learn-web** (Nuxt 4 SSR) owns content + UI; **learn-api** (Rust/Axum) owns the only database — progress, scoring, spaced repetition (SM-2), notes — behind a versioned REST API a future client would reuse.

## The BFF pattern: the browser never talks to the API

The front never calls learn-api directly. Nitro server routes proxy calls, injecting the user's JWT: the token never leaves the server (no localStorage token to steal via XSS), zero CORS, secrets stay server-side. A Backend For Frontend — the same pattern I use on production projects; good practice has no minimum project size.

## Why Rust for state

A state service benefits from being strict and durable: JWKS JWT validation with key-rotation refresh, RFC 7807 errors, generated OpenAPI, sqlx migrations, integration tests against a real throwaway Postgres. Rust's strict typing and Axum make a foundation that doesn't drift.

## Serverless makes the luxury free

Both containers AND the Postgres database run on Scaleway Serverless, scale-to-zero: at rest everything sleeps, the bill is near zero. A few-second cold start is fine for a learning platform. Scale-to-zero democratizes good architecture for solo projects.

## Discipline at any size

End-to-end TDD: pure functions tested before writing, Rust endpoints against real Postgres, a CI that blocks red. Coding fast — especially with agents — demands more verification, not less.

## Verdict

Over-engineering? No. Each piece answers a real need: BFF for security, Rust for reliable state, serverless for cost, TDD for peace of mind. Good architecture isn't the biggest — it's the most *fitting*: every piece justified, and you can follow a request from click to database without getting lost.`,
}

async function main() {
  console.log(`→ ${API_BASE} — article "${ARTICLE.slug}"`)
  await fetch(`${API_BASE}/blog/${ARTICLE.slug}`, { method: 'DELETE', headers: H }).catch(() => {})
  const r = await fetch(`${API_BASE}/blog`, { method: 'POST', headers: H, body: JSON.stringify(ARTICLE) })
  if (!r.ok) { console.error(`❌ ${r.status} ${await r.text()}`); process.exit(1) }
  console.log('✅ article publié — https://chetana.fr/blog/' + ARTICLE.slug)
}
main().catch((e) => { console.error('❌', e.message); process.exit(1) })
