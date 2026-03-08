<script setup lang="ts">
interface MediaEntry {
  id: number
  media_type: 'anime' | 'game' | 'movie' | 'series'
  external_id: number
  title: string
  title_original: string | null
  status: string
  score: number | null
  episodes_watched: number | null
  episodes_total: number | null
  playtime_hours: number | null
  platform: string | null
  cover_url: string | null
  genres: string[]
  creator: string | null
  year: number | null
  notes: string | null
}

interface GenreStat { genre: string; count: number; avg_score: number; love_score: number }
interface ScoreCount { score: number; count: number }
interface StatusCount { status: string; count: number }
interface CreatorStat { creator: string; count: number; avg_score: number | null }

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
  total_episodes_watched: number
  total_playtime_hours: number
  top_genres: Array<{ genre: string; count: number }>
  top_anime_genres: GenreStat[]
  top_game_genres: GenreStat[]
  top_movie_genres: GenreStat[]
  top_series_genres: GenreStat[]
  anime_score_distribution: ScoreCount[]
  game_score_distribution: ScoreCount[]
  movie_score_distribution: ScoreCount[]
  series_score_distribution: ScoreCount[]
  anime_status: StatusCount[]
  game_status: StatusCount[]
  movie_status: StatusCount[]
  series_status: StatusCount[]
  top_anime_studios: CreatorStat[]
  top_game_developers: CreatorStat[]
  top_movie_directors: CreatorStat[]
  top_series_creators: CreatorStat[]
}

interface SearchResult {
  id: number
  title: string
  title_original: string | null
  cover_url: string | null
  year: number | null
  episodes: number | null
  genres: string[]
  creator: string | null
}

const API_BASE = 'https://chetaku-rs-267131866578.europe-west1.run.app'
const config = useRuntimeConfig()

// ── List & filters ──────────────────────────────────────────────────────────
const typeFilter = ref<'' | 'anime' | 'game' | 'movie' | 'series'>('')
const statusFilter = ref<'' | 'completed' | 'ongoing' | 'planned' | 'dropped'>('')
const titleFilter = ref('')

const { data: allMedia, pending, refresh: refreshList } = useFetch<MediaEntry[]>(`${API_BASE}/media`)
const { data: stats, refresh: refreshStats } = useFetch<Stats>(`${API_BASE}/stats`)

const filtered = computed(() => {
  if (!allMedia.value) return []
  const q = titleFilter.value.trim().toLowerCase()
  return allMedia.value.filter(m => {
    if (typeFilter.value && m.media_type !== typeFilter.value) return false
    if (statusFilter.value === 'ongoing') return ['watching', 'playing'].includes(m.status)
    if (statusFilter.value === 'planned') return ['planned', 'plan_to_watch', 'plan_to_play'].includes(m.status)
    if (statusFilter.value === 'dropped') return m.status === 'dropped'
    if (statusFilter.value && m.status !== statusFilter.value) return false
    if (q) {
      const inTitle = m.title.toLowerCase().includes(q)
      const inOrig = m.title_original?.toLowerCase().includes(q) ?? false
      if (!inTitle && !inOrig) return false
    }
    return true
  })
})

// ── Profil stats helpers ─────────────────────────────────────────────────────
interface MergedGenre {
  genre: string; love: number
  hasAnime: boolean; hasGame: boolean; hasMovie: boolean; hasSeries: boolean
  avgSum: number; avgCount: number; count: number
}

const mergedGenres = computed<MergedGenre[]>(() => {
  if (!stats.value) return []
  const map = new Map<string, MergedGenre>()

  const addGenre = (g: GenreStat, key: keyof Pick<MergedGenre, 'hasAnime'|'hasGame'|'hasMovie'|'hasSeries'>) => {
    const ex = map.get(g.genre)
    if (ex) {
      ex.love += g.love_score; ex.count += g.count
      ex.avgSum += g.avg_score; ex.avgCount += 1
      ex[key] = true
    } else {
      map.set(g.genre, { genre: g.genre, love: g.love_score, count: g.count,
        hasAnime: false, hasGame: false, hasMovie: false, hasSeries: false,
        avgSum: g.avg_score, avgCount: 1, [key]: true } as MergedGenre)
    }
  }

  for (const g of stats.value.top_anime_genres)  addGenre(g, 'hasAnime')
  for (const g of stats.value.top_game_genres)   addGenre(g, 'hasGame')
  for (const g of stats.value.top_movie_genres)  addGenre(g, 'hasMovie')
  for (const g of stats.value.top_series_genres) addGenre(g, 'hasSeries')

  return [...map.values()].sort((a, b) => b.love - a.love).slice(0, 12)
})

const maxLove = computed(() => Math.max(...mergedGenres.value.map(g => g.love), 1))

function genreBarWidth(g: MergedGenre) { return `${(g.love / maxLove.value) * 100}%` }
function genreBarColor(g: MergedGenre) {
  const types = [g.hasAnime, g.hasGame, g.hasMovie, g.hasSeries].filter(Boolean).length
  if (types > 1) return 'linear-gradient(90deg, var(--accent), #3b82f6)'
  if (g.hasGame) return '#3b82f6'
  if (g.hasMovie) return '#dc2626'
  if (g.hasSeries) return '#7c3aed'
  return 'var(--gradient)'
}
function genreAvgScore(g: MergedGenre) {
  return (g.avgSum / g.avgCount).toFixed(1)
}
function genreIcons(g: MergedGenre) {
  const icons = []
  if (g.hasAnime)  icons.push('🎌')
  if (g.hasGame)   icons.push('🎮')
  if (g.hasMovie)  icons.push('🎬')
  if (g.hasSeries) icons.push('📺')
  return icons.join('')
}

function scoreBarWidth(count: number, dist: ScoreCount[]) {
  const max = Math.max(...dist.map(s => s.count), 1)
  return `${(count / max) * 100}%`
}

