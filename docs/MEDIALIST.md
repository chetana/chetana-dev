# Médiathèque — chetana.dev/projects/medialist

Suivi personnel d'animés et de jeux vidéo, avec statistiques pondérées et chat IA contextuel.

## Vue d'ensemble

```
chetana.dev (Nuxt)                chetaku-rs (Rust/Axum)
─────────────────                 ────────────────────────
/projects/medialist
  index.vue        ──GET /media──▶  Neon PostgreSQL
  (liste, stats)   ◀─────────────   media_entries table
                   ──GET /stats──▶
                   ◀─────────────
  [slug].vue       ──GET /media/─▶
  (détail)         ◀─────────────
                                     ┌──────────┐  ┌──────┐
server/api/medialist/                │  Jikan   │  │ RAWG │
  sync.post.ts    ──POST /sync/──▶   │ (MAL v4) │  │ v1   │
  update.post.ts  ──PATCH /media/─▶  └──────────┘  └──────┘
  chat.post.ts    ──Vertex AI Gemini──▶ (Google Search)
```

## Backend : chetaku-rs

Service Rust hébergé sur Cloud Run (`europe-west1`). Voir le [README de chetaku-rs](https://github.com/chetana/chetaku-rs) et sa [documentation API](https://github.com/chetana/chetaku-rs/blob/main/docs/API.md).

URL : `https://chetaku-rs-mef67kip3a-ew.a.run.app`

## Endpoints côté Nuxt

### POST /api/medialist/sync

Proxy protégé (Google OAuth + owner email check) vers `chetaku-rs POST /sync/anime` ou `POST /sync/game`.

Seul `MEDIALIST_OWNER_EMAIL` peut synchroniser des entrées.

**Body :**
```json
{
  "type": "anime",
  "ids": [5114, 1],
  "status": "completed"
}
```

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

### POST /api/medialist/chat

Chat IA contextuel sur un animé ou jeu. Utilise Gemini 2.5 Flash avec Google Search grounding.

**Body :**
```json
{
  "title": "Fullmetal Alchemist: Brotherhood",
  "mediaType": "anime",
  "messages": [
    { "role": "user", "parts": [{ "text": "Parle-moi des thèmes philosophiques" }] }
  ]
}
```

**Réponse :**
```json
{
  "reply": "FMA:Brotherhood explore...",
  "sources": ["https://..."]
}
```

Gemini utilise Google Search pour enrichir ses réponses avec des informations actualisées.

> ⚠️ Endpoint sur `v1` (pas `v1beta`) — `thinkingConfig: { thinkingBudget: 0 }` obligatoire pour désactiver le thinking mode de Gemini 2.5 Flash.

## Interface utilisateur

### Page liste (`index.vue`)

**Filtres :**
- Type : Tous / Animés / Jeux
- Statut : Tous / Terminés / En cours / Abandonné / Planifié

**Section Profil** (affichée au-dessus de la grille) :

#### Chips de stats
```
[150 Animés]  [45 Jeux]  [3 450 épisodes]  [580h jouées]
[⭐ 7.8 anime]  [⭐ 8.1 jeux]  [120 terminés]  [30 terminés]
```

#### ADN Genres (`top_anime_genres` + `top_game_genres` fusionnés)

Genres fusionnés et dédupliqués par `love_score = count × avg_score`. La barre est proportionnelle au love_score maximum.

```
Action    ████████████████ 8.2  ×45  🎌🎮
RPG       ████████████     8.8  ×12  🎮
Fantasy   ██████████       7.9  ×38  🎌
```

Couleurs :
- `--gradient` (violet) : genre présent uniquement en anime
- `#3b82f6` (bleu) : genre présent uniquement en jeu
- `#7c3aed` (violet foncé) : genre présent dans les deux

#### Distribution des scores

Histogramme horizontal pour les notes 1–10 (séparément anime / jeux via onglets).

#### Studios / Développeurs favoris

Top 6 avec nom, nombre d'entrées, note moyenne.

### Page détail (`[slug].vue`)

- **Header** : cover, titre, badges (status, score, type, platform, année)
- **Informations** : genres, créateur, épisodes/playtime, notes personnelles
- **Chat IA** : interface de conversation avec Gemini + rendu markdown (`**bold**`, `*italic*`, `` `code` ``)

## Modèle de données

### `MediaEntry` (chetaku-rs)

```typescript
interface MediaEntry {
  id: number
  media_type: 'anime' | 'game'
  external_id: number          // MAL ID ou RAWG ID
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
  creator: string | null        // Studio (anime) ou développeur (game)
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

interface Stats {
  total_anime: number
  total_games: number
  anime_completed: number
  games_completed: number
  anime_watching: number
  games_playing: number
  average_anime_score: number | null
  average_game_score: number | null
  total_episodes_watched: number
  total_playtime_hours: number
  top_genres: Array<{ genre: string; count: number }>
  top_anime_genres: GenreStat[]
  top_game_genres: GenreStat[]
  anime_score_distribution: Array<{ score: number; count: number }>
  game_score_distribution: Array<{ score: number; count: number }>
  anime_status: Array<{ status: string; count: number }>
  game_status: Array<{ status: string; count: number }>
  top_anime_studios: Array<{ creator: string; count: number; avg_score: number | null }>
  top_game_developers: Array<{ creator: string; count: number; avg_score: number | null }>
}
```

## Variables d'environnement

| Variable | Description |
|---|---|
| `CHETAKU_API_URL` | URL de chetaku-rs (défaut: `https://chetaku-rs-mef67kip3a-ew.a.run.app`) |
| `CHETAKU_API_KEY` | Clé secrète partagée avec chetaku-rs (`x-api-key` header) |
| `MEDIALIST_OWNER_EMAIL` | Email Google autorisé à ajouter/éditer des entrées |
| `RAWG_API_KEY` | Clé API rawg.io (passée à chetaku-rs pour la sync jeux) |

## Auto-refresh des stats

Les stats sont rechargées automatiquement après chaque ajout ou modification d'entrée. `refreshStats()` est appelé à la fin de `confirmAdd()` et `saveEdit()` dans `index.vue`.

## Autorisation (owner-only)

Les actions d'écriture (ajouter, éditer) vérifient côté backend que l'email Google de l'utilisateur authentifié correspond à `MEDIALIST_OWNER_EMAIL`. Les visiteurs peuvent uniquement consulter la liste et les détails.
