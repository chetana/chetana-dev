<template>
  <div class="section" style="padding-top: 8rem;">
    <div class="section-label">{{ t('nav.projects') }}</div>
    <h1 class="section-title">BabelDuo</h1>
    <p class="subtitle">
      {{ locale === 'fr'
        ? 'Assistant bilingue FR ↔ KH · Correction grammaticale Gemini en temps réel'
        : 'FR ↔ KH bilingual assistant · Real-time Gemini grammar correction' }}
    </p>

    <!-- Auth gate -->
    <div v-if="!isAuthenticated" class="auth-gate">
      <div class="auth-card">
        <div class="auth-icon">🗣️</div>
        <h2>{{ locale === 'fr' ? 'Connectez-vous pour tester' : 'Sign in to try it' }}</h2>
        <p>{{ locale === 'fr'
          ? 'Tapez une phrase en français ou khmer — Gemini la corrige, la traduit et explique chaque erreur.'
          : 'Type a sentence in French or Khmer — Gemini corrects it, translates it and explains each error.' }}</p>
        <div ref="googleBtnRef" class="google-btn-container"></div>
      </div>
    </div>

    <!-- Authenticated -->
    <template v-else>
      <!-- User row -->
      <div class="user-row">
        <span class="user-name">👤 {{ userName }}</span>
        <button class="btn-signout" @click="signOut">{{ locale === 'fr' ? 'Déconnexion' : 'Sign out' }}</button>
      </div>

      <!-- Tabs -->
      <div class="tabs">
        <button class="tab" :class="{ active: activeTab === 'analyze' }" @click="activeTab = 'analyze'">
          ✍️ {{ locale === 'fr' ? 'Analyser' : 'Analyze' }}
        </button>
        <button class="tab" :class="{ active: activeTab === 'history' }" @click="switchToHistory">
          📖 {{ locale === 'fr' ? 'Historique' : 'History' }}
          <span v-if="lessonsCount > 0" class="tab-badge">{{ lessonsCount }}</span>
        </button>
      </div>

      <!-- Tab: Analyser -->
      <div v-if="activeTab === 'analyze'" class="tab-content">
        <div class="input-card">
          <textarea
            v-model="inputText"
            class="text-input"
            :placeholder="locale === 'fr' ? 'Tapez une phrase en français ou khmer…' : 'Type a sentence in French or Khmer…'"
            :disabled="analyzing"
            rows="3"
            @keydown.ctrl.enter="analyze"
          />
          <div class="input-footer">
            <span class="input-hint">{{ locale === 'fr' ? 'Ctrl + Entrée pour analyser' : 'Ctrl + Enter to analyze' }}</span>
            <button class="btn btn-primary" :disabled="!inputText.trim() || analyzing" @click="analyze">
              <span v-if="analyzing">⏳</span>
              <span v-else>{{ locale === 'fr' ? 'Analyser' : 'Analyze' }}</span>
            </button>
          </div>
        </div>

        <div v-if="analyzeError" class="error-card">
          ⚠️ {{ analyzeError }}
        </div>

        <!-- Résultats -->
        <div v-if="result" class="results">

          <!-- Aucune erreur -->
          <div v-if="!result.lessons?.length" class="perfect-card">
            <span class="perfect-icon">✅</span>
            <div>
              <div class="perfect-title">{{ locale === 'fr' ? 'Parfait !' : 'Perfect!' }}</div>
              <div class="perfect-sub">{{ result.question }}</div>
            </div>
          </div>

          <!-- Correction principale -->
          <div v-else class="correction-card">
            <div class="correction-header">
              <span class="lang-flag">{{ langFlag(result.lang) }}</span>
              <span class="correction-label">{{ locale === 'fr' ? 'Texte corrigé' : 'Corrected text' }}</span>
            </div>
            <div class="correction-body">
              <div class="original-text">{{ inputText.trim() }}</div>
              <div class="correction-arrow">→</div>
              <div class="corrected-text">{{ result.corrected }}</div>
            </div>
            <div v-if="result.question" class="question-text">{{ result.question }}</div>
          </div>

          <!-- Leçons -->
          <div v-if="result.lessons?.length" class="lessons-section">
            <div class="lessons-title">
              📖 {{ result.lessons.length }} {{ locale === 'fr'
                ? (result.lessons.length > 1 ? 'leçons détectées' : 'leçon détectée')
                : (result.lessons.length > 1 ? 'lessons detected' : 'lesson detected') }}
            </div>
            <div v-for="(lesson, i) in result.lessons" :key="i" class="lesson-card">
              <div class="lesson-pair">
                <span class="lesson-original">{{ lesson.original }}</span>
                <span class="lesson-arrow">→</span>
                <span class="lesson-corrected">{{ lesson.corrected }}</span>
              </div>
              <div class="lesson-explanation">{{ lesson.explanation }}</div>
            </div>
          </div>

          <!-- Traductions -->
          <div class="translations-card">
            <div class="translations-title">🌐 {{ locale === 'fr' ? 'Traductions' : 'Translations' }}</div>
            <div class="translation-row">
              <span class="tl-flag">🇫🇷</span>
              <span class="tl-text">{{ result.fr }}</span>
            </div>
            <div class="translation-row">
              <span class="tl-flag">🇬🇧</span>
              <span class="tl-text">{{ result.en }}</span>
            </div>
            <div class="translation-row">
              <span class="tl-flag">🇰🇭</span>
              <span class="tl-text">{{ result.kh }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab: Historique -->
      <div v-if="activeTab === 'history'" class="tab-content">
        <div v-if="historyLoading" class="loading-state">
          ⏳ {{ locale === 'fr' ? 'Chargement…' : 'Loading…' }}
        </div>
        <div v-else-if="lessons.length === 0" class="empty-state">
          <div class="empty-icon">📭</div>
          <div class="empty-title">{{ locale === 'fr' ? 'Aucune correction enregistrée' : 'No corrections recorded yet' }}</div>
          <div class="empty-sub">{{ locale === 'fr'
            ? 'Analysez une phrase avec une faute dans l\'onglet Analyser — la leçon s\'enregistre ici.'
            : 'Analyze a sentence with an error in the Analyze tab — the lesson will appear here.' }}</div>
        </div>
        <div v-else>
          <div class="history-count">
            {{ locale === 'fr' ? `${lessons.length} correction${lessons.length > 1 ? 's' : ''} enregistrée${lessons.length > 1 ? 's' : ''}` : `${lessons.length} correction${lessons.length > 1 ? 's' : ''} recorded` }}
          </div>
          <div class="history-list">
            <div v-for="lesson in lessons" :key="lesson.id" class="history-card">
              <div class="history-meta">
                <span class="history-flag">{{ langFlag(lesson.lang) }}</span>
                <span class="history-author">{{ lesson.author }}</span>
                <span class="history-date">{{ formatDate(lesson.ts) }}</span>
              </div>
              <div class="history-pair">
                <span class="history-original">{{ lesson.original }}</span>
                <span class="history-arrow">→</span>
                <span class="history-corrected">{{ lesson.corrected }}</span>
              </div>
              <div class="history-lesson">{{ lesson.lesson }}</div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { locale, t } = useLocale()
const { isAuthenticated, userName, getAuthHeaders, loadFromStorage, initGIS, signOut: authSignOut, handleUnauthorized } = useGoogleAuth()

interface LessonItem {
  original: string
  corrected: string
  explanation: string
}

interface Suggestion {
  corrected: string
  fr: string
  en: string
  kh: string
  lang: string
  question: string
  lessons?: LessonItem[]
}

interface LessonEntry {
  id: string
  ts: string
  author: string
  original: string
  corrected: string
  lesson: string
  lang: string
}

const googleBtnRef = ref<HTMLElement | null>(null)
const activeTab = ref<'analyze' | 'history'>('analyze')
const inputText = ref('')
const result = ref<Suggestion | null>(null)
const analyzing = ref(false)
const analyzeError = ref('')
const lessons = ref<LessonEntry[]>([])
const historyLoading = ref(false)
const lessonsCount = ref(0)

function langFlag(lang: string): string {
  if (lang === 'fr') return '🇫🇷'
  if (lang === 'en') return '🇬🇧'
  if (lang === 'kh') return '🇰🇭'
  return '🌐'
}

function formatDate(ts: string): string {
  return new Date(ts).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

async function analyze() {
  const text = inputText.value.trim()
  if (!text || analyzing.value) return
  analyzing.value = true
  analyzeError.value = ''
  result.value = null
  try {
    const suggestion = await $fetch<Suggestion>('/api/chat/suggest', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: { text }
    })
    result.value = suggestion
    // Sauvegarde les leçons dans le fichier démo séparé (isolé des leçons privées)
    if (suggestion.lessons?.length) {
      $fetch('/api/chat/lessons-demo', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: { lessons: suggestion.lessons, lang: suggestion.lang }
      }).then((r: any) => { lessonsCount.value += r?.saved ?? 0 }).catch(() => {})
    }
  } catch (err: unknown) {
    if ((err as { statusCode?: number })?.statusCode === 401) {
      handleUnauthorized()
    } else {
      analyzeError.value = locale.value === 'fr' ? 'Erreur Gemini, réessayez.' : 'Gemini error, please try again.'
    }
  } finally {
    analyzing.value = false
  }
}