const creatorsTab = ref<'anime' | 'game' | 'movie' | 'series'>('anime')
const scoreDistTab = ref<'anime' | 'game' | 'movie' | 'series'>('anime')
const statsOpen = ref(false)

// ── Pagination front-end ─────────────────────────────────────────────────────
const PAGE_SIZE = 30
const displayedCount = ref(PAGE_SIZE)
const displayed = computed(() => filtered.value.slice(0, displayedCount.value))
const hasMore = computed(() => displayedCount.value < filtered.value.length)
watch([typeFilter, statusFilter, titleFilter], () => { displayedCount.value = PAGE_SIZE })

// Auto-ouvre avec animation une fois les stats chargées
watch(stats, (val) => {
  if (val && !statsOpen.value) {
    setTimeout(() => { statsOpen.value = true }, 150)
  }
})
const STATUS_LABEL_FR: Record<string, string> = {
  completed: 'Terminés', watching: 'En cours', playing: 'En cours',
  planned: 'Prévus', plan_to_watch: 'Prévus', plan_to_play: 'Prévus', dropped: 'Abandonnés',
}

const STATUS_LABEL: Record<string, string> = {
  completed: 'Terminé',
  watching: 'En cours',
  playing: 'En cours',
  planned: 'Prévu',
  plan_to_watch: 'À voir',
  plan_to_play: 'À jouer',
  dropped: 'Abandonné',
}

function scoreColor(score: number): string {
  if (score >= 9) return '#22c55e'
  if (score >= 7) return '#10b981'
  if (score >= 5) return '#f59e0b'
  if (score >= 3) return '#f97316'
  return '#ef4444'
}

const STATUS_COLOR: Record<string, string> = {
  completed: 'green',
  watching: 'blue',
  playing: 'blue',
  planned: 'gray',
  plan_to_watch: 'gray',
  plan_to_play: 'gray',
  dropped: 'orange',
}

// ── Auth ─────────────────────────────────────────────────────────────────────
const { isAuthenticated, userEmail, loadFromStorage, getAuthHeaders, initGIS, signOut } = useGoogleAuth()
const googleBtnRef = ref<HTMLElement | null>(null)
const isOwner = computed(() => isAuthenticated.value && userEmail.value === config.public.medialistOwnerEmail)

onMounted(() => {
  loadFromStorage()
  const script = document.createElement('script')
  script.src = 'https://accounts.google.com/gsi/client'
  script.async = true
  script.onload = () => initGIS(googleBtnRef.value)
  document.head.appendChild(script)
})

// ── Edit modal ───────────────────────────────────────────────────────────────
const editEntry = ref<MediaEntry | null>(null)
const editStatus = ref('')
const editPlatform = ref('')
const editEpisodesWatched = ref<number | null>(null)
const editScore = ref<number | null>(null)
const saving = ref(false)
const editError = ref('')

function openEdit(entry: MediaEntry) {
  editEntry.value = entry
  editStatus.value = entry.status
  editPlatform.value = entry.platform ?? ''
  editEpisodesWatched.value = entry.episodes_watched
  editScore.value = entry.score
  editError.value = ''
}

function closeEdit() {
  editEntry.value = null
}

async function deleteEntry(entry: MediaEntry) {
  if (!confirm(`Supprimer "${entry.title}" définitivement ?`)) return
  try {
    await $fetch(`/api/medialist/${entry.id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    })
    await refreshList()
    await refreshStats()
  } catch (e: any) {
    alert(e?.data?.statusMessage ?? 'Erreur lors de la suppression')
  }
}

async function saveEdit() {
  if (!editEntry.value) return
  saving.value = true
  editError.value = ''
  try {
    const body: Record<string, unknown> = { status: editStatus.value }
    if (editEntry.value.media_type === 'game') body.platform = editPlatform.value || null
    if (editEntry.value.media_type === 'anime' || editEntry.value.media_type === 'series') body.episodes_watched = editEpisodesWatched.value
    if (editScore.value !== null) body.score = editScore.value

    await $fetch(`/api/medialist/${editEntry.value.id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body,
    })
    closeEdit()
    await refreshList()
    await refreshStats()
  } catch (e: any) {
    editError.value = e?.data?.statusMessage ?? 'Erreur lors de la sauvegarde'
  } finally {
    saving.value = false
  }
}

// ── Search modal ─────────────────────────────────────────────────────────────
const showModal = ref(false)
const searchType = ref<'anime' | 'game' | 'movie' | 'series'>('anime')
const searchQuery = ref('')
const searchResults = ref<SearchResult[]>([])
const searching = ref(false)
const selectedResult = ref<SearchResult | null>(null)

// Status options per type
const ANIME_STATUSES = [
  { value: 'completed', label: '✅ Terminé' },
  { value: 'watching', label: '▶️ En cours' },
  { value: 'planned', label: '📋 Prévu' },
  { value: 'dropped', label: '🚫 Abandonné' },
]
const GAME_STATUSES = [
  { value: 'completed', label: '✅ Terminé' },
  { value: 'playing', label: '▶️ En cours' },
  { value: 'planned', label: '📋 Prévu' },
  { value: 'dropped', label: '🚫 Abandonné' },
]
const MOVIE_STATUSES = [
  { value: 'completed', label: '✅ Vu' },
  { value: 'planned', label: '📋 À voir' },
  { value: 'dropped', label: '🚫 Abandonné' },
]
const SERIES_STATUSES = [
  { value: 'completed', label: '✅ Terminée' },
  { value: 'watching', label: '▶️ En cours' },
  { value: 'planned', label: '📋 À voir' },
  { value: 'dropped', label: '🚫 Abandonnée' },
]

