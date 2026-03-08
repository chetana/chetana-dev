<script setup lang="ts">
interface AnimeArc {
  name: string
  start: number
  end: number | null
  filler?: boolean
}

interface Episode {
  number: number
  title: string | null
  filler: boolean
  recap: boolean
}

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

interface AnimeDetail {
  entry: MediaEntry
  type: 'anime'
  synopsis: string | null
  trailer_youtube_id: string | null
  mal_score: number | null
  rank: number | null
  members: number | null
  studios: string[]
  episodes_list: Episode[]
  episodes_has_more: boolean
  arcs: AnimeArc[] | null
}

interface GameDetail {
  entry: MediaEntry
  type: 'game'
  description: string | null
  metacritic: number | null
  website: string | null
  developers: string[]
  publishers: string[]
  screenshots: string[]
}

type Detail = AnimeDetail | GameDetail

const route = useRoute()
const slug = route.params.slug as string

// slug = "anime-21" or "game-3498"
const dashIdx = slug.indexOf('-')
const type = slug.slice(0, dashIdx)
const externalId = slug.slice(dashIdx + 1)

const { data: detail, pending, error } = useFetch<Detail>('/api/medialist/detail', {
  query: { type, externalId },
})

// ── Computed helpers ──────────────────────────────────────────────────────────
const entry = computed(() => detail.value?.entry ?? null)

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

function scoreColor(score: number): string {
  if (score >= 9) return '#22c55e'
  if (score >= 7) return '#10b981'
  if (score >= 5) return '#f59e0b'
  if (score >= 3) return '#f97316'
  return '#ef4444'
}

// Current arc based on episodes_watched
const currentArc = computed(() => {
  if (detail.value?.type !== 'anime') return null
  const d = detail.value as AnimeDetail
  if (!d.arcs || !entry.value?.episodes_watched) return null
  return d.arcs.find(a => {
    const end = a.end ?? 99999
    return entry.value!.episodes_watched! >= a.start && entry.value!.episodes_watched! <= end
  }) ?? null
})

// Synopsis truncation
const synopsisExpanded = ref(false)
const synopsisText = computed(() => {
  if (detail.value?.type !== 'anime') return null
  return (detail.value as AnimeDetail).synopsis
})
const synopsisShort = computed(() => {
  const s = synopsisText.value
  if (!s || s.length <= 350) return s
  return s.slice(0, 350) + '…'
})

const descriptionText = computed(() => {
  if (detail.value?.type !== 'game') return null
  return (detail.value as GameDetail).description
})
const descriptionExpanded = ref(false)
const descriptionShort = computed(() => {
  const s = descriptionText.value
  if (!s || s.length <= 400) return s
  return s.slice(0, 400) + '…'
})

// Arc expand state
const expandedArc = ref<number | null>(null)
function toggleArc(idx: number) {
  expandedArc.value = expandedArc.value === idx ? null : idx
}

// Episodes inside an arc
function episodesForArc(arc: AnimeArc): Episode[] {
  if (detail.value?.type !== 'anime') return []
  const eps = (detail.value as AnimeDetail).episodes_list
  const end = arc.end ?? 99999
  return eps.filter(ep => ep.number >= arc.start && ep.number <= end)
}

// Lightbox for screenshots
const lightboxImg = ref<string | null>(null)

// SEO
const title = computed(() => entry.value ? `${entry.value.title} · Médiathèque` : 'Médiathèque')
useSeoMeta({ title })

// ── Chat IA ──────────────────────────────────────────────────────────────────
interface ChatMessageUI {
  role: 'user' | 'model'
  content: string
  sources?: Array<{ title: string; url: string }>
}

const chatMessages = ref<ChatMessageUI[]>([])
const chatInput = ref('')
const chatLoading = ref(false)
const chatScrollRef = ref<HTMLElement | null>(null)

const suggestedQuestions = computed(() => {
  if (!entry.value) return []
  return detail.value?.type === 'anime'
    ? ['Quels sont les meilleurs arcs ?', 'Qui sont les personnages principaux ?', 'Y a-t-il une suite ?', 'Que regarder ensuite ?']
    : ['Combien de temps pour finir ?', 'Est-ce que le jeu est difficile ?', 'Y a-t-il des DLC ?', 'Que jouer ensuite ?']
})

