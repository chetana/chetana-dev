import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { projects } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seedMedialist() {
  console.log('📚  Seeding Médiathèque project...')

  await db.delete(projects).where(eq(projects.slug, 'medialist'))
  console.log('🗑️  Cleared existing medialist entry')

  await db.insert(projects).values({
    slug: 'medialist',
    titleFr: 'Médiathèque',
    titleEn: 'Media Library',
    titleKm: 'បណ្ណាល័យ',
    descriptionFr: `## Pourquoi ce projet ?

La Médiathèque est née d'une envie simple en tant qu'Engineering Manager : construire quelque chose de suffisamment complexe pour être réellement formateur, mais suffisamment personnel pour rester motivant sur la durée.

Tracker des animés, jeux, films et séries, ça semble anodin. Mais dès qu'on creuse, les problèmes intéressants s'accumulent : comment agréger des données de trois APIs aux structures différentes ? Comment modéliser un suivi d'épisodes qui fonctionne aussi bien pour 12 épisodes que pour 1 000 ? Comment produire des statistiques personnelles qui révèlent quelque chose de vrai sur vos préférences, plutôt que juste compter des entrées ? Et quel rôle donner à l'IA dans l'enrichissement de chaque fiche ?

Ce sont des problèmes d'ingénierie réels — pas des exercices de formation, mais des questions auxquelles il faut répondre si on veut que l'outil soit utile.

---

## Architecture : deux couches distinctes

Le projet repose sur une séparation nette entre le stockage des données et leur présentation.

### chetaku-rs — le backend Rust

\`chetaku-rs\` est une API REST écrite en **Rust avec Axum**, déployée sur **Google Cloud Run** (serverless, région Europe-West1). Elle gère l'intégralité des données persistantes :

- **Base de données** : PostgreSQL (Neon serverless)
- **ORM** : SQLx (requêtes paramétrées, validation SQL au build)
- **Authentification** : clé API statique (\`x-api-key\`) pour les opérations d'écriture
- **CORS** : restreint à \`chetana.dev\` et \`localhost:3000\`

Les routes principales :

\`\`\`
GET    /media                      → liste paginée et filtrée
GET    /media/{type}/{externalId}  → entrée unique par type + ID externe
PATCH  /media/{id}                 → mise à jour (status, score, notes, épisodes)
DELETE /media/{id}                 → suppression (clé API requise)
GET    /stats                      → statistiques globales pondérées
POST   /sync/anime                 → synchronisation depuis MyAnimeList
POST   /sync/game                  → synchronisation depuis RAWG
POST   /sync/movie                 → synchronisation depuis TMDB
POST   /sync/series                → synchronisation depuis TMDB
\`\`\`

### chetana-dev — le frontend Nuxt 3

Le frontend est intégré dans le portfolio **chetana.dev** (Nuxt 3 / Nitro). Il joue le rôle de couche d'orchestration : il récupère les données stockées depuis \`chetaku-rs\`, puis les enrichit à la volée en interrogeant les APIs tierces selon le type de média.

---

## Modèle de données

Chaque entrée dans \`media_entries\` stocke les données de suivi personnel — pas les métadonnées publiques, qui restent côté APIs :

| Champ | Type | Description |
| --- | --- | --- |
| \`media_type\` | TEXT | \`anime\` / \`game\` / \`movie\` / \`series\` |
| \`external_id\` | TEXT | ID dans l'API source (MAL ID, RAWG slug, TMDB ID) |
| \`status\` | TEXT | \`watching\` / \`completed\` / \`plan_to_watch\` / etc. |
| \`score\` | SMALLINT | Note personnelle (1–10), nullable |
| \`episodes_watched\` | INTEGER | Épisodes vus (anime et séries) |
| \`playtime_hours\` | INTEGER | Heures jouées (jeux) |
| \`genres\` | TEXT[] | Genres (dénormalisés pour les requêtes stats) |
| \`creator\` | TEXT | Studio, développeur, réalisateur ou showrunner |
| \`notes\` | TEXT | Notes personnelles libres |

La donnée enrichie — synopsis, cast, épisodes, captures d'écran — n'est jamais stockée. Elle est fetched à la demande sur la page de détail, ce qui maintient la base légère et les APIs comme source de vérité.

---

## Orchestration multi-API : le vrai problème intéressant

Chaque type de média a sa propre source de données, avec des structures différentes et des contraintes différentes :

### Anime — Jikan (MyAnimeList)
Jikan retourne synopsis, score, studios, liste d'épisodes avec flags \`filler\` et \`recap\`, et trailer YouTube. La pagination des épisodes (100 par page) impose de gérer le cas \`has_next_page\`.

Les arcs narratifs sont **hardcodés côté serveur** dans \`server/utils/anime-arcs.ts\` — un objet indexé par MAL ID. Alternative fragile : scraper un wiki. Alternative choisie : données stables, contrôlées, maintenables.

### Jeux — RAWG
RAWG fournit description, score Metacritic, équipes de développement, éditeurs, captures d'écran in-game. L'identifiant externe est un **slug** (texte), pas un entier — ce qui impose un typage cohérent dans toute la chaîne.

### Films & Séries — TMDB
TMDB pose le défi le plus intéressant pour les séries : récupérer la liste complète des épisodes impose un appel **par saison**, en parallèle, avec gestion des séries à 15+ saisons. La solution : \`Promise.allSettled\` sur un maximum de 15 saisons, avec dégradation gracieuse si un appel échoue.

Pour les films, TMDB fournit aussi le cast (top 10 avec photos), le réalisateur, le tagline et la durée — des données qui rendent chaque fiche nettement plus riche qu'une simple jaquette + score.

---

## Suivi d'épisodes et logique "vous êtes ici"

Suivre des épisodes de manière significative est plus complexe qu'un simple compteur. L'interface affiche :

- **Barre de progression** globale (épisodes vus / total)
- **Indicateur par arc** (anime) : quels arcs sont complétés, en cours, non commencés
- **Indicateur par saison** (séries) : quelle saison correspond à l'épisode actuel

Pour les saisons, l'algorithme calcule un **offset cumulatif** : la somme des épisodes de toutes les saisons précédentes. Si j'ai vu 45 épisodes et que les saisons font respectivement 10, 13 et 26 épisodes, je suis en saison 3, épisode 22. Ce calcul est fait côté client sur les données TMDB, sans aucun appel supplémentaire.

---

## Statistiques pondérées : le love_score

L'endpoint \`/stats\` calcule des métriques avancées directement en SQL, en parallèle avec \`tokio::join!\` :

- **Distribution des scores** : histogramme 1–10 par type de média
- **Genres préférés** : pondérés par \`love_score = COUNT(*) × AVG(score)\` — un genre vu 12 fois avec une note moyenne de 9.2 est mieux classé qu'un genre vu 30 fois avec une note de 5.8
- **Studios / Devs favoris** : top 6 par fréquence puis par note moyenne
- **Statuts** : répartition watching / completed / plan_to_watch

Le \`love_score\` est la métrique centrale. Un simple compteur ne dit pas grand chose — il reflète l'exposition, pas l'appréciation. Le \`love_score\` force une balance entre fréquence et qualité perçue, ce qui donne un profil de préférences nettement plus honnête.

---

## Pourquoi Rust ?

Rust n'était pas le choix pragmatique ici — Node.js aurait suffi. C'était un choix **délibéré de montée en compétence**.

En tant qu'Engineering Manager, je suis régulièrement amené à évaluer des choix d'architecture impliquant Rust : performance critique, sécurité mémoire, workloads embarqués. Mais recommander ou challenger un choix Rust sans l'avoir pratiqué soi-même sur un vrai projet reste une position fragile. Ce projet était l'occasion de combler cet écart.

Le borrow checker, les lifetimes, le modèle d'ownership, les traits async — tout ça ne se comprend vraiment qu'en les rencontrant sur du code réel, pas en lisant de la documentation. Après ce projet, je peux discuter des frictions réelles de Rust avec mes équipes à partir d'une expérience concrète, pas d'une lecture.

Résultat opérationnel : \`chetaku-rs\` tourne sur Cloud Run Free Tier, démarre en sous-seconde, consomme ~15 Mo de RAM, et n'a eu aucun crash depuis son déploiement. Le compilateur Rust a éliminé à la conception les classes entières de bugs qui auraient pu apparaître en production.

---

## Sécurité et accès

La médiathèque est **en lecture publique** : la liste et les fiches sont accessibles à tous. Les opérations d'écriture (ajout, édition, suppression) sont réservées au propriétaire authentifié via Google OAuth. Les appels vers \`chetaku-rs\` transitent par une clé API interne jamais exposée côté client.`,

    descriptionEn: `## Why this project?

The Media Library started from a simple goal as an Engineering Manager: build something complex enough to be genuinely instructive, but personal enough to stay motivating over time.

Tracking anime, games, movies and series sounds trivial. But as soon as you dig in, interesting problems accumulate: how do you aggregate data from three APIs with different structures? How do you model episode tracking that works equally well for 12 episodes and 1,000? How do you produce personal statistics that reveal something true about your preferences, rather than just counting entries? And what role should AI play in enriching each entry?

These are real engineering problems — not training exercises, but questions that need answers if the tool is going to be useful.

---

## Architecture: two distinct layers

The project relies on a clean separation between data storage and its presentation.

### chetaku-rs — the Rust backend

\`chetaku-rs\` is a REST API written in **Rust with Axum**, deployed on **Google Cloud Run** (serverless, Europe-West1 region). It manages all persistent data:

- **Database**: PostgreSQL (Neon serverless)
- **ORM**: SQLx (parameterised queries, SQL validated at build time)
- **Authentication**: static API key (\`x-api-key\`) for write operations
- **CORS**: restricted to \`chetana.dev\` and \`localhost:3000\`

Main routes:

\`\`\`
GET    /media                      → paginated and filtered list
GET    /media/{type}/{externalId}  → single entry by type + external ID
PATCH  /media/{id}                 → update (status, score, notes, episodes)
DELETE /media/{id}                 → deletion (API key required)
GET    /stats                      → weighted global statistics
POST   /sync/anime                 → sync from MyAnimeList
POST   /sync/game                  → sync from RAWG
POST   /sync/movie                 → sync from TMDB
POST   /sync/series                → sync from TMDB
\`\`\`

### chetana-dev — the Nuxt 3 frontend

The frontend lives inside the **chetana.dev** portfolio (Nuxt 3 / Nitro). It acts as an orchestration layer: it fetches stored data from \`chetaku-rs\`, then enriches it on the fly by querying third-party APIs depending on the media type.

---

## Data Model

Each entry in \`media_entries\` stores personal tracking data — not public metadata, which stays on the API side:

| Field | Type | Description |
| --- | --- | --- |
| \`media_type\` | TEXT | \`anime\` / \`game\` / \`movie\` / \`series\` |
| \`external_id\` | TEXT | ID in the source API (MAL ID, RAWG slug, TMDB ID) |
| \`status\` | TEXT | \`watching\` / \`completed\` / \`plan_to_watch\` / etc. |
| \`score\` | SMALLINT | Personal rating (1–10), nullable |
| \`episodes_watched\` | INTEGER | Episodes watched (anime and series) |
| \`playtime_hours\` | INTEGER | Hours played (games) |
| \`genres\` | TEXT[] | Genres (denormalised for stats queries) |
| \`creator\` | TEXT | Studio, developer, director or showrunner |
| \`notes\` | TEXT | Free personal notes |

Enriched data — synopsis, cast, episodes, screenshots — is never stored. It's fetched on demand on the detail page, keeping the database light and the APIs as the source of truth.

---

## Multi-API orchestration: the interesting problem

Each media type has its own data source, with different structures and different constraints:

### Anime — Jikan (MyAnimeList)
Jikan returns synopsis, score, studios, episode list with \`filler\` and \`recap\` flags, and YouTube trailer. Episode pagination (100 per page) requires handling the \`has_next_page\` case.

Narrative arcs are **hardcoded server-side** in \`server/utils/anime-arcs.ts\` — an object indexed by MAL ID. The fragile alternative: scraping a wiki. The chosen alternative: stable, controlled, maintainable data.

### Games — RAWG
RAWG provides description, Metacritic score, development teams, publishers, in-game screenshots. The external identifier is a **slug** (text), not an integer — requiring consistent typing throughout the chain.

### Movies & Series — TMDB
TMDB poses the most interesting challenge for series: retrieving the complete episode list requires one call **per season**, in parallel, handling series with 15+ seasons. The solution: \`Promise.allSettled\` over a maximum of 15 seasons, with graceful degradation if a call fails.

For movies, TMDB also provides cast (top 10 with photos), director, tagline and runtime — data that makes each entry significantly richer than a cover image and a score.

---

## Episode tracking and the "you are here" logic

Tracking episodes meaningfully is more complex than a simple counter. The interface shows:

- **Global progress bar** (episodes watched / total)
- **Per-arc indicator** (anime): which arcs are completed, in progress, not started
- **Per-season indicator** (series): which season the current episode falls in

For seasons, the algorithm calculates a **cumulative offset**: the sum of all episodes in previous seasons. If you've watched 45 episodes and the seasons have 10, 13 and 26 episodes respectively, you're in season 3, episode 22. This is computed client-side from TMDB data, with no additional API call.

---

## Weighted statistics: the love_score

The \`/stats\` endpoint calculates advanced metrics directly in SQL, in parallel with \`tokio::join!\`:

- **Score distribution**: 1–10 histogram per media type
- **Favourite genres**: weighted by \`love_score = COUNT(*) × AVG(score)\` — a genre watched 12 times with an average rating of 9.2 ranks higher than one watched 30 times with a rating of 5.8
- **Top studios / devs**: top 6 ranked by frequency then by average score
- **Statuses**: breakdown of watching / completed / plan_to_watch

The \`love_score\` is the central metric. A simple count says little — it reflects exposure, not appreciation. The \`love_score\` forces a balance between frequency and perceived quality, producing a significantly more honest preference profile.

---

## Why Rust?

Rust wasn't the pragmatic choice here — Node.js would have been perfectly fine. It was a **deliberate skill-building decision**.

As an Engineering Manager, I'm regularly called on to evaluate architectural choices involving Rust: performance-critical paths, memory safety requirements, embedded workloads. But recommending or challenging a Rust decision without having shipped a real project in it myself remains a fragile position. This project was the opportunity to close that gap.

The borrow checker, lifetimes, ownership model, async traits — none of it is truly understood until you encounter it in real code, not documentation. After this project, I can discuss the real friction points of Rust with my teams from concrete experience, not from reading.

Operational result: \`chetaku-rs\` runs on Cloud Run Free Tier, starts in under a second, uses ~15 MB of RAM, and has had zero crashes since deployment. The Rust compiler eliminated entire classes of bugs at design time that would otherwise have surfaced in production.

---

## Security and access

The media library is **publicly readable**: the list and detail pages are accessible to everyone. Write operations (add, edit, delete) are restricted to the authenticated owner via Google OAuth. Calls from the frontend to \`chetaku-rs\` go through an internal API key never exposed to the client.`,

    tags: ['Rust', 'Axum', 'PostgreSQL', 'Nuxt 3', 'TMDB', 'Jikan', 'RAWG', 'Cloud Run', 'TypeScript', 'Engineering Manager'],
    demoUrl: 'https://chetana.dev/projects/medialist',
    githubUrl: 'https://github.com/chetana/chetaku-rs',
    featured: true,
  })

  console.log('✅ Médiathèque project seeded!')
  console.log('🎉 Done!')
}

seedMedialist().catch(console.error)
