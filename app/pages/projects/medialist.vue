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

const API_BASE = 'https://chetaku-rs-mef67kip3a-ew.a.run.app'

const typeFilter = ref<'' | 'anime' | 'game'>('')
const statusFilter = ref<'' | 'completed' | 'ongoing' | 'planned'>('')

const { data: allMedia, pending } = useFetch<MediaEntry[]>(`${API_BASE}/media`)
const { data: stats } = useFetch<Stats>(`${API_BASE}/stats`)

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
        <!-- Cover -->
        <div class="card-cover">
          <img
            v-if="entry.cover_url"
            :src="entry.cover_url"
            :alt="entry.title"
            loading="lazy"
          />
          <div v-else class="cover-placeholder">
            {{ entry.media_type === 'anime' ? '🎌' : '🎮' }}
          </div>
          <span class="type-badge" :class="entry.media_type">
            {{ entry.media_type === 'anime' ? 'Animé' : 'Jeu' }}
          </span>
        </div>

        <!-- Body -->
        <div class="card-body">
          <h3 class="card-title">{{ entry.title }}</h3>
          <p v-if="entry.title_original" class="card-original">{{ entry.title_original }}</p>

          <div class="card-meta">
            <span v-if="entry.creator" class="meta-item">{{ entry.creator }}</span>
            <span v-if="entry.year" class="meta-item meta-year">{{ entry.year }}</span>
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
          </div>
        </div>
      </div>
    </div>

    <!-- Empty -->
    <div v-else class="empty-state">
      <p>Aucune entrée pour ces filtres.</p>
    </div>
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

.filter-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

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

/* Cover */
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

.media-card:hover .card-cover img {
  transform: scale(1.05);
}

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

.type-badge.anime {
  background: rgba(139, 46, 59, 0.85);
  color: #fff;
  backdrop-filter: blur(4px);
}

.type-badge.game {
  background: rgba(30, 80, 160, 0.85);
  color: #fff;
  backdrop-filter: blur(4px);
}

/* Body */
.card-body {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  flex: 1;
}

.card-title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.3;
}

.card-original {
  font-size: 0.78rem;
  color: var(--text-dim);
  line-height: 1.2;
}

.card-meta {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  align-items: center;
  margin-top: 0.1rem;
}

.meta-item {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.meta-item + .meta-item::before {
  content: '·';
  margin-right: 0.4rem;
  color: var(--text-dim);
}

.card-genres {
  display: flex;
  gap: 0.3rem;
  flex-wrap: wrap;
  margin-top: 0.2rem;
}

.genre-tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.5rem;
  background: rgba(196, 150, 60, 0.12);
  color: var(--accent-light);
  border-radius: 4px;
  font-weight: 500;
}

/* Footer */
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

.status-badge.green  { background: rgba(34, 197, 94, 0.15); color: #16a34a; }
.status-badge.blue   { background: rgba(59, 130, 246, 0.15); color: #2563eb; }
.status-badge.orange { background: rgba(249, 115, 22, 0.15); color: #ea580c; }
.status-badge.gray   { background: rgba(107, 114, 128, 0.15); color: #6b7280; }

.extra-info {
  font-size: 0.75rem;
  color: var(--text-dim);
}

/* Empty */
.empty-state {
  padding: 4rem 0;
  text-align: center;
  color: var(--text-dim);
  font-size: 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .stats-strip { gap: 0.75rem; }
  .stat-item { padding: 1rem 1.25rem; }
  .media-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 0.875rem; }
  .card-cover { height: 200px; }
  .filters { gap: 0.75rem; }
}
</style>
