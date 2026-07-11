/**
 * Seed AUTONOME et IDEMPOTENT — contenu 2026 (ère Scaleway).
 * Ajoute 3 projets, des compétences récentes et 2 articles de blog.
 * Chaque entrée est supprimée-puis-réinsérée par sa clé → rejouable sans doublon.
 * ⚠️ NE PAS ajouter à seed-all.ts (qui lance seed.ts et VIDE les tables).
 * Lancer : npm run db:seed-scaleway-2026
 */
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { projects, skills, blogPosts } from './schema'
import { eq, inArray } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

// ─── PROJETS ──────────────────────────────────────────────────────────────
const PROJECTS = [
  {
    slug: 'learn-chetana',
    titleFr: 'learn.chetana.fr — Plateforme d\'apprentissage',
    titleEn: 'learn.chetana.fr — Learning platform',
    titleKm: 'learn.chetana.fr',
    descriptionFr: `## Une plateforme d'apprentissage full-stack, 100% Scaleway

**learn.chetana.fr** est une plateforme de cours interactive que j'ai conçue et déployée de bout en bout : 8 cours, une centaine de leçons, avec quiz, flashcards à répétition espacée (SM-2) et TP Python exécutables dans le navigateur (Pyodide).

## Deux microservices

- **learn-web** — Nuxt 4 en SSR : design system à tokens CSS, i18n fr/en, contenu en markdown MDC, pattern BFF (le navigateur ne parle jamais directement à l'API).
- **learn-api** — microservice **Rust / Axum** : progression, quiz, répétition espacée (algorithme SM-2), notes. Validation JWT (JWKS), erreurs RFC 7807, OpenAPI, migrations sqlx.

## La stack

PostgreSQL **Serverless SQL** (scale-to-zero), auth **Logto** (login Google direct via l'API de management), conteneurs **Scaleway Serverless** (scale-to-zero, coût quasi nul au repos). Discipline **TDD** de bout en bout : tests Vitest + tests d'intégration Rust sur vraie base, validation de contenu, CI GitHub Actions.

## Contenu

Un cursus qui va des fondations (Backend → ML Engineer, PostgreSQL avancé) au produit (stack d'une app IA en production, Nuxt/Vue, prompt engineering) jusqu'au méta (développer en équipe avec des agents IA).`,
    descriptionEn: `## A full-stack learning platform, 100% Scaleway

**learn.chetana.fr** is an interactive course platform I designed and shipped end-to-end: 8 courses, ~100 lessons, with quizzes, spaced-repetition flashcards (SM-2) and Python exercises running in the browser (Pyodide).

## Two microservices

- **learn-web** — Nuxt 4 SSR: token-based design system, fr/en i18n, MDC markdown content, BFF pattern (the browser never talks to the API directly).
- **learn-api** — a **Rust / Axum** microservice: progress, quizzes, spaced repetition (SM-2), notes. JWT validation (JWKS), RFC 7807 errors, OpenAPI, sqlx migrations.

## Stack

Serverless SQL PostgreSQL (scale-to-zero), **Logto** auth (direct Google login via the management API), **Scaleway Serverless** containers. End-to-end **TDD**: Vitest + Rust integration tests on a real DB, content validation, GitHub Actions CI.`,
    tags: ['Nuxt', 'Rust', 'Axum', 'PostgreSQL', 'Scaleway', 'Logto', 'TDD', 'Full-stack'],
    githubUrl: null,
    demoUrl: 'https://learn.chetana.fr',
    imageUrl: null,
    type: 'project',
    featured: true,
  },
  {
    slug: 'chet-lys-duo',
    titleFr: 'Le Jardin des Deux Lunes — Jeu coopératif temps réel',
    titleEn: 'Garden of Two Moons — Real-time coop game',
    titleKm: null,
    descriptionFr: `## Un jeu coopératif à deux, en temps réel

Inspiré de *It Takes Two*, **Le Jardin des Deux Lunes** est un jeu web pensé pour être joué à deux, chacun sur son appareil, en temps réel. Deux modes se nourrissent : un **jardin persistant** (hub cozy sauvegardé en base) et des **niveaux puzzle-platformer asymétriques** où chaque joueur a un pouvoir complémentaire (l'un manie l'eau, l'autre la lumière).

## Le temps réel

Serveur **WebSocket autoritaire** en Node.js sur un conteneur **Scaleway Serverless** (max-scale=1 pour garder l'état de la room en mémoire, scale-to-zero au repos). Prédiction côté client + interpolation à buffer de snapshots (le netcode des jeux compétitifs) pour un ressenti fluide même sur réseau instable.

## La persistance

Le jardin vit dans une base **Serverless SQL** : les plantes poussent en temps réel — et même hors-ligne, la croissance est recalculée aux timestamps à la reconnexion. Auth Logto, progression liée au foyer du couple.`,
    descriptionEn: `## A two-player, real-time coop game

Inspired by *It Takes Two*, **Garden of Two Moons** is a web game built to be played by two people, each on their own device, in real time. A persistent **garden** hub feeds into **asymmetric puzzle-platformer levels** where each player wields a complementary power (water vs. light).

## Real-time

Authoritative **WebSocket** server (Node.js) on a **Scaleway Serverless** container (max-scale=1 to keep room state in memory, scale-to-zero at rest). Client-side prediction + snapshot-buffer interpolation — competitive-game netcode — for smooth play even on shaky networks.`,
    tags: ['WebSocket', 'Temps réel', 'Node.js', 'Scaleway', 'PostgreSQL', 'Jeu'],
    githubUrl: null,
    demoUrl: 'https://duo.chetana.fr',
    imageUrl: null,
    type: 'project',
    featured: false,
  },
  {
    slug: 'chetana-arcade',
    titleFr: 'Chetana Arcade — Jeux HTML5 & assets IA',
    titleEn: 'Chetana Arcade — HTML5 games & AI assets',
    titleKm: null,
    descriptionFr: `## Un hub de jeux HTML5 avec des assets 100% générés par IA

**Chetana Arcade** (play.chetana.fr) réunit plusieurs jeux canvas mono-fichier dans un hub arcade : un beat'em up façon manga situé à Phnom Penh et à Angkor, et un scroller vertical rétro.

## La direction artistique par IA

Tous les sprites, décors et animations sont **générés via Gemini 2.5 Flash Image ("Nano Banana")** avec un pipeline maison : génération en mode édition (références des visages pour la cohérence des personnages), détourage automatique ImageMagick, optimisation. Personnages animés multi-frames, boss, ennemis, décors — tout est illustré.

## Son & tech

Web Audio entièrement synthétisé (zéro asset son : SFX + musique chiptune), déployé en conteneur **Scaleway Serverless** (nginx, scale-to-zero). Le premier de mes projets migrés sur Scaleway.`,
    descriptionEn: `## An HTML5 game hub with 100% AI-generated assets

**Chetana Arcade** (play.chetana.fr) gathers several single-file canvas games into an arcade hub: a manga-style beat'em up set in Phnom Penh and Angkor, and a retro vertical scroller.

## AI art direction

Every sprite, background and animation is **generated via Gemini 2.5 Flash Image** with a home-grown pipeline: reference-based editing (faces kept consistent), automatic ImageMagick cutout, optimization. Fully synthesized Web Audio (SFX + chiptune music), deployed on a **Scaleway Serverless** container.`,
    tags: ['HTML5', 'Canvas', 'IA générative', 'Gemini', 'Scaleway', 'Jeu'],
    githubUrl: null,
    demoUrl: 'https://play.chetana.fr',
    imageUrl: null,
    type: 'project',
    featured: false,
  },
]

