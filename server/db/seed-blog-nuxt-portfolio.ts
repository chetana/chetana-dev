import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { blogPosts } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const contentFr = `## Introduction

Pendant 15 ans, mon CV a été un fichier HTML statique. Un seul fichier, hébergé gratuitement, qui faisait le job. Puis un jour, j'ai voulu ajouter un blog. Puis des projets. Puis des commentaires. Puis du multilingue. Et j'ai réalisé que mon fichier HTML ne suffisait plus.

Plutôt que d'empiler du JavaScript vanilla et des appels fetch bricolés, j'ai décidé de tout reconstruire avec une stack moderne. Le résultat : **chetana.dev** — un portfolio dynamique construit avec Nuxt 4, Neon PostgreSQL et Drizzle ORM, déployé sur Vercel.

Cet article est un retour d'expérience complet : les choix techniques, les pièges rencontrés, et ce que j'ai appris en tant que développeur backend Java qui découvre l'écosystème JavaScript moderne.

---

## Chapitre 1 : Pourquoi migrer ?

### Les limites du HTML statique

Mon ancien CV fonctionnait bien pour ce qu'il était :
- Un fichier \`index.html\` de 300 lignes
- Du CSS inline
- Hébergé sur GitHub Pages
- Aucune dépendance, aucun build, aucun serveur

Mais dès que j'ai voulu aller plus loin, les limites sont apparues :

- **Pas de blog** : ajouter des articles signifie créer des fichiers HTML manuellement
- **Pas de données dynamiques** : chaque modification nécessite un commit + push
- **Pas de commentaires** : impossible sans backend
- **Pas de multilingue propre** : dupliquer le HTML pour chaque langue ? Non merci
- **Pas de SEO avancé** : pas de sitemap dynamique, pas de JSON-LD, pas d'OG tags par page

### Le déclic

Le déclic est venu quand j'ai voulu montrer mes compétences en tant qu'Engineering Manager. Un CV statique montre que je sais coder du HTML. Un portfolio dynamique montre que je sais **concevoir, architecturer et déployer une application complète**.

## Chapitre 2 : Le choix de la stack

### Pourquoi Nuxt 4 (et pas Next.js) ?

En tant que développeur Java, React et Next.js semblaient le choix évident (plus populaire, plus d'offres d'emploi). Mais j'ai choisi Nuxt/Vue pour plusieurs raisons :

**1. La courbe d'apprentissage**
Vue est plus accessible que React pour un développeur backend. Le template HTML + script + style dans un fichier \`.vue\` ressemble à ce qu'on connaît. Pas de JSX, pas de hooks complexes, pas de "mental model" à repenser.

**2. Le système de fichiers comme routeur**
Nuxt 4 utilise le file-based routing : un fichier \`pages/blog/[slug].vue\` crée automatiquement la route \`/blog/:slug\`. Pour un développeur habitué aux routes Spring Boot (\`@GetMapping\`), c'est intuitif.

**3. Les server routes intégrées**
Nuxt inclut Nitro, un serveur HTTP qui permet de créer des API REST directement dans le projet. Un fichier \`server/api/blog/index.get.ts\` crée un endpoint \`GET /api/blog\`. Pas besoin d'un backend séparé.

**4. Le SSR natif**
Le Server-Side Rendering est crucial pour le SEO. Nuxt le fait nativement, sans configuration. Chaque page est rendue côté serveur au premier chargement, puis hydratée côté client.

### Pourquoi Neon PostgreSQL ?

J'ai envisagé plusieurs options pour la base de données :

| Option | Avantage | Inconvénient |
|--------|----------|--------------|
| SQLite fichier | Simple, gratuit | Pas de cloud, pas de serverless |
| Supabase | UI admin, auth intégrée | Overhead pour un portfolio |
| PlanetScale | MySQL serverless | MySQL, pas PostgreSQL |
| Neon | PostgreSQL serverless, gratuit | Moins connu |

J'ai choisi Neon pour :
- **PostgreSQL** : je connais PostgreSQL depuis 10 ans (DJUST, Galeries Lafayette, INFOTEL)
- **Serverless** : le compute s'allume uniquement quand il y a une requête. Coût : 0€
- **Free tier généreux** : 512 Mo de stockage, 191h de compute/mois
- **Compatible Drizzle** : driver natif \`@neondatabase/serverless\`

### Pourquoi Drizzle ORM ?

Venant de Java/Hibernate, j'avais besoin d'un ORM. Les options en TypeScript :

| ORM | Style | Type-safety |
|-----|-------|-------------|
| Prisma | Schema-first, migration auto | Bon, mais génère du code |
| TypeORM | Decorators (style Hibernate) | Moyen |
| Drizzle | SQL-like, schema-in-code | Excellent |

Drizzle m'a convaincu parce que :
- **Le schéma est du code TypeScript** : pas de fichier schema séparé, pas de génération de code
- **Les requêtes ressemblent à du SQL** : \`db.select().from(blogPosts).where(eq(...))\` — un développeur SQL lit ça sans problème
- **Type-safety de bout en bout** : le résultat d'une requête est typé automatiquement
- **Léger** : pas de runtime heavy comme Prisma

## Chapitre 3 : L'architecture

### Structure du projet

\`\`\`
chetana-dev/
├── app/
│   ├── pages/           # Routes (file-based routing)
│   │   ├── index.vue    # Page d'accueil
│   │   ├── blog/
│   │   │   ├── index.vue    # Liste des articles
│   │   │   └── [slug].vue   # Article individuel
│   │   ├── projects/
│   │   ├── cv.vue
│   │   └── contact.vue
│   ├── components/      # Composants réutilisables
│   │   ├── BlogCard.vue
│   │   ├── ProjectCard.vue
│   │   ├── Timeline.vue
│   │   └── CommentSection.vue
│   └── composables/     # Logique partagée
│       └── useI18n.ts   # Système i18n custom
├── server/
│   ├── api/             # API REST (Nitro)
│   │   ├── blog/
│   │   ├── experiences.get.ts
│   │   ├── skills.get.ts
│   │   └── comments/
│   ├── db/
│   │   ├── schema.ts    # Schéma Drizzle
│   │   └── seed.ts      # Données initiales
│   └── utils/
│       └── db.ts        # Connexion Neon
└── nuxt.config.ts
\`\`\`

### Le pattern API

Chaque endpoint suit le même pattern :

1. Importer la connexion DB (\`server/utils/db.ts\`)
2. Utiliser Drizzle pour la requête
3. Retourner le résultat (Nitro le sérialise en JSON automatiquement)

C'est minimaliste et efficace. Pas de controllers, pas de services, pas de DTOs — juste des fonctions qui retournent des données.

### Le système i18n

Plutôt que d'utiliser une librairie i18n (qui entre en conflit avec nuxt-seo-utils), j'ai créé un composable custom \`useLocale()\` :

- Un \`ref\` réactif pour la locale courante (fr/en/km)
- Une fonction \`t(key)\` pour les traductions statiques
- Une fonction \`localeField(obj, field)\` pour les données DB (sélectionne \`titleFr\`, \`titleEn\` ou \`titleKm\` selon la locale)
- Fallback automatique vers le français si une traduction manque

## Chapitre 4 : Les pièges rencontrés

### Piège 1 : Le SSR et les composables

En Nuxt, les composables (\`useLocale()\`, \`useRoute()\`) ne fonctionnent que dans le contexte d'un composant Vue. Appeler \`useLocale()\` dans un fichier utilitaire classique provoque une erreur côté serveur.

**Solution** : toujours appeler les composables dans \`setup()\` ou dans un \`computed\`, jamais dans une fonction importée globalement.

### Piège 2 : Les seeds et l'idempotence

Au début, mes scripts de seed faisaient des \`INSERT\` sans vérifier si les données existaient. Résultat : après 3 exécutions, j'avais 18 expériences au lieu de 6 et 126 skills au lieu de 42.

**Solution** : chaque seed commence par un \`DELETE\` de toutes les données existantes, puis fait les \`INSERT\`. C'est brutal mais fiable. L'ordre des \`DELETE\` respecte les foreign keys (comments → blogPosts → experiences → skills → projects).

### Piège 3 : Les variables d'environnement en local

Vercel injecte automatiquement \`DATABASE_URL\` en production. En local, j'utilise un fichier \`.env.local\`. Mais \`dotenv\` par défaut ne charge que \`.env\`, pas \`.env.local\`.

**Solution** : ajouter explicitement \`config({ path: '.env.local' })\` dans chaque script de seed.

### Piège 4 : Le rendu Markdown

Les articles de blog sont stockés en Markdown dans la base de données. Mais Nuxt ne rend pas le Markdown nativement dans le template.

**Solution** : un \`computed\` dans la page blog qui transforme le Markdown en HTML avec des regex : headers, listes, bold, italic, tables, sauts de ligne. C'est pas aussi complet qu'une librairie Markdown, mais ça suffit pour un blog technique.

### Piège 5 : Le conflit nuxt-seo-utils / useI18n

J'avais nommé mon composable \`useI18n\` — le même nom que le composable de \`vue-i18n\`. Le module \`@nuxtjs/seo\` importe internement \`vue-i18n\` et le conflit faisait crasher le build.

**Solution** : renommer le composable en \`useLocale()\` et l'exporter depuis un fichier nommé \`useI18n.ts\` (le nom du fichier ne pose pas problème, c'est le nom de la fonction exportée qui compte).

## Chapitre 5 : Le déploiement sur Vercel

### Pourquoi Vercel ?

- **Zero config** : Vercel détecte Nuxt automatiquement et configure le build
- **Edge network** : le site est servi depuis le CDN le plus proche du visiteur
- **Auto-deploy** : chaque push sur \`main\` déclenche un déploiement
- **Serverless functions** : les server routes Nuxt sont déployées comme des serverless functions
- **Gratuit** pour un usage personnel

### Le workflow de déploiement

1. \`git push origin main\`
2. Vercel détecte le push (webhook GitHub)
3. Vercel exécute \`npm run build\` (Nuxt build)
4. Les fichiers statiques vont sur le CDN
5. Les server routes deviennent des serverless functions
6. Le site est live en ~45 secondes

### La connexion Neon ↔ Vercel

Neon fournit une connection string PostgreSQL. Je la stocke dans Vercel comme variable d'environnement (\`DATABASE_URL\` et \`NUXT_DATABASE_URL\`).

Quand une serverless function reçoit une requête :
1. Le driver \`@neondatabase/serverless\` établit une connexion HTTP (pas TCP)
2. La requête SQL est envoyée via HTTP à Neon
3. Neon réveille le compute (si endormi), exécute la requête, retourne le résultat
4. Le tout en 50-200ms (premier appel après cold start : ~500ms)

## Chapitre 6 : Les résultats

### Performance

| Métrique | Résultat |
|----------|----------|
| Lighthouse Performance | 95+ |
| First Contentful Paint | < 1s |
| Time to Interactive | < 1.5s |
| Taille du bundle JS | ~207 KB (gzippé : 77 KB) |
| Cold start Neon | ~500ms |
| Requête DB warm | 50-200ms |

### SEO

- **Sitemap dynamique** : génère automatiquement les URLs des articles et projets
- **JSON-LD** : schema.org Person + BlogPosting sur chaque article
- **OG/Twitter meta** : \`useSeoMeta()\` sur chaque page
- **Robots** : la page CV est en \`noindex\` (contenu similaire à LinkedIn)

### Coût mensuel

| Service | Coût |
|---------|------|
| Vercel (Hobby) | 0€ |
| Neon (Free tier) | 0€ |
| Domaine chetana.dev | ~12€/an |
| **Total** | **~1€/mois** |

## Chapitre 7 : Ce que j'ai appris

### En tant que développeur Java qui découvre le JavaScript moderne

**Ce qui m'a surpris positivement :**
- La **vitesse de développement** : de l'idée au déploiement en quelques heures, pas en quelques jours
- Le **hot reload** : modifier un composant et voir le résultat instantanément, sans redémarrer un serveur Spring Boot
- La **simplicité du déploiement** : \`git push\` et c'est en production. Pas de Jenkins, pas de Kubernetes, pas de Docker
- Le **typage end-to-end** : Drizzle + TypeScript = les erreurs de types sont détectées à la compilation

**Ce qui m'a manqué :**
- La **rigueur de Java** : le typage de TypeScript est bon mais moins strict que Java. Les \`any\` sont tentants
- L'**écosystème de tests** : JUnit + Mockito est plus mature que Vitest/Jest pour les tests complexes
- La **stabilité** : l'écosystème JavaScript bouge trop vite. Ce qui est best practice aujourd'hui sera obsolète dans 6 mois

### Le meilleur des deux mondes

Ce projet m'a convaincu que **Java et JavaScript sont complémentaires**, pas concurrents :

- **Java** pour le backend lourd : transactions, multi-tenancy, intégrations enterprise, batch processing
- **Nuxt/Vue** pour le frontend et les applications légères : portfolios, blogs, dashboards, outils internes

Un développeur qui maîtrise les deux a un avantage considérable sur le marché.

---

*Chetana YIN — Février 2026*
*Engineering Manager, développeur Java depuis 2008, converti Nuxt depuis 2025.*`