function statusOptionsFor(type: string) {
  if (type === 'game') return GAME_STATUSES
  if (type === 'movie') return MOVIE_STATUSES
  if (type === 'series') return SERIES_STATUSES
  return ANIME_STATUSES
}
const addStatus = ref('completed')
const addPlatform = ref('')
const adding = ref(false)
const addError = ref('')
const addSuccess = ref('')

let searchTimer: ReturnType<typeof setTimeout> | null = null

watch(searchQuery, (val) => {
  searchResults.value = []
  selectedResult.value = null
  if (searchTimer) clearTimeout(searchTimer)
  if (val.trim().length < 2) return
  searching.value = true
  searchTimer = setTimeout(doSearch, 400)
})

watch(searchType, () => {
  searchQuery.value = ''
  searchResults.value = []
  selectedResult.value = null
  addStatus.value = 'completed'
})

function openModal() {
  showModal.value = true
  searchQuery.value = ''
  searchResults.value = []
  selectedResult.value = null
  addStatus.value = 'completed'
  addPlatform.value = ''
  addError.value = ''
  addSuccess.value = ''
}

function closeModal() {
  showModal.value = false
}

async function doSearch() {
  searching.value = true
  try {
    const res = await $fetch<SearchResult[]>('/api/medialist/search', {
      query: { q: searchQuery.value, type: searchType.value },
    })
    searchResults.value = res
  } catch {
    searchResults.value = []
  } finally {
    searching.value = false
  }
}

function selectResult(r: SearchResult) {
  selectedResult.value = r
  addStatus.value = 'completed'
  addPlatform.value = ''
  addError.value = ''
  addSuccess.value = ''
}

async function confirmAdd() {
  if (!selectedResult.value) return
  adding.value = true
  addError.value = ''
  addSuccess.value = ''
  try {
    await $fetch('/api/medialist/add', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: {
        type: searchType.value,
        id: selectedResult.value.id,
        status: addStatus.value,
        platform: addPlatform.value || undefined,
      },
    })
    addSuccess.value = `"${selectedResult.value.title}" ajouté !`
    selectedResult.value = null
    searchQuery.value = ''
    searchResults.value = []
    await refreshList()
    await refreshStats()
  } catch (e: any) {
    addError.value = e?.data?.statusMessage ?? 'Erreur lors de l\'ajout'
  } finally {
    adding.value = false
  }
}

useSeoMeta({
  title: 'Médiathèque · Chetana YIN',
  description: 'Ma liste personnelle d\'animés et de jeux vidéo.',
})
</script>