// ─── COMPÉTENCES (récentes / renforcées) ───────────────────────────────────
const SKILLS = [
  { category: 'IA & LLM', name: 'LangGraph', color: 'purple', sortOrder: 10 },
  { category: 'IA & LLM', name: 'LangChain', color: 'purple', sortOrder: 11 },
  { category: 'IA & LLM', name: 'Langfuse (LLM observability)', color: 'purple', sortOrder: 12 },
  { category: 'IA & LLM', name: 'RAG & recherche hybride', color: 'purple', sortOrder: 13 },
  { category: 'IA & LLM', name: 'pgvector / embeddings', color: 'purple', sortOrder: 14 },
  { category: 'IA & LLM', name: 'Prompt engineering', color: 'purple', sortOrder: 15 },
  { category: 'IA & LLM', name: 'Eval-driven development', color: 'purple', sortOrder: 16 },
  { category: 'IA & LLM', name: 'Learning-to-rank', color: 'purple', sortOrder: 17 },
  { category: 'IA & LLM', name: 'Dev assisté par agents IA', color: 'purple', sortOrder: 18 },
  { category: 'Cloud & Infra', name: 'Scaleway Serverless Containers', color: 'blue', sortOrder: 20 },
  { category: 'Cloud & Infra', name: 'Scaleway Serverless SQL', color: 'blue', sortOrder: 21 },
  { category: 'Backend', name: 'WebSocket temps réel', color: 'green', sortOrder: 30 },
  { category: 'Frontend', name: 'Design systems (tokens)', color: 'orange', sortOrder: 40 },
]