const contentEn = `## Introduction

For 15 years, my CV was a static HTML file. A single file, hosted for free, that did the job. Then one day, I wanted to add a blog. Then projects. Then comments. Then multilingual support. And I realized my HTML file wasn't enough anymore.

Rather than piling on vanilla JavaScript and hacky fetch calls, I decided to rebuild everything with a modern stack. The result: **chetana.dev** — a dynamic portfolio built with Nuxt 4, Neon PostgreSQL, and Drizzle ORM, deployed on Vercel.

This article is a complete experience report: the technical choices, the pitfalls encountered, and what I learned as a backend Java developer discovering the modern JavaScript ecosystem.

---

## Chapter 1: Why Migrate?

### The Limits of Static HTML

My old CV worked well for what it was:
- A 300-line \`index.html\` file
- Inline CSS
- Hosted on GitHub Pages
- No dependencies, no build, no server

But as soon as I wanted to go further, the limits appeared:

- **No blog**: adding articles means manually creating HTML files
- **No dynamic data**: every modification requires a commit + push
- **No comments**: impossible without a backend
- **No proper multilingual**: duplicate the HTML for each language? No thanks
- **No advanced SEO**: no dynamic sitemap, no JSON-LD, no per-page OG tags

### The Trigger

The trigger came when I wanted to showcase my skills as an Engineering Manager. A static CV shows I can code HTML. A dynamic portfolio shows I can **design, architect, and deploy a complete application**.

## Chapter 2: Choosing the Stack

### Why Nuxt 4 (and Not Next.js)?

As a Java developer, React and Next.js seemed the obvious choice (more popular, more job offers). But I chose Nuxt/Vue for several reasons:

**1. The Learning Curve**
Vue is more accessible than React for a backend developer. The HTML template + script + style in a single \`.vue\` file resembles what we already know. No JSX, no complex hooks, no "mental model" to rethink.

**2. File-Based Routing**
Nuxt 4 uses file-based routing: a \`pages/blog/[slug].vue\` file automatically creates the \`/blog/:slug\` route. For a developer used to Spring Boot routes (\`@GetMapping\`), it's intuitive.

**3. Built-in Server Routes**
Nuxt includes Nitro, an HTTP server that lets you create REST APIs directly in the project. A \`server/api/blog/index.get.ts\` file creates a \`GET /api/blog\` endpoint. No separate backend needed.

**4. Native SSR**
Server-Side Rendering is crucial for SEO. Nuxt does it natively, without configuration.

### Why Neon PostgreSQL?

I considered several database options:

| Option | Advantage | Disadvantage |
|--------|-----------|--------------|
| SQLite file | Simple, free | No cloud, no serverless |
| Supabase | Admin UI, built-in auth | Overhead for a portfolio |
| PlanetScale | MySQL serverless | MySQL, not PostgreSQL |
| Neon | PostgreSQL serverless, free | Less known |

I chose Neon because:
- **PostgreSQL**: I've known PostgreSQL for 10 years (DJUST, Galeries Lafayette, INFOTEL)
- **Serverless**: compute spins up only when there's a request. Cost: $0
- **Generous free tier**: 512 MB storage, 191h compute/month
- **Drizzle compatible**: native \`@neondatabase/serverless\` driver

### Why Drizzle ORM?

Coming from Java/Hibernate, I needed an ORM. TypeScript options:

| ORM | Style | Type-safety |
|-----|-------|-------------|
| Prisma | Schema-first, auto migration | Good, but generates code |
| TypeORM | Decorators (Hibernate-style) | Medium |
| Drizzle | SQL-like, schema-in-code | Excellent |

Drizzle convinced me because:
- **Schema is TypeScript code**: no separate schema file, no code generation
- **Queries look like SQL**: \`db.select().from(blogPosts).where(eq(...))\` — any SQL developer reads this without issue
- **End-to-end type-safety**: query results are automatically typed
- **Lightweight**: no heavy runtime like Prisma

## Chapter 3: The Architecture

### Project Structure

The site follows Nuxt 4 conventions with a clear separation:
- \`app/pages/\` — file-based routing (index, blog, projects, cv, contact)
- \`app/components/\` — reusable Vue components (BlogCard, ProjectCard, Timeline, CommentSection)
- \`app/composables/\` — shared logic (useLocale for i18n)
- \`server/api/\` — REST API endpoints via Nitro
- \`server/db/\` — Drizzle schema and seed scripts

### The API Pattern

Each endpoint follows the same pattern: import DB connection, use Drizzle for the query, return the result. Minimalist and efficient. No controllers, no services, no DTOs — just functions that return data.

### The i18n System

Rather than using an i18n library (which conflicts with nuxt-seo-utils), I created a custom \`useLocale()\` composable:
- A reactive \`ref\` for the current locale (fr/en/km)
- A \`t(key)\` function for static translations
- A \`localeField(obj, field)\` function for DB data (selects \`titleFr\`, \`titleEn\` or \`titleKm\` based on locale)
- Automatic fallback to French if a translation is missing

## Chapter 4: Pitfalls Encountered

### Pitfall 1: SSR and Composables
Nuxt composables only work within Vue component context. Calling \`useLocale()\` in a regular utility file causes a server-side error. Solution: always call composables in \`setup()\` or \`computed\`.

### Pitfall 2: Seed Idempotency
Initially, seed scripts did \`INSERT\` without checking for existing data. After 3 runs: 18 experiences instead of 6 and 126 skills instead of 42. Solution: each seed starts with \`DELETE\`, respecting foreign key order.

### Pitfall 3: Local Environment Variables
Vercel auto-injects \`DATABASE_URL\` in production. Locally, \`dotenv\` only loads \`.env\`, not \`.env.local\`. Solution: explicitly add \`config({ path: '.env.local' })\` in each seed script.

### Pitfall 4: Markdown Rendering
Blog posts are stored as Markdown in the database. Solution: a \`computed\` that transforms Markdown to HTML with regex (headers, lists, bold, italic, tables, line breaks).

### Pitfall 5: The nuxt-seo-utils / useI18n Conflict
I had named my composable \`useI18n\` — same name as vue-i18n's composable. The \`@nuxtjs/seo\` module imports vue-i18n internally, causing build crashes. Solution: rename to \`useLocale()\`.

## Chapter 5: Deploying on Vercel

### Why Vercel?
- **Zero config**: Vercel auto-detects Nuxt and configures the build
- **Edge network**: site served from the nearest CDN
- **Auto-deploy**: every push to \`main\` triggers deployment
- **Serverless functions**: Nuxt server routes deployed as serverless functions
- **Free** for personal use

### The Neon ↔ Vercel Connection

When a serverless function receives a request:
1. The \`@neondatabase/serverless\` driver establishes an HTTP connection (not TCP)
2. The SQL query is sent via HTTP to Neon
3. Neon wakes the compute (if sleeping), executes the query, returns the result
4. All in 50-200ms (first call after cold start: ~500ms)

## Chapter 6: Results

### Performance

| Metric | Result |
|--------|--------|
| Lighthouse Performance | 95+ |
| First Contentful Paint | < 1s |
| Time to Interactive | < 1.5s |
| JS bundle size | ~207 KB (gzipped: 77 KB) |
| Neon cold start | ~500ms |
| Warm DB query | 50-200ms |

### Monthly Cost

| Service | Cost |
|---------|------|
| Vercel (Hobby) | $0 |
| Neon (Free tier) | $0 |
| chetana.dev domain | ~$12/year |
| **Total** | **~$1/month** |

## Chapter 7: What I Learned

### As a Java Developer Discovering Modern JavaScript

**What positively surprised me:**
- **Development speed**: from idea to deployment in hours, not days
- **Hot reload**: modify a component and see the result instantly, without restarting a Spring Boot server
- **Deployment simplicity**: \`git push\` and it's in production. No Jenkins, no Kubernetes, no Docker
- **End-to-end typing**: Drizzle + TypeScript = type errors caught at compilation

**What I missed:**
- **Java's rigor**: TypeScript's typing is good but less strict than Java. \`any\` is tempting
- **Test ecosystem**: JUnit + Mockito is more mature than Vitest/Jest for complex tests
- **Stability**: the JavaScript ecosystem moves too fast. Today's best practice is tomorrow's legacy

### The Best of Both Worlds

This project convinced me that **Java and JavaScript are complementary**, not competing:
- **Java** for heavy backend: transactions, multi-tenancy, enterprise integrations, batch processing
- **Nuxt/Vue** for frontend and lightweight applications: portfolios, blogs, dashboards, internal tools

A developer who masters both has a considerable market advantage.

---

*Chetana YIN — February 2026*
*Engineering Manager, Java developer since 2008, Nuxt convert since 2025.*`