function buildMediaContext() {
  if (!detail.value || !entry.value) return null
  const e = entry.value
  const d = detail.value
  return {
    title: e.title,
    type: e.media_type,
    year: e.year,
    genres: e.genres,
    synopsis: d.type === 'anime' ? (d as any).synopsis : (d as any).description,
    status: e.status,
    score: e.score,
    episodes_watched: e.episodes_watched,
    episodes_total: e.episodes_total,
    mal_score: d.type === 'anime' ? (d as any).mal_score : null,
    metacritic: d.type === 'game' ? (d as any).metacritic : null,
    platform: e.platform,
    studios: d.type === 'anime' ? (d as any).studios : null,
    developers: d.type === 'game' ? (d as any).developers : null,
  }
}

async function askSuggestion(q: string) {
  chatInput.value = q
  await sendChatMessage()
}

async function sendChatMessage() {
  const text = chatInput.value.trim()
  if (!text || chatLoading.value) return
  chatInput.value = ''
  chatMessages.value.push({ role: 'user', content: text })
  chatLoading.value = true

  await nextTick()
  chatScrollRef.value?.scrollTo({ top: chatScrollRef.value.scrollHeight, behavior: 'smooth' })

  try {
    const result = await $fetch<{ reply: string; sources?: Array<{ title: string; url: string }> }>(
      '/api/medialist/chat',
      {
        method: 'POST',
        body: {
          messages: chatMessages.value.map(m => ({ role: m.role, content: m.content })),
          mediaContext: buildMediaContext(),
        },
      }
    )
    chatMessages.value.push({ role: 'model', content: result.reply, sources: result.sources })
  } catch {
    chatMessages.value.push({ role: 'model', content: '❌ Une erreur est survenue, réessaie dans un instant.' })
  } finally {
    chatLoading.value = false
    await nextTick()
    chatScrollRef.value?.scrollTo({ top: chatScrollRef.value.scrollHeight, behavior: 'smooth' })
  }
}
</script>

