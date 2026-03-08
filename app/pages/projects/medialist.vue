<script setup lang="ts">
interface MediaEntry {
  id: number
  media_type: 'anime' | 'game'
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

interface Stats {
  total_anime: number
  total_games: number
  anime_completed: number
  games_completed: number
  anime_watching: number
  games_playing: number
  top_genres: Array<{ genre: string; count: number }>
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

const API_BASE = 'https://chetaku-rs-mef67kip3a-ew.a.run.app'
const config = useRuntimeConfig()

// ── List & filters ──────────────────────────────────────────────────────────
const typeFilter = ref<'' | 'anime' | 'game'>('')
const statusFilter = ref<'' | 'completed' | 'ongoing' | 'planned'>('')

const { data: allMedia, pending, refresh: refreshList } = useFetch<MediaEntry[]>(`${API_BASE}/media`)
const { data: stats, refresh: refreshStats } = useFetch<Stats>(`${API_BASE}/stats`)

const filtered = computed(() => {
  if (!allMedia.value) return []
  return allMedia.value.filter(m => {
    if (typeFilter.value && m.media_type !== typeFilter.value) return false
    if (statusFilter.value === 'ongoing') return m.status === 'watching' || m.status === 'playing'
    if (statusFilter.value && m.status !== statusFilter.value) return false
    return true
  })
})

const STATUS_LABEL: Record<string, string> = {
  completed: 'Terminé',
  watching: 'En cours',
  playing: 'En cours',
  planned: 'Prévu',
  dropped: 'Abandonné',
}

const STATUS_COLOR: Record<string, string> = {
  completed: 'green',
  watching: 'blue',
  playing: 'blue',
  planned: 'gray',
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

async function saveEdit() {
  if (!editEntry.value) return
  saving.value = true
  editError.value = ''
  try {
    const body: Record<string, unknown> = { status: editStatus.value }
    if (editEntry.value.media_type === 'game') body.platform = editPlatform.value || null
    if (editEntry.value.media_type === 'anime') body.episodes_watched = editEpisodesWatched.value
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
const searchType = ref<'anime' | 'game'>('anime')
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
    <NuxtLink to="/projects" class="back-link">← Projets</NuxtLink>

    <div class="section-label">Médiathèque</div>
    <h1 class="section-title">Animés & Jeux</h1>
    <p class="page-subtitle">Ma liste personnelle — ce que j'ai regardé, joué, ou prévu.</p>

    <!-- Stats -->
    <div v-if="stats" class="stats-strip">
      <div class="stat-item">
        <span class="stat-value">{{ stats.total_anime }}</span>
        <span class="stat-label">Animés</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.total_games }}</span>
        <span class="stat-label">Jeux</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.anime_completed + stats.games_completed }}</span>
        <span class="stat-label">Terminés</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.anime_watching + stats.games_playing }}</span>
        <span class="stat-label">En cours</span>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <button :class="['filter-btn', typeFilter === '' && 'active']" @click="typeFilter = ''">Tout</button>
        <button :class="['filter-btn', typeFilter === 'anime' && 'active']" @click="typeFilter = 'anime'">🎌 Animés</button>
        <button :class="['filter-btn', typeFilter === 'game' && 'active']" @click="typeFilter = 'game'">🎮 Jeux</button>
      </div>
      <div class="filter-group">
        <button :class="['filter-btn', statusFilter === '' && 'active']" @click="statusFilter = ''">Tous</button>
        <button :class="['filter-btn', statusFilter === 'completed' && 'active']" @click="statusFilter = 'completed'">Terminés</button>
        <button :class="['filter-btn', statusFilter === 'ongoing' && 'active']" @click="statusFilter = 'ongoing'">En cours</button>
        <button :class="['filter-btn', statusFilter === 'planned' && 'active']" @click="statusFilter = 'planned'">Prévus</button>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="pending" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Chargement...</span>
    </div>

    <!-- Grid -->
    <div v-else-if="filtered.length" class="media-grid">
      <div v-for="entry in filtered" :key="entry.id" class="media-card">
        <div class="card-cover">
          <img v-if="entry.cover_url" :src="entry.cover_url" :alt="entry.title" loading="lazy" />
          <div v-else class="cover-placeholder">{{ entry.media_type === 'anime' ? '🎌' : '🎮' }}</div>
          <span class="type-badge" :class="entry.media_type">
            {{ entry.media_type === 'anime' ? 'Animé' : 'Jeu' }}
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
          <div class="card-footer">
            <span class="status-badge" :class="STATUS_COLOR[entry.status] ?? 'gray'">
              {{ STATUS_LABEL[entry.status] ?? entry.status }}
            </span>
            <span v-if="entry.media_type === 'anime' && entry.episodes_total" class="extra-info">
              {{ entry.episodes_watched ?? 0 }}/{{ entry.episodes_total }} ep
            </span>
            <span v-if="entry.media_type === 'game' && entry.platform" class="extra-info">
              {{ entry.platform }}
            </span>
            <button v-if="isOwner" class="edit-btn" @click.stop="openEdit(entry)" title="Modifier">✏️</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="empty-state">
      <p>Aucune entrée pour ces filtres.</p>
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
            <div class="cover-placeholder-sm" v-else>{{ editEntry.media_type === 'anime' ? '🎌' : '🎮' }}</div>
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
                v-for="s in (editEntry.media_type === 'anime' ? ANIME_STATUSES : GAME_STATUSES)"
                :key="s.value"
                :class="['status-option', editStatus === s.value && 'active']"
                @click="editStatus = s.value"
              >{{ s.label }}</button>
            </div>
          </div>

          <!-- Episodes watched (anime only) -->
          <div v-if="editEntry.media_type === 'anime'" class="field-row">
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
            <button :class="['modal-tab', searchType === 'game' && 'active']" @click="searchType = 'game'">🎮 Jeu</button>
          </div>

          <!-- Search input -->
          <div class="search-box">
            <input
              v-model="searchQuery"
              class="search-input"
              :placeholder="searchType === 'anime' ? 'Rechercher un animé...' : 'Rechercher un jeu...'"
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
              <div class="cover-placeholder-sm" v-else>{{ searchType === 'anime' ? '🎌' : '🎮' }}</div>
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
                  v-for="s in (searchType === 'anime' ? ANIME_STATUSES : GAME_STATUSES)"
                  :key="s.value"
                  :class="['status-option', addStatus === s.value && 'active']"
                  @click="addStatus = s.value"
                >{{ s.label }}</button>
              </div>
            </div>

            <!-- Platform (games only) -->
            <div v-if="searchType === 'game'" class="field-row">
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
              <div v-else class="result-cover-placeholder">{{ searchType === 'anime' ? '🎌' : '🎮' }}</div>
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

/* ── Stats strip ── */
.stats-strip {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
}

.stat-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.25rem 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  flex: 1;
  min-width: 100px;
  box-shadow: var(--shadow-sm);
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

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
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.25rem;
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
}

.media-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
  border-color: var(--accent);
}

.card-cover {
  position: relative;
  height: 240px;
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

.type-badge.anime { background: rgba(139, 46, 59, 0.85); color: #fff; backdrop-filter: blur(4px); }
.type-badge.game  { background: rgba(30, 80, 160, 0.85);  color: #fff; backdrop-filter: blur(4px); }

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
.media-card:hover .edit-btn { opacity: 1; }

.field-hint { font-weight: 400; color: var(--text-dim); margin-left: 0.3rem; }

.empty-state { padding: 4rem 0; text-align: center; color: var(--text-dim); font-size: 1rem; }

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
  .stats-strip { gap: 0.75rem; }
  .stat-item { padding: 1rem 1.25rem; }
  .media-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.875rem; }
  .card-cover { height: 200px; }
  .filters { gap: 0.75rem; }
  .fab { bottom: 1.25rem; right: 1.25rem; }
  .modal { padding: 1.25rem; }
}
</style>
