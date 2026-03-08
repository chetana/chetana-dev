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
    descriptionFr: `## Qu'est-ce que la Médiathèque ?

La Médiathèque est un tracker multimédia personnel qui centralise l'historique de consommation culturelle de deux personnes vivant à 9 000 km de distance. Animés, jeux vidéo, films, séries — tout est tracé en un seul endroit, avec des notes personnelles, des statuts de progression, et des statistiques détaillées.

Ce n'est pas un outil public. C'est un carnet de bord culturel commun, un reflet de ce qu'on a regardé, joué, ressenti — ensemble ou séparément, mais toujours partagé.

---

## Architecture : deux couches distinctes

Le projet repose sur une séparation claire entre le stockage des données et l'affichage.

### chetaku-rs — le backend Rust

\`chetaku-rs\` est une API REST écrite en **Rust avec Axum**, déployée sur **Google Cloud Run** (serverless, région Europe-West1). Elle gère l'intégralité des données de la médiathèque :

- **Base de données** : PostgreSQL (Neon serverless)
- **ORM** : SQLx (requêtes paramétrées, pas de macros)
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

Le frontend est intégré directement dans le portfolio **chetana.dev** (Nuxt 3 / Nitro). Il sert de couche d'orchestration : il contacte \`chetaku-rs\` pour les données stockées, puis enrichit ces données à la volée en appelant les APIs tierces (Jikan, RAWG, TMDB) pour les détails riches (synopsis, cast, épisodes...).

---

## Modèle de données

Chaque entrée dans la table \`media_entries\` contient :

| Champ | Type | Description |
| --- | --- | --- |
| \`id\` | INTEGER | Identifiant interne |
| \`media_type\` | TEXT | \`anime\` / \`game\` / \`movie\` / \`series\` |
| \`external_id\` | TEXT | ID dans l'API source (MAL ID, RAWG slug, TMDB ID) |
| \`title\` | TEXT | Titre affiché |
| \`status\` | TEXT | \`watching\` / \`completed\` / \`plan_to_watch\` / etc. |
| \`score\` | SMALLINT | Note personnelle (1–10), nullable |
| \`episodes_watched\` | INTEGER | Épisodes regardés (anime et séries) |
| \`playtime_hours\` | INTEGER | Heures jouées (jeux) |
| \`genres\` | TEXT[] | Tableau de genres |
| \`creator\` | TEXT | Studio (anime), développeur (jeu), réalisateur/créateur (film/série) |
| \`notes\` | TEXT | Notes personnelles libres |
| \`platform\` | TEXT | Plateforme de jeu |
| \`cover_url\` | TEXT | URL de la jaquette |

---

## APIs tierces

Selon le type de média, les détails enrichis viennent de sources différentes :

### Anime — Jikan (MAL)
**Jikan** est l'API REST non officielle de MyAnimeList. Elle retourne synopsis, score global, studios, liste des épisodes (avec flags \`filler\` et \`recap\`), bande-annonce YouTube.

Pour les arcs narratifs, les données sont **hardcodées côté serveur** dans \`server/utils/anime-arcs.ts\` : un objet \`ANIME_ARCS\` indexé par MAL ID, permettant d'afficher quels arcs l'utilisateur a vus sans dépendre d'une API externe.

### Jeux — RAWG
**RAWG** est la plus grande base de données de jeux vidéo. Elle fournit description, score Metacritic, site officiel, équipes de développement et éditeurs, captures d'écran in-game.

### Films & Séries — TMDB
**The Movie Database** fournit synopsis, score, tagline, durée (films), réalisateur, cast (top 10 avec photos), et la liste complète des épisodes par saison (fetched en parallèle jusqu'à 15 saisons).

---

## Page de détail

La page \`/projects/medialist/[slug]\` affiche une vue riche pour chaque entrée. Les données statiques viennent de \`chetaku-rs\`, les données enrichies d'un endpoint \`/api/medialist/detail\` qui appelle les APIs tierces à la demande.

### Sections communes
- **Hero** avec jaquette, titre, type de média, statut, score personnel, score externe (MAL / Metacritic / TMDB)
- **Synopsis / Overview / Description** selon le type
- **Barre de progression** épisodes ou heures jouées
- **Notes personnelles**

### Sections spécifiques
- **Anime** : liste des épisodes avec flags filler/recap, arcs narratifs (collapsibles), bande-annonce YouTube
- **Jeux** : captures d'écran (grid 3 colonnes), studios et éditeurs, site officiel
- **Films** : réalisateur, tagline, durée, cast (grid de cercles avec photos)
- **Séries** : créateur, nombre de saisons/épisodes, cast, liste des saisons collapsibles avec indicateur "vous êtes ici"

---

## Statistiques pondérées

L'endpoint \`/stats\` calcule des métriques avancées directement en SQL :

- **Total par type** : animés, jeux, films, séries
- **Épisodes regardés** : anime + séries
- **Heures jouées** : playtime cumulé
- **Distribution des scores** : histogramme par note (1–10)
- **Genres préférés** : pondérés par \`love_score = count × avg_score\` — balance popularité et appréciation personnelle
- **Studios / Devs favoris** : top 6 classés par fréquence puis par note
- **Statuts** : répartition watching / completed / plan_to_watch

La page affiche ces stats dans une section **"Profil"** au-dessus des filtres, avec des barres proportionnelles au love_score et un dégradé de couleur selon le type de média.

---

## Pourquoi Rust pour le backend ?

Le choix de Rust pour \`chetaku-rs\` n'était pas motivé par la performance — le volume de données est modeste, Node.js aurait largement suffi. C'était une décision **délibérée de montée en compétence personnelle**.

En tant qu'Engineering Manager, je passe la plupart de mon temps à coordonner, aligner, décider — rarement à coder. Rust est un langage que je recommande parfois à mes équipes pour certains contextes (performance critique, sécurité mémoire) sans l'avoir pratiqué moi-même sur un vrai projet. Cette médiathèque était l'occasion de combler cet écart.

Mettre les mains dans Rust — ses ownership rules, son borrow checker, son système de types expressif — m'a rendu bien plus crédible dans les conversations techniques sur les trade-offs entre Rust, Go et C++. Je peux maintenant discuter des vrais frictions (la courbe d'apprentissage, la lenteur de compilation, la verbosité des traits) avec l'expérience du praticien, pas du théoricien.

Axum est un framework web minimaliste, typé à la compilation, sans magie cachée. Chaque route est une fonction Rust ordinaire. SQLx valide les requêtes SQL au moment du build. Aucune exception runtime, aucun crash silencieux.

Déployé en image Docker minimale sur Cloud Run, \`chetaku-rs\` démarre en sous-seconde, consomme ~15 Mo de RAM, et tient les requêtes concurrentes sans effort. Le coût mensuel sur Cloud Run Free Tier est de zéro.

---

## Sécurité et propriété

La Médiathèque est **en lecture publique** : n'importe qui peut voir la liste et les détails. Les opérations d'écriture (ajout, édition, suppression) sont réservées au propriétaire authentifié via Google OAuth (\`chetana.yin@gmail.com\`). Les appels vers \`chetaku-rs\` depuis le frontend passent par une clé API interne (\`x-api-key\`) jamais exposée au client.`,

    descriptionEn: `## What is the Media Library?

The Media Library is a personal multimedia tracker that centralises the cultural consumption history of two people living 9,000 km apart. Anime, video games, movies, series — everything is tracked in one place, with personal scores, progress statuses, and detailed statistics.

This isn't a public tool. It's a shared cultural logbook, a reflection of what we've watched, played, and felt — together or apart, but always shared.

---

## Architecture: two distinct layers

The project relies on a clear separation between data storage and display.

### chetaku-rs — the Rust backend

\`chetaku-rs\` is a REST API written in **Rust with Axum**, deployed on **Google Cloud Run** (serverless, Europe-West1 region). It manages all media library data:

- **Database**: PostgreSQL (Neon serverless)
- **ORM**: SQLx (parameterised queries, no macros)
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

The frontend is integrated directly into the **chetana.dev** portfolio (Nuxt 3 / Nitro). It acts as an orchestration layer: it contacts \`chetaku-rs\` for stored data, then enriches that data on the fly by calling third-party APIs (Jikan, RAWG, TMDB) for rich details (synopsis, cast, episodes...).

---

## Data Model

Each entry in the \`media_entries\` table contains:

| Field | Type | Description |
| --- | --- | --- |
| \`id\` | INTEGER | Internal identifier |
| \`media_type\` | TEXT | \`anime\` / \`game\` / \`movie\` / \`series\` |
| \`external_id\` | TEXT | ID in the source API (MAL ID, RAWG slug, TMDB ID) |
| \`title\` | TEXT | Display title |
| \`status\` | TEXT | \`watching\` / \`completed\` / \`plan_to_watch\` / etc. |
| \`score\` | SMALLINT | Personal rating (1–10), nullable |
| \`episodes_watched\` | INTEGER | Episodes watched (anime and series) |
| \`playtime_hours\` | INTEGER | Hours played (games) |
| \`genres\` | TEXT[] | Genre array |
| \`creator\` | TEXT | Studio (anime), developer (game), director/creator (movie/series) |
| \`notes\` | TEXT | Free personal notes |
| \`platform\` | TEXT | Gaming platform |
| \`cover_url\` | TEXT | Cover image URL |

---

## Third-party APIs

Depending on the media type, enriched details come from different sources:

### Anime — Jikan (MAL)
**Jikan** is the unofficial REST API for MyAnimeList. It returns synopsis, global score, studios, episode list (with \`filler\` and \`recap\` flags), and YouTube trailer.

Narrative arcs are **hardcoded server-side** in \`server/utils/anime-arcs.ts\`: an \`ANIME_ARCS\` object indexed by MAL ID, allowing arc display without depending on an external API.

### Games — RAWG
**RAWG** is the largest video game database. It provides description, Metacritic score, official website, development teams and publishers, in-game screenshots.

### Movies & Series — TMDB
**The Movie Database** provides synopsis, score, tagline, runtime (movies), director, cast (top 10 with photos), and the complete episode list per season (fetched in parallel for up to 15 seasons).

---

## Detail Page

The \`/projects/medialist/[slug]\` page displays a rich view for each entry. Static data comes from \`chetaku-rs\`, enriched data from a \`/api/medialist/detail\` endpoint that calls third-party APIs on demand.

### Common sections
- **Hero** with cover, title, media type, status, personal score, external score (MAL / Metacritic / TMDB)
- **Synopsis / Overview / Description** depending on type
- **Progress bar** for episodes or hours played
- **Personal notes**

### Type-specific sections
- **Anime**: episode list with filler/recap flags, narrative arcs (collapsible), YouTube trailer
- **Games**: screenshots (3-column grid), studios and publishers, official website
- **Movies**: director, tagline, runtime, cast (circle grid with photos)
- **Series**: creator, season/episode count, cast, collapsible season list with "you are here" indicator

---

## Weighted Statistics

The \`/stats\` endpoint calculates advanced metrics directly in SQL:

- **Total by type**: anime, games, movies, series
- **Episodes watched**: anime + series
- **Hours played**: cumulative playtime
- **Score distribution**: histogram by rating (1–10)
- **Favourite genres**: weighted by \`love_score = count × avg_score\` — balancing popularity and personal appreciation
- **Top studios / devs**: top 6 ranked by frequency then by score
- **Statuses**: breakdown of watching / completed / plan_to_watch

The page displays these stats in a **"Profile"** section above the filters, with bars proportional to the love_score and a colour gradient based on media type.

---

## Why Rust for the backend?

The choice of Rust for \`chetaku-rs\` was not driven by performance requirements — the data volume is modest, Node.js would have been perfectly fine. It was a **deliberate skill-building decision**.

As an Engineering Manager, most of my time goes into coordination, alignment, and technical decision-making — rarely hands-on coding. Rust is a language I sometimes recommend to my teams for specific contexts (performance-critical paths, memory safety requirements) without having actually shipped a real project in it myself. This media library was the opportunity to close that gap.

Getting hands-on with Rust — its ownership rules, borrow checker, and expressive type system — made me significantly more credible in technical conversations about trade-offs between Rust, Go, and C++. I can now discuss the real friction points (the learning curve, slow compile times, trait verbosity) as a practitioner, not a theorist.

Axum is a minimalist, compile-time typed web framework with no hidden magic. Every route is an ordinary Rust function. SQLx validates SQL queries at build time. No runtime exceptions, no silent crashes.

Deployed as a minimal Docker image on Cloud Run, \`chetaku-rs\` starts in under a second, uses ~15 MB of RAM, and handles concurrent requests effortlessly. Monthly cost on Cloud Run Free Tier: zero.

---

## Security and Ownership

The Media Library is **publicly readable**: anyone can view the list and details. Write operations (add, edit, delete) are restricted to the authenticated owner via Google OAuth (\`chetana.yin@gmail.com\`). Calls from the frontend to \`chetaku-rs\` go through an internal API key (\`x-api-key\`) never exposed to the client.`,

    tags: ['Rust', 'Axum', 'PostgreSQL', 'Nuxt 3', 'TMDB', 'Jikan', 'RAWG', 'Cloud Run', 'TypeScript'],
    demoUrl: 'https://chetana.dev/projects/medialist',
    githubUrl: 'https://github.com/chetana/chetaku-rs',
    featured: true,
  })

  console.log('✅ Médiathèque project seeded!')
  console.log('🎉 Done!')
}

seedMedialist().catch(console.error)