<template>
  <div class="section detail-page" style="padding-top: 8rem;">
    <NuxtLink to="/projects/medialist" class="back-link">← Médiathèque</NuxtLink>

    <!-- Loading -->
    <div v-if="pending" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Chargement...</span>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-state">
      <p>Entrée introuvable.</p>
      <NuxtLink to="/projects/medialist" class="btn-back">← Retour à la liste</NuxtLink>
    </div>

    <!-- Content -->
    <template v-else-if="detail && entry">
      <!-- ── Hero ── -->
      <div class="hero">
        <!-- Blurred background -->
        <div
          v-if="entry.cover_url"
          class="hero-bg"
          :style="{ backgroundImage: `url(${entry.cover_url})` }"
        ></div>

        <div class="hero-content">
          <!-- Cover -->
          <div class="hero-cover-wrap">
            <img
              v-if="entry.cover_url"
              :src="entry.cover_url"
              :alt="entry.title"
              class="hero-cover"
            />
            <div v-else class="hero-cover-placeholder">
              {{ entry.media_type === 'anime' ? '🎌' : '🎮' }}
            </div>
          </div>

          <!-- Info -->
          <div class="hero-info">
            <div class="hero-type-label" :class="entry.media_type">
              {{ entry.media_type === 'anime' ? '🎌 Animé' : '🎮 Jeu' }}
            </div>

            <h1 class="hero-title">{{ entry.title }}</h1>
            <p v-if="entry.title_original" class="hero-original">{{ entry.title_original }}</p>

            <!-- Meta chips -->
            <div class="meta-chips">
              <span v-if="entry.year" class="chip">{{ entry.year }}</span>
              <template v-if="detail.type === 'anime'">
                <span v-for="s in (detail as any).studios" :key="s" class="chip">{{ s }}</span>
              </template>
              <template v-else>
                <span v-for="d in (detail as any).developers" :key="d" class="chip">{{ d }}</span>
              </template>
              <span v-if="entry.platform" class="chip chip-platform">{{ entry.platform }}</span>
            </div>

            <!-- Genres -->
            <div v-if="entry.genres?.length" class="hero-genres">
              <span v-for="g in entry.genres" :key="g" class="genre-tag">{{ g }}</span>
            </div>

            <!-- Status + scores -->
            <div class="hero-tracking">
              <span class="status-badge" :class="STATUS_COLOR[entry.status] ?? 'gray'">
                {{ STATUS_LABEL[entry.status] ?? entry.status }}
              </span>

              <!-- External score -->
              <span
                v-if="detail.type === 'anime' && (detail as any).mal_score"
                class="ext-score"
                title="Score MyAnimeList"
              >
                ⭐ MAL {{ (detail as any).mal_score }}
              </span>
              <span
                v-if="detail.type === 'game' && (detail as any).metacritic"
                class="ext-score metacritic"
                title="Score Metacritic"
              >
                🎮 Metacritic {{ (detail as any).metacritic }}
              </span>
            </div>

            <!-- Our score progress bar -->
            <div v-if="entry.score" class="progress-block">
              <div class="progress-label">
                <span>Ma note</span>
                <span class="progress-value" :style="{ color: scoreColor(entry.score) }">{{ entry.score }}/10</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" :style="{ width: `${entry.score * 10}%`, background: scoreColor(entry.score) }"></div>
              </div>
            </div>

            <!-- Episodes progress bar (anime) -->
            <div v-if="entry.media_type === 'anime' && entry.episodes_total" class="progress-block">
              <div class="progress-label">
                <span>Épisodes vus</span>
                <span class="progress-value">{{ entry.episodes_watched ?? 0 }}/{{ entry.episodes_total }}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" :style="{
                  width: `${Math.min(100, ((entry.episodes_watched ?? 0) / entry.episodes_total) * 100)}%`,
                  background: 'var(--gradient)'
                }"></div>
              </div>
            </div>

            <!-- Current arc banner -->
            <div v-if="currentArc" class="current-arc-banner">
              <span class="current-arc-dot"></span>
              Arc actuel : <strong>{{ currentArc.name }}</strong>
              <span class="current-arc-range">(Ép. {{ currentArc.start }}–{{ currentArc.end ?? '?' }})</span>
            </div>

            <!-- Notes -->
            <p v-if="entry.notes" class="hero-notes">📝 {{ entry.notes }}</p>

            <!-- Website (game) -->
            <a
              v-if="detail.type === 'game' && (detail as any).website"
              :href="(detail as any).website"
              target="_blank"
              rel="noopener"
              class="website-link"
            >
              Site officiel ↗
            </a>
          </div>
        </div>
      </div>

      <!-- ── Synopsis / Description ── -->
      <section v-if="synopsisText || descriptionText" class="content-section">
        <h2 class="section-heading">{{ detail.type === 'anime' ? 'Synopsis' : 'Description' }}</h2>
        <div class="synopsis-block">
          <p class="synopsis-text">
            {{ synopsisExpanded
              ? (synopsisText || descriptionText)
              : (synopsisShort || descriptionShort) }}
          </p>
          <button
            v-if="(synopsisText ?? descriptionText ?? '').length > 350"
            class="read-more-btn"
            @click="synopsisExpanded = !synopsisExpanded"
          >
            {{ synopsisExpanded ? 'Voir moins ▲' : 'Voir plus ▼' }}
          </button>
        </div>
      </section>

      <!-- ── Trailer (anime) ── -->
      <section v-if="detail.type === 'anime' && (detail as any).trailer_youtube_id" class="content-section">
        <h2 class="section-heading">Trailer</h2>
        <div class="trailer-wrap">
          <iframe
            :src="`https://www.youtube-nocookie.com/embed/${(detail as any).trailer_youtube_id}`"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
      </section>

      <!-- ── Story Arcs (anime) ── -->
      <section v-if="detail.type === 'anime' && (detail as any).arcs" class="content-section">
        <h2 class="section-heading">Story Arcs</h2>
        <div class="arcs-list">
          <div
            v-for="(arc, idx) in (detail as any).arcs"
            :key="idx"
            class="arc-item"
            :class="{ filler: arc.filler, 'is-current': currentArc === arc }"
          >
            <button class="arc-header" @click="toggleArc(idx)">
              <div class="arc-header-left">
                <span class="arc-dot" :class="{ filler: arc.filler, current: currentArc === arc }"></span>
                <span class="arc-name">{{ arc.name }}</span>
                <span v-if="arc.filler" class="filler-badge">Filler</span>
                <span v-if="currentArc === arc" class="current-badge">← vous êtes ici</span>
              </div>
              <div class="arc-header-right">
                <span class="arc-range">Ép. {{ arc.start }}–{{ arc.end ?? '…' }}</span>
                <span v-if="episodesForArc(arc).length" class="arc-chevron">
                  {{ expandedArc === idx ? '▲' : '▼' }}
                </span>
              </div>
            </button>

            <!-- Episodes inside arc (only if data available) -->
            <Transition name="arc-expand">
              <div v-if="expandedArc === idx && episodesForArc(arc).length" class="arc-episodes">
                <div
                  v-for="ep in episodesForArc(arc)"
                  :key="ep.number"
                  class="arc-episode"
                  :class="{ filler: ep.filler, recap: ep.recap, watched: entry?.episodes_watched && ep.number <= entry.episodes_watched }"
                >
                  <span class="ep-num">{{ ep.number }}</span>
                  <span class="ep-title">{{ ep.title ?? '—' }}</span>
                  <span v-if="ep.filler" class="ep-tag">Filler</span>
                  <span v-if="ep.recap" class="ep-tag recap">Récap</span>
                </div>
              </div>
            </Transition>
          </div>
        </div>
      </section>

      <!-- ── Episode list (anime without arc data or short anime) ── -->
      <section
        v-else-if="detail.type === 'anime' && (detail as any).episodes_list?.length"
        class="content-section"
      >
        <h2 class="section-heading">
          Épisodes
          <span v-if="(detail as any).episodes_has_more" class="section-note">(100 premiers)</span>
        </h2>
        <div class="episodes-flat">
          <div
            v-for="ep in (detail as any).episodes_list"
            :key="ep.number"
            class="flat-episode"
            :class="{ watched: entry?.episodes_watched && ep.number <= entry.episodes_watched }"
          >
            <span class="ep-num">{{ ep.number }}</span>
            <span class="ep-title">{{ ep.title ?? '—' }}</span>
            <span v-if="ep.filler" class="ep-tag">Filler</span>
          </div>
        </div>
      </section>

      <!-- ── Screenshots (game) ── -->
      <section v-if="detail.type === 'game' && (detail as any).screenshots?.length" class="content-section">
        <h2 class="section-heading">Screenshots</h2>
        <div class="screenshots-grid">
          <img
            v-for="(src, i) in (detail as any).screenshots.slice(0, 10)"
            :key="i"
            :src="src"
            class="screenshot"
            loading="lazy"
            @click="lightboxImg = src"
          />
        </div>
      </section>

      <!-- ── Chat IA ── -->
      <section v-if="entry" class="content-section">
        <h2 class="section-heading">💬 Demande à l'IA</h2>

        <!-- Suggested questions (only before first message) -->
        <div v-if="!chatMessages.length" class="chat-suggestions">
          <button
            v-for="q in suggestedQuestions"
            :key="q"
            class="suggestion-chip"
            @click="askSuggestion(q)"
          >{{ q }}</button>
        </div>

        <!-- Messages -->
        <div v-if="chatMessages.length" ref="chatScrollRef" class="chat-messages">
          <div
            v-for="(msg, i) in chatMessages"
            :key="i"
            class="chat-message"
            :class="msg.role"
          >
            <div class="message-bubble">{{ msg.content }}</div>
            <div v-if="msg.sources?.length" class="message-sources">
              <span class="sources-label">Sources :</span>
              <a
                v-for="s in msg.sources.slice(0, 4)"
                :key="s.url"
                :href="s.url"
                target="_blank"
                rel="noopener"
                class="source-chip"
              >{{ s.title }}</a>
            </div>
          </div>
          <!-- Typing indicator -->
          <div v-if="chatLoading" class="chat-message model">
            <div class="message-bubble typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input-row">
          <input
            v-model="chatInput"
            class="chat-input"
            :placeholder="`Pose une question sur ${entry?.title ?? 'ce média'}…`"
            :disabled="chatLoading"
            @keydown.enter.prevent="sendChatMessage"
          />
          <button
            class="chat-send-btn"
            :disabled="chatLoading || !chatInput.trim()"
            @click="sendChatMessage"
            title="Envoyer"
          >↑</button>
        </div>
        <p v-if="!chatMessages.length" class="chat-hint">Gemini 2.5 Flash · recherche web en temps réel</p>
      </section>

      <!-- Lightbox -->
      <Transition name="modal">
        <div v-if="lightboxImg" class="lightbox" @click="lightboxImg = null">
          <img :src="lightboxImg" class="lightbox-img" />
        </div>
      </Transition>
    </template>
  </div>