<template>
  <div class="section medialist-page" style="padding-top: 8rem;">
    <NuxtLink to="/passions" class="back-link">← Passions</NuxtLink>

    <div class="section-label">Médiathèque</div>
    <h1 class="section-title">Médiathèque</h1>
    <p class="page-subtitle">Ma liste personnelle — animés, films, séries et jeux.</p>

    <!-- ── Profil ── -->
    <div v-if="stats" class="profile-section">
      <button class="stats-toggle" @click="statsOpen = !statsOpen">
        <span class="stats-toggle-label">📊 Mon profil média</span>
        <span class="stats-toggle-chevron" :class="{ open: statsOpen }">›</span>
      </button>
      <div class="stats-body" :class="{ open: statsOpen }">

      <!-- Chips de stats -->
      <div class="stats-strip">
        <div class="stat-item">
          <span class="stat-value">{{ stats.total_anime }}</span>
          <span class="stat-label">🎌 Animés</span>
        </div>
        <div v-if="stats.total_movies" class="stat-item">
          <span class="stat-value">{{ stats.total_movies }}</span>
          <span class="stat-label">🎬 Films</span>
        </div>
        <div v-if="stats.total_series" class="stat-item">
          <span class="stat-value">{{ stats.total_series }}</span>
          <span class="stat-label">📺 Séries</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.total_games }}</span>
          <span class="stat-label">🎮 Jeux</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.total_episodes_watched.toLocaleString('fr-FR') }}</span>
          <span class="stat-label">Épisodes vus</span>
        </div>
        <div v-if="stats.total_playtime_hours" class="stat-item">
          <span class="stat-value">{{ stats.total_playtime_hours.toLocaleString('fr-FR') }}</span>
          <span class="stat-label">Heures jouées</span>
        </div>
        <div class="stat-item">
          <span class="stat-value">{{ stats.anime_completed + stats.games_completed + stats.movies_completed + stats.series_completed }}</span>
          <span class="stat-label">Terminés</span>
        </div>
      </div>

      <!-- ADN genres -->
      <div v-if="mergedGenres.length" class="profile-block">
        <h3 class="profile-block-title">🧬 ADN — Genres préférés</h3>
        <div class="genre-dna">
          <div v-for="g in mergedGenres" :key="g.genre" class="genre-row">
            <div class="genre-meta">
              <span class="genre-name">{{ g.genre }}</span>
              <span class="genre-icons">{{ genreIcons(g) }}</span>
            </div>
            <div class="genre-bar-track">
              <div class="genre-bar-fill" :style="{ width: genreBarWidth(g), background: genreBarColor(g) }" />
            </div>
            <div class="genre-score-info">
              <span class="genre-avg" :style="{ color: scoreColor(Math.round(+genreAvgScore(g))) }">{{ genreAvgScore(g) }}</span>
              <span class="genre-count">×{{ g.count }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Distribution scores + Studios -->
      <div class="profile-row">

        <!-- Distribution des scores -->
        <div class="profile-block profile-block-half">
          <h3 class="profile-block-title">📊 Distribution des notes</h3>
          <div class="score-tabs">
            <button :class="['score-tab', scoreDistTab === 'anime' && 'active']" @click="scoreDistTab = 'anime'">🎌</button>
            <button :class="['score-tab', scoreDistTab === 'movie' && 'active']" @click="scoreDistTab = 'movie'">🎬</button>
            <button :class="['score-tab', scoreDistTab === 'series' && 'active']" @click="scoreDistTab = 'series'">📺</button>
            <button :class="['score-tab', scoreDistTab === 'game' && 'active']" @click="scoreDistTab = 'game'">🎮</button>
          </div>
          <div class="score-dist">
            <template v-for="s in (
              scoreDistTab === 'anime' ? stats.anime_score_distribution :
              scoreDistTab === 'movie' ? stats.movie_score_distribution :
              scoreDistTab === 'series' ? stats.series_score_distribution :
              stats.game_score_distribution
            )" :key="s.score">
              <span class="score-label" :style="{ color: scoreColor(s.score) }">{{ s.score }}</span>
              <div class="score-bar-track">
                <div class="score-bar-fill"
                  :style="{
                    width: scoreBarWidth(s.count, scoreDistTab === 'anime' ? stats.anime_score_distribution : scoreDistTab === 'movie' ? stats.movie_score_distribution : scoreDistTab === 'series' ? stats.series_score_distribution : stats.game_score_distribution),
                    background: scoreColor(s.score)
                  }"
                />
              </div>
              <span class="score-count">{{ s.count }}</span>
            </template>
          </div>
        </div>

        <!-- Studios / Devs favoris -->
        <div class="profile-block profile-block-half">
          <h3 class="profile-block-title">🏆 Créateurs favoris</h3>
          <div class="score-tabs">
            <button :class="['score-tab', creatorsTab === 'anime' && 'active']" @click="creatorsTab = 'anime'">🎌</button>
            <button :class="['score-tab', creatorsTab === 'movie' && 'active']" @click="creatorsTab = 'movie'">🎬</button>
            <button :class="['score-tab', creatorsTab === 'series' && 'active']" @click="creatorsTab = 'series'">📺</button>
            <button :class="['score-tab', creatorsTab === 'game' && 'active']" @click="creatorsTab = 'game'">🎮</button>
          </div>
          <div class="creator-list">
            <div
              v-for="c in (
                creatorsTab === 'anime' ? stats.top_anime_studios :
                creatorsTab === 'movie' ? stats.top_movie_directors :
                creatorsTab === 'series' ? stats.top_series_creators :
                stats.top_game_developers
              )"
              :key="c.creator"
              class="creator-row"
            >
              <span class="creator-name">{{ c.creator }}</span>
              <span class="creator-meta">
                <span v-if="c.avg_score" class="creator-score" :style="{ color: scoreColor(Math.round(c.avg_score)) }">★ {{ c.avg_score.toFixed(1) }}</span>
                <span class="creator-count">{{ c.count }} titre{{ c.count > 1 ? 's' : '' }}</span>
              </span>
            </div>
          </div>
        </div>

      </div>
      </div><!-- /stats-body -->
    </div>

    <!-- Search -->
    <div class="search-bar">
      <span class="search-icon">🔍</span>
      <input
        v-model="titleFilter"
        class="search-input"
        type="text"
        placeholder="Rechercher un titre…"
        autocomplete="off"
        spellcheck="false"
      />
      <button v-if="titleFilter" class="search-clear" @click="titleFilter = ''">✕</button>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <button :class="['filter-btn', typeFilter === '' && 'active']" @click="typeFilter = ''">Tout</button>
        <button :class="['filter-btn', typeFilter === 'anime' && 'active']" @click="typeFilter = 'anime'">🎌 Animés</button>
        <button :class="['filter-btn', typeFilter === 'movie' && 'active']" @click="typeFilter = 'movie'">🎬 Films</button>
        <button :class="['filter-btn', typeFilter === 'series' && 'active']" @click="typeFilter = 'series'">📺 Séries</button>
        <button :class="['filter-btn', typeFilter === 'game' && 'active']" @click="typeFilter = 'game'">🎮 Jeux</button>
      </div>
      <div class="filter-group">
        <button :class="['filter-btn', statusFilter === '' && 'active']" @click="statusFilter = ''">Tous</button>
        <button :class="['filter-btn', statusFilter === 'completed' && 'active']" @click="statusFilter = 'completed'">Terminés</button>
        <button :class="['filter-btn', statusFilter === 'ongoing' && 'active']" @click="statusFilter = 'ongoing'">En cours</button>
        <button :class="['filter-btn', statusFilter === 'planned' && 'active']" @click="statusFilter = 'planned'">Prévus</button>
        <button :class="['filter-btn', statusFilter === 'dropped' && 'active']" @click="statusFilter = 'dropped'">Abandonnés</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Chargement...</span>
    </div>

    <!-- Grid -->
    <div v-else-if="filtered.length" class="media-grid">
      <NuxtLink
        v-for="entry in displayed"
        :key="entry.id"
        :to="`/passions/medialist/${entry.media_type}-${entry.external_id}`"
        class="media-card"
      >
        <div class="card-cover">
          <img v-if="entry.cover_url" :src="entry.cover_url" :alt="entry.title" loading="lazy" />
          <div v-else class="cover-placeholder">{{ { anime: '🎌', game: '🎮', movie: '🎬', series: '📺' }[entry.media_type] }}</div>
          <span class="type-badge" :class="entry.media_type">
            {{ { anime: 'Animé', game: 'Jeu', movie: 'Film', series: 'Série' }[entry.media_type] }}
          </span>
        </div>
        <div class="card-body">
          <h3 class="card-title">{{ entry.title }}</h3>
          <p v-if="entry.title_original" class="card-original">{{ entry.title_original }}</p>
          <div class="card-meta">
            <span v-if="entry.creator" class="meta-item">{{ entry.creator }}</span>
            <span v-if="entry.year" class="meta-item">{{ entry.year }}</span>
          </div>
          <div v-if="entry.genres?.length" class="card-genres">
            <span v-for="g in entry.genres" :key="g" class="genre-tag">{{ g }}</span>
          </div>

          <!-- Episodes bar (anime / series) -->
          <div v-if="(entry.media_type === 'anime' || entry.media_type === 'series') && entry.episodes_total" class="progress-block">
            <div class="progress-label">
              <span>Épisodes</span>
              <span class="progress-value">{{ entry.episodes_watched ?? 0 }}/{{ entry.episodes_total }}</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{
                width: `${Math.min(100, ((entry.episodes_watched ?? 0) / entry.episodes_total) * 100)}%`,
                background: 'var(--gradient)'
              }"></div>
            </div>
          </div>

          <!-- Score bar -->
          <div v-if="entry.score" class="progress-block">
            <div class="progress-label">
              <span>Note</span>
              <span class="progress-value" :style="{ color: scoreColor(entry.score) }">{{ entry.score }}/10</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" :style="{
                width: `${entry.score * 10}%`,
                background: scoreColor(entry.score)
              }"></div>
            </div>
          </div>

          <div class="card-footer">
            <span class="status-badge" :class="STATUS_COLOR[entry.status] ?? 'gray'">
              {{ STATUS_LABEL[entry.status] ?? entry.status }}
            </span>
            <span v-if="entry.media_type === 'game' && entry.platform" class="extra-info">
              {{ entry.platform }}
            </span>
            <button v-if="isOwner" class="edit-btn" @click.prevent.stop="openEdit(entry)" title="Modifier">✏️</button>
            <button v-if="isOwner" class="edit-btn delete-btn" @click.prevent.stop="deleteEntry(entry)" title="Supprimer">🗑️</button>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Load more -->
    <div v-if="hasMore" class="load-more">
      <button class="load-more-btn" @click="displayedCount += PAGE_SIZE">
        Voir plus <span class="load-more-count">({{ filtered.length - displayedCount }} restants)</span>
      </button>
    </div>

    <!-- Empty -->
    <div v-else class="empty-state">
      <template v-if="titleFilter.trim()">
        <p class="empty-title">Pas dans la liste</p>
        <p class="empty-sub">« {{ titleFilter.trim() }} » n'a pas encore été ajouté.</p>
      </template>
      <p v-else>Aucune entrée pour ces filtres.</p>
    </div>

    <!-- FAB : owner only -->
    <button v-if="isOwner" class="fab" @click="openModal" title="Ajouter">＋</button>

    <!-- Login hint for non-authenticated owner -->
    <div v-if="!isAuthenticated" ref="googleBtnRef" class="google-btn-hidden"></div>

    <!-- ── Edit modal ── -->
    <Transition name="modal">
      <div v-if="editEntry" class="modal-overlay" @click.self="closeEdit">
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title">Modifier l'entrée</h2>
            <button class="modal-close" @click="closeEdit">✕</button>
          </div>

          <!-- Entry recap -->
          <div class="confirm-result">
            <img v-if="editEntry.cover_url" :src="editEntry.cover_url" :alt="editEntry.title" class="confirm-cover" />
            <div class="cover-placeholder-sm" v-else>{{ { anime: '🎌', game: '🎮', movie: '🎬', series: '📺' }[editEntry.media_type] }}</div>
            <div class="confirm-info">
              <p class="confirm-title">{{ editEntry.title }}</p>
              <p v-if="editEntry.title_original" class="confirm-meta">{{ editEntry.title_original }}</p>
              <p class="confirm-meta">{{ editEntry.year }}</p>
            </div>
          </div>

          <!-- Status -->
          <div class="field-row">
            <label class="field-label">Statut</label>
            <div class="status-options">
              <button
                v-for="s in statusOptionsFor(editEntry.media_type)"
                :key="s.value"
                :class="['status-option', editStatus === s.value && 'active']"
                @click="editStatus = s.value"
              >{{ s.label }}</button>
            </div>
          </div>

          <!-- Episodes watched (anime / series) -->
          <div v-if="editEntry.media_type === 'anime' || editEntry.media_type === 'series'" class="field-row">
            <label class="field-label">
              Épisodes vus
              <span v-if="editEntry.episodes_total" class="field-hint">/ {{ editEntry.episodes_total }}</span>
            </label>
            <input
              v-model.number="editEpisodesWatched"
              type="number"
              min="0"
              :max="editEntry.episodes_total ?? undefined"
              class="platform-input"
              placeholder="0"
            />
          </div>

          <!-- Platform (game only) -->
          <div v-if="editEntry.media_type === 'game'" class="field-row">
            <label class="field-label">Plateforme</label>
            <input v-model="editPlatform" class="platform-input" placeholder="PC, PS5, Switch..." />
          </div>

          <!-- Score -->
          <div class="field-row">
            <label class="field-label">Score <span class="field-hint">(1-10, optionnel)</span></label>
            <input
              v-model.number="editScore"
              type="number"
              min="1"
              max="10"
              class="platform-input"
              placeholder="—"
            />
          </div>

          <div v-if="editError" class="add-error">{{ editError }}</div>

          <div class="confirm-actions">
            <button class="btn-cancel" @click="closeEdit">Annuler</button>
            <button class="btn-confirm" :disabled="saving" @click="saveEdit">
              <span v-if="saving" class="btn-spinner"></span>
              {{ saving ? 'Sauvegarde...' : 'Sauvegarder' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- ── Search modal ── -->
    <Transition name="modal">
      <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
        <div class="modal">
          <div class="modal-header">
            <h2 class="modal-title">Ajouter à la liste</h2>
            <button class="modal-close" @click="closeModal">✕</button>
          </div>

          <!-- Type tabs -->
          <div class="modal-tabs">
            <button :class="['modal-tab', searchType === 'anime' && 'active']" @click="searchType = 'anime'">🎌 Animé</button>
            <button :class="['modal-tab', searchType === 'movie' && 'active']" @click="searchType = 'movie'">🎬 Film</button>
            <button :class="['modal-tab', searchType === 'series' && 'active']" @click="searchType = 'series'">📺 Série</button>
            <button :class="['modal-tab', searchType === 'game' && 'active']" @click="searchType = 'game'">🎮 Jeu</button>
          </div>

          <!-- Search input -->
          <div class="search-box">
            <input
              v-model="titleFilter"
              class="search-input"
              :placeholder="{ anime: 'Rechercher un animé...', game: 'Rechercher un jeu...', movie: 'Rechercher un film...', series: 'Rechercher une série...' }[searchType]"
              autofocus
            />
            <div v-if="searching" class="search-spinner"></div>
          </div>

          <!-- Success message -->
          <div v-if="addSuccess" class="add-success">✅ {{ addSuccess }}</div>

          <!-- Selected result → confirm panel -->
          <div v-if="selectedResult" class="confirm-panel">
            <div class="confirm-result">
              <img v-if="selectedResult.cover_url" :src="selectedResult.cover_url" :alt="selectedResult.title" class="confirm-cover" />
              <div class="cover-placeholder-sm" v-else>{{ { anime: '🎌', game: '🎮', movie: '🎬', series: '📺' }[searchType] }}</div>
              <div class="confirm-info">
                <p class="confirm-title">{{ selectedResult.title }}</p>
                <p v-if="selectedResult.year" class="confirm-meta">{{ selectedResult.year }}</p>
              </div>
            </div>

            <!-- Status selector -->
            <div class="field-row">
              <label class="field-label">Statut</label>
              <div class="status-options">
                <button
                  v-for="s in statusOptionsFor(searchType)"
                  :key="s.value"
                  :class="['status-option', addStatus === s.value && 'active']"
                  @click="addStatus = s.value"
                >{{ s.label }}</button>
              </div>
            </div>

            <!-- Platform (games only) -->
            <div v-if="searchType === 'game'" class="field-row" style="display: flex; flex-direction: column; gap: 0.5rem;">
              <label class="field-label">Plateforme</label>
              <input v-model="addPlatform" class="platform-input" placeholder="PC, PS5, Switch..." />
            </div>

            <div v-if="addError" class="add-error">{{ addError }}</div>

            <div class="confirm-actions">
              <button class="btn-cancel" @click="selectedResult = null">← Retour</button>
              <button class="btn-confirm" :disabled="adding" @click="confirmAdd">
                <span v-if="adding" class="btn-spinner"></span>
                {{ adding ? 'Ajout...' : 'Confirmer' }}
              </button>
            </div>
          </div>

          <!-- Search results -->
          <div v-else-if="searchResults.length" class="search-results">
            <div
              v-for="r in searchResults"
              :key="r.id"
              class="result-item"
              @click="selectResult(r)"
            >
              <img v-if="r.cover_url" :src="r.cover_url" :alt="r.title" class="result-cover" />
              <div v-else class="result-cover-placeholder">{{ { anime: '🎌', game: '🎮', movie: '🎬', series: '📺' }[searchType] }}</div>
              <div class="result-info">
                <p class="result-title">{{ r.title }}</p>
                <p v-if="r.title_original" class="result-original">{{ r.title_original }}</p>
                <p class="result-meta">
                  <span v-if="r.year">{{ r.year }}</span>
                  <span v-if="r.creator"> · {{ r.creator }}</span>
                  <span v-if="r.episodes"> · {{ r.episodes }} ep</span>
                </p>
              </div>
            </div>
          </div>

          <div v-else-if="searchQuery.length >= 2 && !searching" class="no-results">
            Aucun résultat pour "{{ searchQuery }}"
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-dim);
  font-size: 0.9rem;
  margin-bottom: 2rem;
  transition: color 0.2s;
}
.back-link:hover { color: var(--accent); }