const contentKm = `## សេចក្តីផ្តើម

រយៈពេល ១៥ ឆ្នាំ CV របស់ខ្ញុំគឺជាឯកសារ HTML ស្ថិតិ។ ឯកសារតែមួយ ដាក់ស្នាក់ដោយឥតគិតថ្លៃ ដែលធ្វើការងារបាន។ បន្ទាប់មកថ្ងៃមួយ ខ្ញុំចង់បន្ថែមប្លុក។ បន្ទាប់មកគម្រោង។ បន្ទាប់មកមតិយោបល់។ បន្ទាប់មកពហុភាសា។ ហើយខ្ញុំបានដឹងថាឯកសារ HTML របស់ខ្ញុំមិនគ្រប់គ្រាន់ទៀតទេ។

ជំនួសឱ្យការបន្ថែម JavaScript vanilla ខ្ញុំបានសម្រេចចិត្តសាងសង់ឡើងវិញទាំងអស់ជាមួយ stack ទំនើប។ លទ្ធផល៖ **chetana.dev** — ផលប័ត្រថាមវន្តបង្កើតជាមួយ Nuxt 4, Neon PostgreSQL និង Drizzle ORM ដាក់ពង្រាយនៅ Vercel។

---

## ជំពូកទី ១៖ ហេតុអ្វីផ្លាស់ប្តូរ?

### ដែនកំណត់នៃ HTML ស្ថិតិ

CV ចាស់របស់ខ្ញុំដំណើរការល្អសម្រាប់អ្វីដែលវាជា៖ ឯកសារ index.html ៣០០ បន្ទាត់ CSS inline ដាក់នៅ GitHub Pages។

ប៉ុន្តែដែនកំណត់បានលេចឡើង៖
- **គ្មានប្លុក**៖ ការបន្ថែមអត្ថបទមានន័យថាបង្កើតឯកសារ HTML ដោយដៃ
- **គ្មានទិន្នន័យថាមវន្ត**៖ ការកែប្រែនីមួយៗត្រូវការ commit + push
- **គ្មានមតិយោបល់**៖ មិនអាចទៅរួចទេដោយគ្មាន backend
- **គ្មានពហុភាសាត្រឹមត្រូវ**៖ ស្ទួន HTML សម្រាប់ភាសានីមួយៗ? អត់ទេ
- **គ្មាន SEO កម្រិតខ្ពស់**៖ គ្មាន sitemap ថាមវន្ត គ្មាន JSON-LD

## ជំពូកទី ២៖ ការជ្រើសរើស Stack

### ហេតុអ្វី Nuxt 4?

ក្នុងនាមជាអ្នកអភិវឌ្ឍន៍ Java, Vue មានភាពងាយស្រួលជាង React។ Template HTML + script + style ក្នុងឯកសារ .vue ដូចអ្វីដែលយើងស្គាល់រួចហើយ។

### ហេតុអ្វី Neon PostgreSQL?

- **PostgreSQL**៖ ខ្ញុំស្គាល់ PostgreSQL ១០ ឆ្នាំហើយ
- **Serverless**៖ compute ដំណើរការតែពេលមានសំណើ។ តម្លៃ៖ ០$
- **Free tier ល្អ**៖ 512 MB storage, 191h compute/ខែ

### ហេតុអ្វី Drizzle ORM?

- **Schema ជាកូដ TypeScript**៖ គ្មានឯកសារ schema ដាច់ដោយឡែក
- **Queries ដូច SQL**៖ អ្នកអភិវឌ្ឍន៍ SQL អានបានដោយគ្មានបញ្ហា
- **Type-safety ពេញលេញ**៖ លទ្ធផល query ត្រូវបាន type ដោយស្វ័យប្រវត្តិ

## ជំពូកទី ៣៖ ស្ថាបត្យកម្ម

គេហទំព័រប្រើ Nuxt 4 conventions៖
- \`app/pages/\` — file-based routing
- \`app/components/\` — Vue components ដែលអាចប្រើឡើងវិញ
- \`app/composables/\` — logic រួម (useLocale សម្រាប់ i18n)
- \`server/api/\` — REST API endpoints តាមរយៈ Nitro
- \`server/db/\` — Drizzle schema និង seed scripts

## ជំពូកទី ៤៖ ឧបសគ្គដែលជួបប្រទះ

1. **SSR និង Composables**៖ composables ដំណើរការតែក្នុង Vue component context
2. **Seed Idempotency**៖ scripts ដំបូងធ្វើ INSERT ដោយមិនពិនិត្យទិន្នន័យដែលមានស្រាប់
3. **Environment Variables**៖ dotenv មិន load .env.local ដោយស្វ័យប្រវត្តិ
4. **Markdown Rendering**៖ ការបំប្លែង Markdown ទៅ HTML ដោយប្រើ regex
5. **ជម្លោះ nuxt-seo-utils / useI18n**៖ ការប្តូរឈ្មោះទៅ useLocale()

## ជំពូកទី ៥៖ ការដាក់ពង្រាយនៅ Vercel

- Zero config៖ Vercel រកឃើញ Nuxt ដោយស្វ័យប្រវត្តិ
- Auto-deploy៖ push នីមួយៗទៅ main ដាក់ពង្រាយ
- Serverless functions៖ server routes ក្លាយជា serverless functions
- ឥតគិតថ្លៃសម្រាប់ការប្រើប្រាស់ផ្ទាល់ខ្លួន

## ជំពូកទី ៦៖ លទ្ធផល

| រង្វាស់ | លទ្ធផល |
|---------|--------|
| Lighthouse Performance | 95+ |
| First Contentful Paint | < 1s |
| JS bundle | ~207 KB (gzip: 77 KB) |
| Neon cold start | ~500ms |

### តម្លៃប្រចាំខែ

| សេវាកម្ម | តម្លៃ |
|----------|-------|
| Vercel | $០ |
| Neon | $០ |
| Domain | ~$១២/ឆ្នាំ |
| **សរុប** | **~$១/ខែ** |

## ជំពូកទី ៧៖ អ្វីដែលខ្ញុំបានរៀន

ក្នុងនាមជាអ្នកអភិវឌ្ឍន៍ Java ដែលរកឃើញ JavaScript ទំនើប៖

**វិជ្ជមាន៖**
- ល្បឿនអភិវឌ្ឍន៍៖ ពីគំនិតដល់ការដាក់ពង្រាយក្នុងម៉ោង មិនមែនថ្ងៃ
- Hot reload៖ កែ component ហើយឃើញលទ្ធផលភ្លាមៗ
- ភាពសាមញ្ញនៃការដាក់ពង្រាយ៖ git push ហើយវានៅ production

**ខ្វះ៖**
- ភាពតឹងរ៉ឹងរបស់ Java៖ TypeScript ល្អប៉ុន្តែតឹងតិចជាង Java
- ស្ថេរភាព៖ ecosystem JavaScript ផ្លាស់ប្តូរលឿនពេក

គម្រោងនេះបានបញ្ចុះបញ្ចូលខ្ញុំថា **Java និង JavaScript គឺបំពេញគ្នា** មិនមែនប្រកួតប្រជែងគ្នាទេ។

---

*Chetana YIN — កុម្ភៈ ២០២៦*
*Engineering Manager អ្នកអភិវឌ្ឍន៍ Java ចាប់ពី 2008 បម្លែងទៅ Nuxt ចាប់ពី 2025។*`