</template>

<style scoped>
.back-link {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  color: var(--text-dim);
  font-size: 0.9rem;
  margin-bottom: 2.5rem;
  transition: color 0.2s;
}
.back-link:hover { color: var(--accent); }

/* ── Loading / Error ── */
.loading-state {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 4rem 0;
  color: var(--text-dim);
}
.loading-spinner {
  width: 24px; height: 24px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.error-state { padding: 4rem 0; text-align: center; color: var(--text-dim); }
.btn-back {
  display: inline-block;
  margin-top: 1rem;
  color: var(--accent);
  font-size: 0.9rem;
}

/* ── Hero ── */
.hero {
  position: relative;
  border-radius: var(--radius-lg);
  overflow: hidden;
  margin-bottom: 3rem;
  border: 1px solid var(--border);
}

.hero-bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center top;
  filter: blur(48px) brightness(0.25) saturate(1.5);
  transform: scale(1.15);
  z-index: 0;
}

.hero-content {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 2.5rem;
  padding: 2.5rem;
  align-items: flex-start;
}

.hero-cover-wrap {
  flex-shrink: 0;
  width: 200px;
}

.hero-cover {
  width: 100%;
  border-radius: 10px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  display: block;
}

.hero-cover-placeholder {
  width: 200px;
  height: 280px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 4rem;
  background: rgba(255,255,255,0.05);
  border-radius: 10px;
}