.page-subtitle {
  color: var(--text-muted);
  font-size: 1.05rem;
  margin-top: 0.5rem;
  margin-bottom: 2.5rem;
  max-width: 560px;
}

/* ── Profile section ── */
.profile-section {
  margin-bottom: 2.5rem;
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
}

.stats-toggle {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  background: none;
  border: none;
  cursor: pointer;
  font-family: inherit;
  color: var(--text);
  transition: background 0.15s;
}
.stats-toggle:hover { background: rgba(255,255,255,0.03); }

.stats-toggle-label {
  font-size: 0.92rem;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.stats-toggle-chevron {
  font-size: 1.2rem;
  color: var(--text-dim);
  transition: transform 0.35s cubic-bezier(0.23, 1, 0.32, 1);
  transform: rotate(0deg);
  line-height: 1;
}
.stats-toggle-chevron.open { transform: rotate(90deg); }

.stats-body {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.23, 1, 0.32, 1),
              padding 0.3s ease;
  padding: 0 1.25rem;
}
.stats-body.open {
  max-height: 3000px;
  padding: 0 1.25rem 1.25rem;
}

.stats-strip {
  display: flex;
  gap: 0.875rem;
  flex-wrap: wrap;
}

.stat-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  flex: 1;
  min-width: 90px;
  box-shadow: var(--shadow-sm);
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.stat-item .stat-value[style] {
  background: none;
  -webkit-background-clip: unset;
  -webkit-text-fill-color: unset;
  background-clip: unset;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  text-align: center;
}

