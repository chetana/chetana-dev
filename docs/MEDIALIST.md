# Médiathèque — chetana.dev/passions/medialist

Suivi personnel d'animés, jeux vidéo, films et séries, avec statistiques pondérées et chat IA contextuel.

## Vue d'ensemble

La page `/passions/medialist` est **en lecture seule** pour tous les visiteurs. La gestion (ajout, édition, suppression) est déléguée à [admin.chetana.dev](https://admin.chetana.dev).

```
chetana.dev (Nuxt)                chetaku-rs (Rust/Axum)
─────────────────                 ────────────────────────
/passions/medialist
  index.vue        ──GET /media──▶  Neon PostgreSQL
  (liste, stats)   ◀─────────────   media_entries table
  [lecture seule]  ──GET /stats──▶
                   ◀─────────────
  [slug].vue       ──GET /media/─▶
  (détail)         ◀─────────────

server/api/medialist/                ┌──────────┐  ┌──────┐  ┌──────┐
  search.get.ts    ──search──▶       │  Jikan   │  │ RAWG │  │ TMDB │
  add.post.ts      ──POST /sync/──▶  │ (MAL v4) │  │ v1   │  │  v3  │
  update.post.ts   ──PATCH /media/─▶ └──────────┘  └──────┘  └──────┘
  [id].delete.ts   ──DELETE /media/─▶
  detail.get.ts    ──TMDB direct──▶ (cast, saisons, synopsis)
  chat.post.ts     ──Vertex AI Gemini──▶ (Google Search)

admin.chetana.dev (React/Express)
  /api/media       ──GET /media──▶  chetaku-rs
  /api/sync/*      ──POST /sync/──▶ (ajout via recherche)
  /api/media/:id   ──PATCH/DELETE─▶ (édition/suppression)
  /api/media-search ──proxy──▶ chetana.dev/api/medialist/search
```

## Backend : chetaku-rs

Service Rust hébergé sur Cloud Run (`europe-west1`). Voir le [README de chetaku-rs](https://github.com/chetana/chetaku-rs) et sa [documentation API](https://github.com/chetana/chetaku-rs/blob/main/docs/API.md).

URL : `https://chetaku-rs-267131866578.europe-west1.run.app`

## Endpoints côté Nuxt

### GET /api/medialist/search

Recherche par titre selon le type demandé. Requiert Google OAuth.

**Paramètres query :**

| Paramètre | Requis | Valeurs |
|---|---|---|
| `q` | oui | Titre à rechercher |
| `type` | oui | `anime`, `game`, `movie`, `series` |

**Comportement par type :**
- `anime` : `https://api.jikan.moe/v4/anime?q=...`
- `game` : `https://api.rawg.io/api/games?search=...`
- `movie` : `https://api.themoviedb.org/3/search/movie?query=...`
- `series` : `https://api.themoviedb.org/3/search/tv?query=...`

**Réponse 200 :**
```json
[
  { "id": 550, "title": "Fight Club", "year": 1999, "cover_url": "https://image.tmdb.org/t/p/w500/..." }
]
```

### POST /api/medialist/add

Proxy protégé (Google OAuth + owner email check) vers `chetaku-rs POST /sync/{type}`.

Seul `MEDIALIST_OWNER_EMAIL` peut ajouter des entrées.

**Body :**
```json
{
  "type": "movie",
  "tmdb_ids": [550],
  "status": "completed"
}
```

Pour `anime` : utiliser `mal_ids`. Pour `game` : utiliser `rawg_ids`. Pour `movie`/`series` : utiliser `tmdb_ids`.

### POST /api/medialist/update

Proxy protégé vers `chetaku-rs PATCH /media/{id}`.

**Body :**
```json
{
  "id": 42,
  "status": "completed",
  "score": 9,
  "notes": "Excellent"
}
```

### DELETE /api/medialist/[id]

Proxy protégé vers `chetaku-rs DELETE /media/{id}`. Owner only.

**Réponse 200 :**
```json
{ "deleted": true, "id": 42 }
```

### GET /api/medialist/detail

Récupère les métadonnées enrichies depuis TMDB directement (non stockées en DB).

**Paramètres query :**

| Paramètre | Requis | Description |
|---|---|---|
| `tmdb_id` | oui | ID TMDB |
| `type` | oui | `movie` ou `series` |

**Films :**
- `GET /movie/{id}` — synopsis (overview), score TMDB, tagline, runtime
- `GET /movie/{id}/credits` — cast (top 10 acteurs avec photo), réalisateur

**Séries :**
- `GET /tv/{id}` — synopsis, score TMDB, tagline, créateur, nombre de saisons
- `GET /tv/{id}/season/{n}` pour chaque saison — liste des épisodes (titre, numéro, date, synopsis)
- `GET /tv/{id}/credits` — cast (top 10)
- Les saisons sont fetchées en parallèle via `Promise.allSettled` (jusqu'à 15 saisons)

**Réponse 200 (film) :**
```json
{
  "overview": "Un homme déprimé souffrant d'insomnie...",
  "vote_average": 8.4,
  "tagline": "Mischief. Mayhem. Soap.",
  "runtime": 139,
  "cast": [{ "name": "Brad Pitt", "character": "Tyler Durden", "profile_path": "..." }],
  "director": "David Fincher"
}
```

**Réponse 200 (série) :**
```json
{
  "overview": "...",
  "vote_average": 9.5,
  "tagline": "...",
  "creator": "Vince Gilligan",
  "seasons": [
    {
      "season_number": 1,
      "name": "Saison 1",
      "episodes": [{ "episode_number": 1, "name": "Pilot", "air_date": "2008-01-20" }]
    }
  ],
  "cast": [...]
}
```

### POST /api/medialist/chat

Chat IA contextuel sur un animé, jeu, film ou série. Utilise Gemini 2.5 Flash avec Google Search grounding.

**Body :**
```json
{
  "title": "Breaking Bad",
  "mediaType": "series",
  "messages": [
    { "role": "user", "parts": [{ "text": "Parle-moi des thèmes philosophiques" }] }
  ]
}
```

**Réponse :**
```json
{
  "reply": "Breaking Bad explore...",
  "sources": ["https://..."]
}
```

> ⚠️ Endpoint sur `v1` (pas `v1beta`) — `thinkingConfig: { thinkingBudget: 0 }` obligatoire pour désactiver le thinking mode de Gemini 2.5 Flash.

## Interface utilisateur

> La page liste est **en lecture seule**. Aucun bouton d'ajout, d'édition ou de suppression n'est présent. Toute la gestion se fait via [admin.chetana.dev](https://admin.chetana.dev) → section Médiathèque.

### Page liste (`index.vue`)

**Filtres :**
- Type : Tous / Animés / Jeux / Films / Séries
- Statut : Tous / Terminés / En cours / Abandonné / Planifié

**Section Profil** (affichée au-dessus de la grille) :

#### Chips de stats
```
[150 Animés]  [45 Jeux]  [30 Films]  [12 Séries]
[3 450 épisodes]  [580h jouées]
[⭐ 7.8 anime]  [⭐ 8.1 jeux]  [⭐ 7.5 films]  [⭐ 8.3 séries]
```

#### ADN Genres (`top_anime_genres` + `top_game_genres` + `top_movie_genres` + `top_series_genres` fusionnés)

Genres fusionnés et dédupliqués par `love_score = count × avg_score`. La barre est proportionnelle au love_score maximum.

```
Action    ████████████████ 8.2  ×45  🎌🎮
RPG       ████████████     8.8  ×12  🎮
Drama     ██████████       7.9  ×20  🎬📺
```

Couleurs indiquent la présence du genre dans les différents types (anime, jeu, film, série).

#### Distribution des scores

Histogramme horizontal pour les notes 1–10, séparément par type via onglets (Animés / Jeux / Films / Séries).

#### Studios / Développeurs / Réalisateurs / Créateurs favoris

Top 6 par type (onglets), avec nom, nombre d'entrées, note moyenne.

**Cartes :**

Chaque carte affiche couverture, titre, statut, score et type. Aucun contrôle d'édition ou de suppression n'est affiché — tout se gère via admin.chetana.dev.

### Page détail (`[slug].vue`)

- **Header** : cover, titre, badges (status, score, type, platform, année), score TMDB, runtime/saisons en chips
- **Informations** : genres, créateur/réalisateur, épisodes/playtime, synopsis, notes personnelles
- **Cast** : grille de photos circulaires (top 10 acteurs) — fetché depuis TMDB via `detail.get.ts` au chargement
- **Saisons/épisodes** (séries et anime) : liste des saisons avec leurs épisodes, indicateur "vous êtes ici" sur l'épisode en cours (`episodes_watched`)
- **Chat IA** : interface de conversation avec Gemini + rendu markdown (`**bold**`, `*italic*`, `` `code` ``)

## Modèle de données

### `MediaEntry` (chetaku-rs)

```typescript
interface MediaEntry {
  id: number
  media_type: 'anime' | 'game' | 'movie' | 'series'
  external_id: number          // MAL ID (anime), RAWG ID (game), TMDB ID (movie/series)
  title: string
  title_original: string | null
  status: 'completed' | 'watching' | 'playing' | 'dropped' | 'plan_to_watch' | 'plan_to_play'
  score: number | null          // 1–10
  episodes_watched: number | null
  episodes_total: number | null
  playtime_hours: number | null
  platform: string | null
  cover_url: string | null
  genres: string[]
  creator: string | null        // Studio (anime), développeur (game), réalisateur (movie), créateur (series)
  year: number | null
  notes: string | null
  synced_at: string
  created_at: string
}
```

### `Stats` (chetaku-rs GET /stats)

```typescript
interface GenreStat {
  genre: string
  count: number
  avg_score: number    // moyenne des notes personnelles (entrées notées uniquement)
  love_score: number   // count × avg_score
}

interface CreatorStat {
  creator: string
  count: number
  avg_score: number | null
}

interface Stats {
  total_anime: number
  total_games: number
  total_movies: number
  total_series: number
  anime_completed: number
  games_completed: number
  movies_completed: number
  series_completed: number
  anime_watching: number
  games_playing: number
  average_anime_score: number | null
  average_game_score: number | null
  average_movie_score: number | null
  average_series_score: number | null
  total_episodes_watched: number   // anime + series
  total_playtime_hours: number
  top_genres: Array<{ genre: string; count: number }>
  top_anime_genres: GenreStat[]
  top_game_genres: GenreStat[]
  top_movie_genres: GenreStat[]
  top_series_genres: GenreStat[]
  anime_score_distribution: Array<{ score: number; count: number }>
  game_score_distribution: Array<{ score: number; count: number }>
  movie_score_distribution: Array<{ score: number; count: number }>
  series_score_distribution: Array<{ score: number; count: number }>
  anime_status: Array<{ status: string; count: number }>
  game_status: Array<{ status: string; count: number }>
  movie_status: Array<{ status: string; count: number }>
  series_status: Array<{ status: string; count: number }>
  top_anime_studios: CreatorStat[]
  top_game_developers: CreatorStat[]
  top_movie_directors: CreatorStat[]
  top_series_creators: CreatorStat[]
}
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `CHETAKU_API_URL` | URL de chetaku-rs (défaut: `https://chetaku-rs-267131866578.europe-west1.run.app`) |
| `CHETAKU_API_KEY` | Clé secrète partagée avec chetaku-rs (`x-api-key` header) |
| `MEDIALIST_OWNER_EMAIL` | Email Google autorisé à ajouter/supprimer des entrées |
| `RAWG_API_KEY` | Clé API rawg.io (passée à chetaku-rs pour la sync jeux) |
| `TMDB_API_KEY` | Clé API themoviedb.org (sync films/séries + détails cast/saisons) |

## Décisions techniques

### TMDB pour films et séries

TMDB est la seule API gratuite viable offrant des métadonnées complètes en français pour les films et séries. Auth par `?api_key=...`, langue `fr-FR` pour les titres et synopsis localisés.

### Pas de migration DB

`media_type` est stocké en TEXT dans PostgreSQL. Les nouvelles valeurs `'movie'` et `'series'` fonctionnent sans ALTER TABLE — aucune migration nécessaire.

### Cast fetché au moment de l'affichage

Le cast (top 10 acteurs) n'est pas stocké dans `media_entries`. Il est récupéré depuis TMDB dans `detail.get.ts` au moment du rendu de la page détail. Avantage : évite de stocker de grands tableaux en DB, données toujours fraîches.

### Saisons fetches en parallèle

Pour les séries, les épisodes de chaque saison sont fetched via `Promise.allSettled` (jusqu'à ~15 requêtes en parallèle), une par saison. Les saisons en erreur sont ignorées silencieusement.

### love_score

`love_score = count × avg_score` — pondération qui équilibre fréquence et qualité pour classer les préférences de genre. Calculé séparément pour chaque type de média.

### Autorisation owner-only

Les mutations (ajout, suppression) sont vérifiées côté backend : l'email Google de l'utilisateur authentifié doit correspondre à `MEDIALIST_OWNER_EMAIL`. Le frontend cache les boutons d'action pour les non-propriétaires, mais la vérification est côté serveur.

## Gestion via admin.chetana.dev

Toutes les opérations d'écriture (ajout, édition, suppression) sont maintenant gérées depuis [admin.chetana.dev](https://admin.chetana.dev) → section **Médiathèque**.

Fonctionnalités disponibles dans l'admin :
- **Onglets par type** : Animés / Jeux / Films / Séries
- **Recherche + ajout** : recherche via Jikan/RAWG/TMDB, sélection d'un résultat, choix du statut, sync vers chetaku-rs
- **Édition** : status, score, épisodes vus, playtime, platform, notes
- **Suppression** : DELETE avec confirmation

La route `/api/media-search` dans `server.js` de chetana-admin proxie les recherches vers `chetana.dev/api/medialist/search` pour éviter les problèmes CORS.