async function loadHistory() {
  historyLoading.value = true
  try {
    const data = await $fetch<LessonEntry[]>('/api/chat/lessons-demo', {
      headers: getAuthHeaders()
    })
    lessons.value = data
    lessonsCount.value = data.length
  } catch (err: unknown) {
    if ((err as { statusCode?: number })?.statusCode === 401) handleUnauthorized()
  } finally {
    historyLoading.value = false
  }
}

async function switchToHistory() {
  activeTab.value = 'history'
  await loadHistory()
}

function signOut() {
  authSignOut()
  result.value = null
  lessons.value = []
  lessonsCount.value = 0
  nextTick(() => {
    if (googleBtnRef.value) initGIS(googleBtnRef.value)
  })
}

onMounted(async () => {
  loadFromStorage()

  await new Promise<void>((resolve) => {
    if (window.google?.accounts?.id) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => resolve()
    document.head.appendChild(script)
  })

  if (isAuthenticated.value) {
    // Charge le count en arrière-plan pour le badge
    loadHistory().then(() => { activeTab.value = 'analyze' })
  } else {
    await nextTick()
    initGIS(googleBtnRef.value)
  }

  watch(isAuthenticated, async (val) => {
    if (val) {
      loadHistory().then(() => { activeTab.value = 'analyze' })
    }
  })
})