/* Profile blocks */
.profile-block {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow-sm);
}

.profile-block-title {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  margin-bottom: 1rem;
}

/* Genre DNA */
.genre-dna {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.genre-row {
  display: grid;
  grid-template-columns: 180px 1fr 80px;
  align-items: center;
  gap: 0.75rem;
}

.genre-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  min-width: 0;
}

.genre-name {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.genre-icons { font-size: 0.75rem; flex-shrink: 0; opacity: 0.8; }

.genre-bar-track {
  height: 8px;
  background: var(--border);
  border-radius: 4px;
  overflow: hidden;
}

.genre-bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.6s ease;
}

.genre-score-info {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  justify-content: flex-end;
}

.genre-avg {
  font-size: 0.85rem;
  font-weight: 700;
}

.genre-count {
  font-size: 0.75rem;
  color: var(--text-dim);
}

/* Profile row — two halves */
.profile-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.profile-block-half { /* inherits .profile-block */ }

/* Score tabs / creator tabs */
.score-tabs {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 1rem;
}

.score-tab {
  padding: 0.3rem 0.75rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.8rem;
  font-family: inherit;
  cursor: pointer;
  transition: var(--transition);
}
.score-tab:hover { border-color: var(--accent); color: var(--accent); }
.score-tab.active { background: var(--gradient); border-color: transparent; color: #fff; }

/* Score distribution */
.score-dist {
  display: grid;
  grid-template-columns: 1.5rem 1fr 1.5rem;
  align-items: center;
  gap: 0.35rem 0.6rem;
}

.score-label {
  font-size: 0.8rem;
  font-weight: 700;
  text-align: right;
}

.score-bar-track {
  height: 6px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.score-bar-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease;
}

.score-count {
  font-size: 0.75rem;
  color: var(--text-dim);
}

/* Creator list */
.creator-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.creator-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0;
  border-bottom: 1px solid var(--border);
}
.creator-row:last-child { border-bottom: none; }