.hero-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.hero-type-label {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  width: fit-content;
}
.hero-type-label.anime { background: rgba(139, 46, 59, 0.6); color: #fca5a5; }
.hero-type-label.game  { background: rgba(30, 80, 160, 0.6);  color: #93c5fd; }

.hero-title {
  font-size: clamp(1.5rem, 4vw, 2.4rem);
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
}

.hero-original {
  font-size: 1rem;
  color: rgba(255,255,255,0.55);
  font-style: italic;
}

.meta-chips {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  align-items: center;
}

.chip {
  font-size: 0.78rem;
  padding: 0.2rem 0.7rem;
  border-radius: 20px;
  background: rgba(255,255,255,0.12);
  color: rgba(255,255,255,0.8);
  border: 1px solid rgba(255,255,255,0.15);
}
.chip-platform { background: rgba(196, 150, 60, 0.25); color: var(--accent-light); }

.hero-genres {
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
}
.genre-tag {
  font-size: 0.7rem;
  padding: 0.15rem 0.55rem;
  background: rgba(196, 150, 60, 0.18);
  color: var(--accent-light);
  border-radius: 4px;
  font-weight: 500;
}

.hero-tracking {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.status-badge {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.2rem 0.7rem;
  border-radius: 6px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.status-badge.green  { background: rgba(34, 197, 94, 0.2);   color: #4ade80; }
.status-badge.blue   { background: rgba(59, 130, 246, 0.2);  color: #60a5fa; }
.status-badge.orange { background: rgba(249, 115, 22, 0.2);  color: #fb923c; }
.status-badge.gray   { background: rgba(255,255,255,0.1);     color: rgba(255,255,255,0.5); }

.ext-score {
  font-size: 0.78rem;
  font-weight: 600;
  color: rgba(255,255,255,0.7);
  background: rgba(255,255,255,0.08);
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
}
.ext-score.metacritic { color: #fbbf24; }

/* Progress bars in hero */
.progress-block {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
  max-width: 380px;
}
.progress-label {
  display: flex;
  justify-content: space-between;
  font-size: 0.75rem;
  color: rgba(255,255,255,0.6);
  font-weight: 500;
}
.progress-value { font-weight: 700; }
.progress-track {
  height: 5px;
  background: rgba(255,255,255,0.15);
  border-radius: 3px;
  overflow: hidden;
}
.progress-fill {
  height: 100%;
  border-radius: 3px;
  transition: width 0.4s ease;
}

/* Current arc banner */
.current-arc-banner {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: rgba(255,255,255,0.75);
  background: rgba(196, 150, 60, 0.2);
  border: 1px solid rgba(196, 150, 60, 0.3);
  padding: 0.4rem 0.9rem;
  border-radius: 8px;
  width: fit-content;
}
.current-arc-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}
.current-arc-range { color: rgba(255,255,255,0.45); font-size: 0.75rem; }

.hero-notes {
  font-size: 0.82rem;
  color: rgba(255,255,255,0.5);
  font-style: italic;
}

.website-link {
  font-size: 0.82rem;
  color: var(--accent-light);
  text-decoration: underline;
  text-underline-offset: 2px;
  width: fit-content;
}

/* ── Content sections ── */
.content-section {
  margin-bottom: 3rem;
}

.section-heading {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 1.25rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.section-note {
  font-size: 0.78rem;
  font-weight: 400;
  color: var(--text-dim);
}

/* Synopsis */
.synopsis-block {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
}
.synopsis-text {
  color: var(--text-muted);
  font-size: 0.95rem;
  line-height: 1.7;
  white-space: pre-wrap;
}
.read-more-btn {
  margin-top: 0.75rem;
  background: none;
  border: none;
  color: var(--accent);
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  padding: 0;
  transition: opacity 0.15s;
}
.read-more-btn:hover { opacity: 0.7; }

/* Trailer */
.trailer-wrap {
  position: relative;
  padding-bottom: 56.25%;
  border-radius: var(--radius);
  overflow: hidden;
  background: var(--bg-card);
  border: 1px solid var(--border);
}
.trailer-wrap iframe {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

/* ── Arcs ── */
.arcs-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.arc-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
  transition: border-color 0.15s;
}
.arc-item.filler { opacity: 0.65; }
.arc-item.is-current { border-color: var(--accent); }
.arc-item.is-current:hover { border-color: var(--accent); }
.arc-item:hover { border-color: rgba(196,150,60,0.4); }

.arc-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  gap: 1rem;
  font-family: inherit;
  transition: background 0.15s;
}
.arc-header:hover { background: var(--bg-card-hover); }

.arc-header-left {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
  min-width: 0;
}

.arc-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--border);
  flex-shrink: 0;
}
.arc-dot.current { background: var(--accent); box-shadow: 0 0 0 3px rgba(196,150,60,0.3); }
.arc-dot.filler { background: #6b7280; }

.arc-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.filler-badge {
  font-size: 0.65rem;
  padding: 0.1rem 0.45rem;
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}

.current-badge {
  font-size: 0.7rem;
  color: var(--accent);
  font-weight: 500;
  flex-shrink: 0;
}

.arc-header-right {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

.arc-range {
  font-size: 0.78rem;
  color: var(--text-dim);
  font-variant-numeric: tabular-nums;
}

.arc-chevron {
  font-size: 0.65rem;
  color: var(--text-dim);
}

/* Episodes inside arc */
.arc-episodes {
  border-top: 1px solid var(--border);
  padding: 0.5rem 0;
  max-height: 280px;
  overflow-y: auto;
}

.arc-episode {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.35rem 1rem;
  transition: background 0.1s;
}
.arc-episode:hover { background: var(--bg-card-hover); }
.arc-episode.watched .ep-num { color: var(--accent); }
.arc-episode.watched .ep-title { color: var(--text-muted); }
.arc-episode.filler { opacity: 0.6; }

/* Episodes flat */
.episodes-flat {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  max-height: 400px;
  overflow-y: auto;
}

.flat-episode {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 1rem;
  transition: background 0.1s;
  border-bottom: 1px solid rgba(255,255,255,0.04);
}
.flat-episode:last-child { border-bottom: none; }
.flat-episode:hover { background: var(--bg-card-hover); }
.flat-episode.watched .ep-num { color: var(--accent); }

.ep-num {
  font-size: 0.72rem;
  font-weight: 700;
  color: var(--text-dim);
  width: 32px;
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
}
.ep-title {
  font-size: 0.85rem;
  color: var(--text-muted);
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ep-tag {
  font-size: 0.63rem;
  padding: 0.1rem 0.4rem;
  background: rgba(107, 114, 128, 0.2);
  color: #9ca3af;
  border-radius: 4px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  flex-shrink: 0;
}
.ep-tag.recap { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }

/* ── Screenshots ── */
.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 0.75rem;
}

.screenshot {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: var(--radius);
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid var(--border);
}
.screenshot:hover { transform: scale(1.02); box-shadow: var(--shadow-md); }

/* Lightbox */
.lightbox {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.9);
  z-index: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  cursor: zoom-out;
}
.lightbox-img {
  max-width: 100%;
  max-height: 90vh;
  border-radius: var(--radius);
  box-shadow: 0 24px 80px rgba(0,0,0,0.8);
}

/* Arc expand transition */
.arc-expand-enter-active, .arc-expand-leave-active {
  transition: max-height 0.25s ease, opacity 0.2s ease;
  overflow: hidden;
}
.arc-expand-enter-from, .arc-expand-leave-to { max-height: 0; opacity: 0; }
.arc-expand-enter-to, .arc-expand-leave-from { max-height: 280px; opacity: 1; }

/* Modal transition (lightbox) */
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

/* ── Chat IA ── */
.chat-suggestions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.suggestion-chip {
  padding: 0.4rem 1rem;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 0.82rem;
  font-family: inherit;
  cursor: pointer;
  transition: var(--transition);
}
.suggestion-chip:hover { border-color: var(--accent); color: var(--accent); }

.chat-messages {
  max-height: 440px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 0.75rem;
  scroll-behavior: smooth;
}

.chat-message { display: flex; flex-direction: column; gap: 0.35rem; }
.chat-message.user  { align-items: flex-end; }
.chat-message.model { align-items: flex-start; }

.message-bubble {
  max-width: 78%;
  padding: 0.65rem 1rem;
  border-radius: 16px;
  font-size: 0.9rem;
  line-height: 1.65;
  white-space: pre-wrap;
  word-break: break-word;
}
.chat-message.user  .message-bubble { background: var(--gradient); color: #fff; border-bottom-right-radius: 4px; }
.chat-message.model .message-bubble { background: var(--bg-card-hover); color: var(--text-muted); border: 1px solid var(--border); border-bottom-left-radius: 4px; }

/* Typing dots */
.message-bubble.typing {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 0.75rem 1rem;
  min-width: 60px;
}
.message-bubble.typing span {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--text-dim);
  animation: typing-bounce 1.2s infinite ease-in-out;
}
.message-bubble.typing span:nth-child(2) { animation-delay: 0.2s; }
.message-bubble.typing span:nth-child(3) { animation-delay: 0.4s; }
@keyframes typing-bounce {
  0%, 80%, 100% { transform: scale(0.8); opacity: 0.4; }
  40% { transform: scale(1); opacity: 1; }
}

.message-sources {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
  align-items: center;
  padding: 0 0.25rem;
  max-width: 78%;
}
.sources-label { font-size: 0.68rem; color: var(--text-dim); font-weight: 500; }
.source-chip {
  font-size: 0.68rem;
  padding: 0.1rem 0.5rem;
  border-radius: 4px;
  background: rgba(196, 150, 60, 0.1);
  color: var(--accent-light);
  border: 1px solid rgba(196, 150, 60, 0.2);
  text-decoration: none;
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: inline-block;
  transition: opacity 0.15s;
}
.source-chip:hover { opacity: 0.75; }

.chat-input-row { display: flex; gap: 0.5rem; align-items: center; }

.chat-input {
  flex: 1;
  padding: 0.7rem 1.1rem;
  border: 1.5px solid var(--border);
  border-radius: 24px;
  background: var(--bg-card);
  color: var(--text);
  font-size: 0.9rem;
  font-family: inherit;
  outline: none;
  transition: border-color 0.2s;
}
.chat-input:focus { border-color: var(--accent); }
.chat-input::placeholder { color: var(--text-dim); }
.chat-input:disabled { opacity: 0.6; }

.chat-send-btn {
  width: 42px; height: 42px;
  border-radius: 50%;
  border: none;
  background: var(--gradient);
  color: #fff;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
  box-shadow: var(--shadow-accent);
  flex-shrink: 0;
}
.chat-send-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
.chat-send-btn:not(:disabled):hover { transform: scale(1.08); }

.chat-hint { font-size: 0.72rem; color: var(--text-dim); margin-top: 0.5rem; }

/* ── Responsive ── */
@media (max-width: 640px) {
  .hero-content {
    flex-direction: column;
    padding: 1.5rem;
    gap: 1.5rem;
  }
  .hero-cover-wrap { width: 130px; }
  .screenshots-grid { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); }
}
</style>