// SEO
const title = computed(() => locale.value === 'fr'
  ? 'BabelDuo — Assistant bilingue FR ↔ KH · Chetana YIN'
  : 'BabelDuo — FR ↔ KH Bilingual Assistant · Chetana YIN'
)
const description = computed(() => locale.value === 'fr'
  ? 'Correction grammaticale Gemini en temps réel, traductions FR/EN/KH et historique des leçons pour un couple bilingue.'
  : 'Real-time Gemini grammar correction, FR/EN/KH translations and lesson history for a bilingual couple.'
)

useSeoMeta({ title, description, ogTitle: title, ogDescription: description, ogType: 'website' })
</script>

<style scoped>
.subtitle {
  color: var(--text-muted);
  margin-top: -2rem;
  margin-bottom: 3rem;
}

/* Auth gate */
.auth-gate {
  display: flex;
  justify-content: center;
  padding: 4rem 0;
}

.auth-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 3rem 2.5rem;
  text-align: center;
  max-width: 440px;
  width: 100%;
}

.auth-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.auth-card h2 {
  font-size: 1.3rem;
  margin-bottom: 0.75rem;
}

.auth-card p {
  color: var(--text-muted);
  font-size: 0.95rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.google-btn-container {
  display: flex;
  justify-content: center;
  min-height: 44px;
}

/* User row */
.user-row {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.user-name {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.btn-signout {
  padding: 0.4rem 1rem;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-signout:hover {
  border-color: var(--accent);
  color: var(--text);
}

/* Tabs */
.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border);
  padding-bottom: 0;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-muted);
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -1px;
}

.tab:hover {
  color: var(--text);
}

.tab.active {
  color: var(--accent-light);
  border-bottom-color: var(--accent);
}

.tab-badge {
  background: var(--accent);
  color: var(--bg);
  font-size: 0.7rem;
  font-weight: 700;
  border-radius: 10px;
  padding: 0.1rem 0.5rem;
  min-width: 1.2rem;
  text-align: center;
}

.tab-content {
  animation: fadeIn 0.2s ease;
}

/* Input card */
.input-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.text-input {
  width: 100%;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  font-family: inherit;
  min-height: 80px;
}

.text-input::placeholder {
  color: var(--text-dim);
}

.text-input:disabled {
  opacity: 0.6;
}

.input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--border);
}