.creator-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}

.creator-meta {
  display: flex;
  gap: 0.6rem;
  align-items: center;
  flex-shrink: 0;
}

.creator-score { font-size: 0.82rem; font-weight: 700; }
.creator-count { font-size: 0.75rem; color: var(--text-dim); }

/* ── Search ── */
.search-bar {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 0.55rem 0.9rem;
  margin-bottom: 1.25rem;
  transition: border-color 0.2s;
  max-width: 480px;
}

.search-bar:focus-within {
  border-color: var(--accent);
}

.search-icon { font-size: 0.95rem; flex-shrink: 0; }

.search-input {
  flex: 1;
  background: none;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 0.9rem;
  font-family: inherit;
}

.search-input::placeholder { color: var(--text-dim); }

.search-clear {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0;
  line-height: 1;
  transition: color 0.15s;
  flex-shrink: 0;
}
.search-clear:hover { color: var(--text); }

.empty-title { font-size: 1rem; font-weight: 600; color: var(--text); margin-bottom: 0.4rem; }
.empty-sub { font-size: 0.88rem; color: var(--text-dim); }

/* ── Filters ── */
.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-btn {
  padding: 0.45rem 1rem;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  transition: var(--transition);
  font-weight: 500;
}

.filter-btn:hover { border-color: var(--accent); color: var(--accent); }
.filter-btn.active {
  background: var(--gradient);
  border-color: transparent;
  color: #fff;
  box-shadow: var(--shadow-accent);
}

/* ── Loading ── */
.loading-state {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 3rem 0;
  color: var(--text-dim);
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* ── Media grid ── */
.media-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.5rem;
}

.media-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: var(--transition);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
}

.media-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--accent);
}

.card-cover {
  position: relative;
  height: 280px;
  overflow: hidden;
  background: var(--bg-card-hover);
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.media-card:hover .card-cover img { transform: scale(1.05); }

.cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  background: var(--bg-card-hover);
}