// ─── ARTICLES DE BLOG ───────────────────────────────────────────────────────
const BLOG = [
  {
    slug: 'plateforme-apprentissage-nuxt-rust-scaleway',
    titleFr: 'Construire une plateforme d\'apprentissage en 2 microservices (Nuxt + Rust) sur Scaleway',
    titleEn: 'Building a learning platform with 2 microservices (Nuxt + Rust) on Scaleway',
    titleKm: null,
    excerptFr: 'Retour d\'expérience sur learn.chetana.fr : pourquoi séparer un front Nuxt SSR d\'une API Rust/Axum, comment le pattern BFF sécurise l\'auth, et ce que le serverless scale-to-zero change à la facture.',
    excerptEn: 'Lessons from learn.chetana.fr: why split a Nuxt SSR front from a Rust/Axum API, how the BFF pattern secures auth, and what scale-to-zero serverless does to the bill.',
    contentFr: `## Le découpage : contenu d'un côté, état de l'autre

learn.chetana.fr est né d'une conviction : **le contenu des cours est un artefact front** (markdown versionné, diffable), et **l'état utilisateur est un domaine à part** (progression, quiz, révision espacée). D'où deux microservices.

**learn-web** (Nuxt 4 SSR) sert le contenu et l'interface. **learn-api** (Rust / Axum) possède la seule base de données et expose une API REST versionnée — progression, scoring de quiz, algorithme SM-2 de répétition espacée. Un futur client (app mobile, CLI) consommerait la même API.

## Le pattern BFF : le navigateur ne voit jamais l'API

Le front n'appelle jamais learn-api directement. Ses routes serveur (Nitro) proxifient les appels en injectant l'access token JWT de l'utilisateur (audience = l'API resource). Résultat : le token ne quitte jamais le serveur (pas de vol par XSS), zéro CORS, et les secrets restent côté Nitro. Le même pattern que j'ai appliqué sur mes projets pro.

## Rust pour l'API : pourquoi

Validation JWT par JWKS avec cache et refresh sur rotation de clés, erreurs RFC 7807, OpenAPI généré, migrations sqlx, tests d'intégration sur une vraie base Postgres. Le typage strict et la performance en font un socle idéal pour un service d'état — et l'écosystème Axum rend le tout concis.

## Le serverless scale-to-zero

Les deux conteneurs et la base PostgreSQL sont en **Serverless Scaleway** : au repos, tout dort, la facture est quasi nulle. La contrepartie (un cold start de quelques secondes) est acceptable pour une plateforme d'apprentissage — et le rapport coût/simplicité est imbattable pour un projet perso qui doit rester debout sans surveillance.

## La discipline

TDD de bout en bout : les fonctions pures (arbre de cours, SM-2, merge de progression) testées avant d'être écrites, les endpoints testés contre un vrai Postgres jetable, une CI qui bloque le rouge. Coder vite ne dispense pas de vérifier — au contraire.`,
    contentEn: `## Splitting content from state

learn.chetana.fr grew from one conviction: **course content is a front-end artifact** (versioned markdown), and **user state is its own domain**. Hence two microservices: **learn-web** (Nuxt 4 SSR) serves content and UI; **learn-api** (Rust/Axum) owns the only database and exposes a versioned REST API.

## The BFF pattern

The front never calls learn-api directly — Nitro server routes proxy calls with the user's JWT access token. The token never leaves the server, zero CORS, secrets stay server-side.

## Why Rust for the API

JWKS JWT validation with key-rotation refresh, RFC 7807 errors, generated OpenAPI, sqlx migrations, integration tests on a real Postgres. Strict typing and performance make it an ideal state-service foundation.

## Scale-to-zero serverless

Both containers and the Postgres database run on Scaleway Serverless: at rest everything sleeps, the bill is near zero — an unbeatable cost/simplicity ratio for a personal project.`,
    tags: ['Nuxt', 'Rust', 'Scaleway', 'Architecture', 'Serverless'],
    published: true,
  },
  {
    slug: 'design-system-tokens-refonte-admin',
    titleFr: 'Refondre un back-office avec un design system à tokens',
    titleEn: 'Rebuilding an admin with a token-based design system',
    titleKm: null,
    excerptFr: 'Passer un back-office React d\'un thème sombre codé en dur à un thème clair piloté par des tokens CSS — et pourquoi cette inversion rend le design maintenable.',
    excerptEn: 'Moving a React admin from a hard-coded dark theme to a light theme driven by CSS tokens — and why that inversion makes design maintainable.',
    contentFr: `## Le problème : des couleurs en dur partout

Mon back-office était en thème sombre, avec les couleurs écrites en dur dans chaque composant (\`bg-gray-900\`, \`text-white\`, \`indigo-600\`…). Changer d'identité visuelle aurait voulu dire éditer des dizaines de fichiers. C'est le signe d'un design sans source de vérité.

## L'inversion : des tokens sémantiques

La refonte pose une seule source de vérité — des **tokens CSS** nommés par leur *rôle*, pas par leur valeur : \`canvas\`, \`surface\`, \`ink\`, \`muted\`, \`accent\`, \`line\`… Chaque composant consomme ces noms. Un thème devient un simple jeu de valeurs ; le mode sombre, un attribut qui rebranche les mêmes noms.

Avec Tailwind v4, les tokens se déclarent dans un bloc \`@theme\` qui génère directement les utilitaires (\`bg-surface\`, \`text-ink\`, \`border-line\`). La conversion du sombre vers le clair s'est faite en gardant exactement la même structure — seules les valeurs ont changé.

## Le gain

Un composant corrigé est corrigé partout. Un nouveau thème est un fichier. Et la charte reste cohérente parce qu'il n'existe plus de couleur « à la main » — uniquement des rôles. La même discipline que j'applique côté produit : rendre le correct facile, l'incorrect impossible.`,
    contentEn: `## The problem: hard-coded colors everywhere

My admin was dark-themed, with colors written directly into every component. Changing the look meant editing dozens of files — a design with no source of truth.

## The inversion: semantic tokens

The rebuild sets a single source of truth — **CSS tokens** named by *role*, not value: canvas, surface, ink, muted, accent, line. Each component consumes those names. A theme becomes a set of values; dark mode, an attribute rebinding the same names. With Tailwind v4, tokens live in an \`@theme\` block that generates the utilities directly.

## The payoff

Fix a component once, it's fixed everywhere. A new theme is one file. The brand stays consistent because no color is placed by hand anymore — only roles.`,
    tags: ['Design system', 'Tailwind', 'React', 'Frontend'],
    published: true,
  },
]

async function seed() {
  console.log('🌱 Seed Scaleway 2026 (idempotent)...')

  for (const p of PROJECTS) {
    await db.delete(projects).where(eq(projects.slug, p.slug))
    await db.insert(projects).values(p)
    console.log(`  🚀 projet: ${p.slug}`)
  }

  const names = SKILLS.map((s) => s.name)
  await db.delete(skills).where(inArray(skills.name, names))
  await db.insert(skills).values(SKILLS)
  console.log(`  ⚡ ${SKILLS.length} compétences`)

  for (const b of BLOG) {
    await db.delete(blogPosts).where(eq(blogPosts.slug, b.slug))
    await db.insert(blogPosts).values(b)
    console.log(`  📝 article: ${b.slug}`)
  }

  console.log('✅ terminé — rejouable sans doublon.')
}

seed().catch((e) => {
  console.error(e)
  process.exit(1)
})