.input-hint {
  font-size: 0.8rem;
  color: var(--text-dim);
}

/* Error */
.error-card {
  background: rgba(220, 60, 60, 0.08);
  border: 1px solid rgba(220, 60, 60, 0.25);
  border-radius: 10px;
  padding: 1rem 1.25rem;
  color: #ff7070;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

/* Results */
.results {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Perfect */
.perfect-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(30, 170, 100, 0.08);
  border: 1px solid rgba(30, 170, 100, 0.25);
  border-radius: 12px;
  padding: 1.5rem;
}

.perfect-icon {
  font-size: 2rem;
  flex-shrink: 0;
}

.perfect-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #3ec87a;
  margin-bottom: 0.25rem;
}

.perfect-sub {
  color: var(--text-muted);
  font-size: 0.9rem;
}

/* Correction */
.correction-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
}

.correction-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.lang-flag {
  font-size: 1.2rem;
}

.correction-label {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
}

.correction-body {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 0.75rem;
}

.original-text {
  color: var(--text-muted);
  text-decoration: line-through;
  font-size: 1rem;
}

.correction-arrow {
  color: var(--accent);
  font-size: 1.2rem;
  flex-shrink: 0;
}

.corrected-text {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text);
}

.question-text {
  font-size: 0.9rem;
  color: var(--text-muted);
  font-style: italic;
  margin-top: 0.5rem;
}

/* Lessons */
.lessons-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.lessons-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.lesson-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 10px;
  padding: 1rem 1.25rem;
}

.lesson-pair {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
}

.lesson-original {
  text-decoration: line-through;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.lesson-arrow {
  color: var(--accent);
  font-size: 1rem;
  flex-shrink: 0;
}

.lesson-corrected {
  font-weight: 600;
  color: var(--text);
  font-size: 0.95rem;
}

.lesson-explanation {
  font-size: 0.9rem;
  color: var(--text-muted);
  line-height: 1.5;
  font-style: italic;
}

/* Translations */
.translations-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.25rem;
}

.translations-title {
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.translation-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.translation-row + .translation-row {
  border-top: 1px solid var(--border);
}

.tl-flag {
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 0.1rem;
}

.tl-text {
  font-size: 0.95rem;
  color: var(--text);
  line-height: 1.5;
}

/* History */
.loading-state {
  text-align: center;
  color: var(--text-muted);
  padding: 3rem;
  font-size: 1rem;
}

.empty-state {
  text-align: center;
  padding: 4rem 1rem;
  color: var(--text-muted);
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.empty-title {
  font-size: 1.1rem;
  margin-bottom: 0.5rem;
}

.empty-sub {
  font-size: 0.9rem;
  color: var(--text-dim);
  max-width: 380px;
  margin: 0 auto;
  line-height: 1.6;
}

.history-count {
  font-size: 0.85rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.history-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-left: 3px solid var(--accent);
  border-radius: 10px;
  padding: 1rem 1.25rem;
}

.history-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.6rem;
}

.history-flag {
  font-size: 1rem;
}

.history-author {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent-light);
}

.history-date {
  font-size: 0.8rem;
  color: var(--text-dim);
  margin-left: auto;
}

.history-pair {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.history-original {
  text-decoration: line-through;
  color: var(--text-muted);
  font-size: 0.95rem;
}

.history-arrow {
  color: var(--accent);
  flex-shrink: 0;
}

.history-corrected {
  font-weight: 600;
  color: var(--text);
  font-size: 0.95rem;
}

.history-lesson {
  font-size: 0.88rem;
  color: var(--text-muted);
  line-height: 1.5;
  font-style: italic;
}

/* Animations */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 600px) {
  .tabs { overflow-x: auto; }
  .tab { padding: 0.6rem 1rem; font-size: 0.88rem; }
  .correction-body { flex-direction: column; align-items: flex-start; gap: 0.4rem; }
}
</style>