.type-badge {
  position: absolute;
  top: 0.6rem;
  left: 0.6rem;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.type-badge.anime  { background: rgba(139, 46, 59, 0.85);  color: #fff; backdrop-filter: blur(4px); }
.type-badge.game   { background: rgba(30, 80, 160, 0.85);  color: #fff; backdrop-filter: blur(4px); }
.type-badge.movie  { background: rgba(185, 28, 28, 0.85);  color: #fff; backdrop-filter: blur(4px); }
.type-badge.series { background: rgba(109, 40, 217, 0.85); color: #fff; backdrop-filter: blur(4px); }

.card-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}

.card-title { font-size: 0.95rem; font-weight: 700; color: var(--text); line-height: 1.3; }
.card-original { font-size: 0.78rem; color: var(--text-dim); line-height: 1.2; }
.card-meta { display: flex; gap: 0.4rem; flex-wrap: wrap; align-items: center; margin-top: 0.1rem; }
.meta-item { font-size: 0.78rem; color: var(--text-muted); }
.meta-item + .meta-item::before { content: '·'; margin-right: 0.4rem; color: var(--text-dim); }

.card-genres { display: flex; gap: 0.3rem; flex-wrap: wrap; margin-top: 0.2rem; }
.genre-tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  background: rgba(196, 150, 60, 0.12);
  color: var(--accent-light);
  border-radius: 4px;
  font-weight: 500;
}

.card-footer {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: auto;
  padding-top: 0.6rem;
}

.status-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-badge.green  { background: rgba(34, 197, 94, 0.15);  color: #16a34a; }
.status-badge.blue   { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
.status-badge.orange { background: rgba(249, 115, 22, 0.15); color: #ea580c; }
.status-badge.gray   { background: rgba(107, 114, 128, 0.15); color: #6b7280; }

.extra-info { font-size: 0.75rem; color: var(--text-dim); }

/* ── Progress bars ── */
.progress-block {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-top: 0.25rem;
}

.progress-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.72rem;
  color: var(--text-dim);
  font-weight: 500;
}

.progress-value {
  font-weight: 700;
  font-size: 0.75rem;
}

.progress-track {
  height: 5px;
  background: var(--border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

.edit-btn {
  margin-left: auto;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 0.85rem;
  opacity: 0.4;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  transition: opacity 0.15s;
  line-height: 1;
}
.edit-btn + .edit-btn { margin-left: 0.1rem; }
.media-card:hover .edit-btn { opacity: 1; }
.delete-btn:hover { background: rgba(239, 68, 68, 0.15); }

.field-hint { font-weight: 400; color: var(--text-dim); margin-left: 0.3rem; }

.empty-state { padding: 4rem 0; text-align: center; color: var(--text-dim); font-size: 1rem; }

.load-more { display: flex; justify-content: center; padding: 2rem 0 1rem; }
.load-more-btn {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  color: var(--text-muted);
  cursor: pointer;
  font-family: inherit;
  font-size: 0.88rem;
  padding: 0.6rem 1.5rem;
  transition: border-color 0.2s, color 0.2s;
}
.load-more-btn:hover { border-color: var(--accent); color: var(--text); }
.load-more-count { color: var(--text-dim); }

/* ── FAB ── */
.fab {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--gradient);
  color: #fff;
  font-size: 1.6rem;
  line-height: 1;
  border: none;
  cursor: pointer;
  box-shadow: var(--shadow-accent);
  transition: var(--transition);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.fab:hover { transform: scale(1.1); box-shadow: 0 8px 24px rgba(196,150,60,0.5); }

.google-btn-hidden { display: none; }

/* ── Modal ── */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  z-index: 200;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.modal {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  width: 100%;
  max-width: 560px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: var(--shadow-lg);
  padding: 1.75rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
}

.modal-close {
  background: none;
  border: none;
  color: var(--text-dim);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  transition: var(--transition);
}
.modal-close:hover { color: var(--text); background: var(--bg-card-hover); }

/* Modal tabs */
.modal-tabs {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 1rem;
}

.modal-tab {
  padding: 0.5rem 1.25rem;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-family: inherit;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}
.modal-tab:hover { border-color: var(--accent); color: var(--accent); }
.modal-tab.active { background: var(--gradient); border-color: transparent; color: #fff; }

/* Search */
.search-box {
  position: relative;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem;
  padding-right: 2.5rem;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text);
  font-size: 0.95rem;
  font-family: inherit;
  transition: border-color 0.2s;
  outline: none;
}
.search-input:focus { border-color: var(--accent); }
.search-input::placeholder { color: var(--text-dim); }

.search-spinner {
  position: absolute;
  right: 0.85rem;
  top: 50%;
  transform: translateY(-50%);
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

/* Results */
.search-results {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 360px;
  overflow-y: auto;
}

.result-item {
  display: flex;
  gap: 0.875rem;
  align-items: center;
  padding: 0.6rem 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.15s;
}
.result-item:hover { background: var(--bg-card-hover); }

.result-cover {
  width: 52px;
  height: 68px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
  background: var(--bg-card-hover);
}

.result-cover-placeholder {
  width: 52px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: var(--bg-card-hover);
  border-radius: 6px;
  flex-shrink: 0;
}

.result-info { display: flex; flex-direction: column; gap: 0.2rem; min-width: 0; }
.result-title { font-size: 0.9rem; font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.result-original { font-size: 0.75rem; color: var(--text-dim); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.result-meta { font-size: 0.75rem; color: var(--text-muted); }

.no-results { text-align: center; color: var(--text-dim); font-size: 0.9rem; padding: 1rem 0; }

/* Confirm panel */
.confirm-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.confirm-result {
  display: flex;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem;
  background: var(--bg);
  border-radius: 10px;
  border: 1px solid var(--border);
}

.confirm-cover {
  width: 52px;
  height: 68px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.cover-placeholder-sm {
  width: 52px;
  height: 68px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  background: var(--bg-card-hover);
  border-radius: 6px;
  flex-shrink: 0;
}

.confirm-info { display: flex; flex-direction: column; gap: 0.2rem; }
.confirm-title { font-size: 0.95rem; font-weight: 700; color: var(--text); }
.confirm-meta { font-size: 0.8rem; color: var(--text-dim); }

.field-row { display: flex; flex-direction: column; gap: 0.5rem; }
.field-label { font-size: 0.8rem; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.status-options { display: flex; gap: 0.5rem; flex-wrap: wrap; }
.status-option {
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.85rem;
  font-family: inherit;
  cursor: pointer;
  transition: var(--transition);
}
.status-option:hover { border-color: var(--accent); color: var(--accent); }
.status-option.active { background: var(--gradient); border-color: transparent; color: #fff; }

.platform-input {
  padding: 0.6rem 0.875rem;
  border: 1.5px solid var(--border);
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.platform-input:focus { border-color: var(--accent); }
.platform-input::placeholder { color: var(--text-dim); }

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  margin-top: 0.25rem;
}

.btn-cancel {
  padding: 0.6rem 1.25rem;
  border-radius: 8px;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  font-size: 0.9rem;
  font-family: inherit;
  cursor: pointer;
  transition: var(--transition);
}
.btn-cancel:hover { border-color: var(--accent); color: var(--accent); }

.btn-confirm {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1.5rem;
  border-radius: 8px;
  border: none;
  background: var(--gradient);
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
  box-shadow: var(--shadow-accent);
  transition: var(--transition);
}
.btn-confirm:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-confirm:not(:disabled):hover { transform: translateY(-1px); }

.btn-spinner {
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.add-success {
  padding: 0.75rem 1rem;
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  color: #16a34a;
  font-size: 0.9rem;
  font-weight: 500;
}

.add-error {
  padding: 0.75rem 1rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  color: #dc2626;
  font-size: 0.9rem;
}

/* Modal transition */
.modal-enter-active, .modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from .modal, .modal-leave-to .modal { transform: translateY(16px) scale(0.97); }

/* Responsive */
@media (max-width: 768px) {
  .stats-strip { gap: 0.5rem; }
  .stat-item { padding: 0.875rem 1rem; min-width: 80px; }
  .stat-value { font-size: 1.4rem; }
  .genre-row { grid-template-columns: 130px 1fr 64px; gap: 0.5rem; }
  .profile-row { grid-template-columns: 1fr; }
  .media-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.875rem; }
  .card-cover { height: 200px; }
  .filters { gap: 0.75rem; }
  .fab { bottom: 1.25rem; right: 1.25rem; }
  .modal { padding: 1.25rem; }
}
</style>