async function seedBlogNuxtPortfolio() {
  console.log('🏗️  Seeding blog article: Nuxt 4 + Neon + Drizzle Portfolio...')

  await db.delete(blogPosts).where(eq(blogPosts.slug, 'nuxt4-neon-drizzle-portfolio'))

  await db.insert(blogPosts).values({
    slug: 'nuxt4-neon-drizzle-portfolio',
    titleFr: 'Construire un portfolio dynamique avec Nuxt 4, Neon et Drizzle',
    titleEn: 'Building a dynamic portfolio with Nuxt 4, Neon and Drizzle',
    titleKm: 'បង្កើតផលប័ត្រថាមវន្តជាមួយ Nuxt 4, Neon និង Drizzle',
    contentFr,
    contentEn,
    contentKm,
    excerptFr: "Retour d'expérience complet sur la migration d'un CV HTML statique vers Nuxt 4 + Neon PostgreSQL + Drizzle ORM : choix techniques, pièges rencontrés, et leçons d'un développeur Java.",
    excerptEn: "Complete experience report on migrating a static HTML CV to Nuxt 4 + Neon PostgreSQL + Drizzle ORM: technical choices, pitfalls, and lessons from a Java developer.",
    excerptKm: "របាយការណ៍បទពិសោធន៍ពេញលេញលើការផ្លាស់ប្តូរ CV HTML ស្ថិតិទៅ Nuxt 4 + Neon PostgreSQL + Drizzle ORM៖ ជម្រើសបច្ចេកទេស ឧបសគ្គ និងមេរៀនពីអ្នកអភិវឌ្ឍន៍ Java។",
    tags: ['Nuxt', 'Neon', 'Drizzle', 'Vue', 'TypeScript', 'Vercel'],
    published: true
  })

  console.log('✅ Blog article seeded successfully!')
}

seedBlogNuxtPortfolio().catch(console.error)
