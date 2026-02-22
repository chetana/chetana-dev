<template>
  <div class="section" style="padding-top: 8rem;">
    <div class="section-label">{{ t('nav.projects') }}</div>
    <h1 class="section-title">{{ t('health.title') }}</h1>
    <p class="subtitle">{{ t('health.subtitle') }}</p>

    <!-- Auth gate -->
    <div v-if="!isAuthenticated" class="auth-gate">
      <div class="auth-card">
        <div class="auth-icon">💪</div>
        <h2>{{ locale === 'fr' ? 'Connectez-vous pour voir vos stats' : 'Sign in to see your stats' }}</h2>
        <p>{{ locale === 'fr' ? 'Vos données push-ups sont privées et sécurisées avec Google.' : 'Your push-up data is private and secured with Google.' }}</p>
        <div ref="googleBtnRef" class="google-btn-container"></div>
      </div>
    </div>

    <!-- Main content (authenticated) -->
    <template v-else>
      <!-- User info + sign out -->
      <div class="user-row">
        <span class="user-name">👤 {{ userName }}</span>
        <button class="btn-signout" @click="signOut">{{ locale === 'fr' ? 'Déconnexion' : 'Sign out' }}</button>
      </div>

      <!-- Stats cards -->
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-icon" :class="{ pulse: stats?.currentStreak }">🔥</span>
          <div class="stat-value">{{ stats?.currentStreak ?? 0 }}</div>
          <div class="stat-label">{{ t('health.streak') }}</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">💪</span>
          <div class="stat-value">{{ formatNumber(stats?.totalPushups ?? 0) }}</div>
          <div class="stat-label">{{ t('health.total') }}</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">✅</span>
          <div class="stat-value">{{ stats?.totalDays ?? 0 }}</div>
          <div class="stat-label">{{ t('health.days') }}</div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🏆</span>
          <div class="stat-value">{{ stats?.longestStreak ?? 0 }}</div>
          <div class="stat-label">{{ t('health.best') }}</div>
        </div>
      </div>

      <!-- Today card -->
      <div class="today-card">
        <div class="today-header">
          <h2>{{ t('health.today') }}</h2>
          <span class="today-target">{{ t('health.target') }}: {{ stats?.todayTarget ?? 20 }} pompes</span>
        </div>
        <div class="today-action">
          <div v-if="!todayDone" class="stepper-row">
            <div class="stepper">
              <button class="stepper-btn" :disabled="pushupCount <= 1" @click="pushupCount--">−</button>
              <span class="stepper-value">{{ pushupCount }}</span>
              <button class="stepper-btn" :disabled="pushupCount >= 200" @click="pushupCount++">+</button>
            </div>
            <button
              class="btn btn-primary btn-validate"
              :disabled="validating"
              @click="validateToday"
            >
              {{ t('health.validate') }}
            </button>
          </div>
          <div v-else class="done-badge" :class="{ celebrate: justValidated }">
            <span class="done-check">✓</span>
            <span>{{ t('health.done') }}</span>
          </div>
        </div>
      </div>

      <!-- Notification toggle -->
      <div class="notif-row">
        <button
          class="btn-notif"
          :class="{ active: pushEnabled, denied: pushDenied }"
          :disabled="pushDenied"
          @click="togglePush"
        >
          <span class="notif-icon">{{ pushDenied ? '🔕' : pushEnabled ? '🔔' : '🔕' }}</span>
          <span>{{ pushDenied ? t('health.notif.denied') : pushEnabled ? t('health.notif.enabled') : t('health.notif.enable') }}</span>
        </button>
      </div>

      <!-- Calendar -->
      <div class="calendar-section">
        <div class="calendar-header">
          <button class="cal-nav" @click="prevMonth">←</button>
          <h3>{{ monthLabel }}</h3>
          <button class="cal-nav" @click="nextMonth">→</button>
        </div>
        <div class="calendar-grid">
          <div v-for="day in dayLabels" :key="day" class="cal-day-label">{{ day }}</div>
          <div
            v-for="(cell, i) in calendarCells"
            :key="i"
            class="cal-cell"
            :class="{
              empty: !cell.date,
              validated: cell.validated,
              missed: cell.missed,
              today: cell.isToday,
              future: cell.isFuture
            }"
            :title="cell.pushups ? `${cell.pushups} ${locale === 'fr' ? 'pompes' : 'pushups'}` : undefined"
          >
            <span v-if="cell.date" class="cal-date">{{ cell.day }}</span>
            <span v-if="cell.validated" class="cal-check">✓</span>
            <span v-else-if="cell.missed" class="cal-miss">✗</span>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { locale, t } = useLocale()
const { isAuthenticated, userName, getAuthHeaders, loadFromStorage, initGIS, signOut: authSignOut, handleUnauthorized } = useGoogleAuth()

interface Stats {
  totalPushups: number
  totalDays: number
  currentStreak: number
  longestStreak: number
  todayValidated: boolean
  todayTarget: number
}

interface Entry {
  date: string
  pushups: number
  validated: boolean
}

// Data — only fetched once authenticated (client-side)
const stats = ref<Stats | null>(null)
const entries = ref<Entry[]>([])

const todayDone = ref(false)
const validating = ref(false)
const justValidated = ref(false)
const pushupCount = ref(20)

const googleBtnRef = ref<HTMLElement | null>(null)

async function fetchData() {
  const headers = getAuthHeaders()
  try {
    const [s, e] = await Promise.all([
      $fetch<Stats>('/api/health/stats', { headers }),
      $fetch<Entry[]>('/api/health/entries', { headers })
    ])
    stats.value = s
    entries.value = e
    todayDone.value = s.todayValidated
    pushupCount.value = s.todayTarget ?? 20
  } catch (err: unknown) {
    if ((err as { statusCode?: number })?.statusCode === 401) {
      handleUnauthorized()
    }
  }
}

async function validateToday() {
  validating.value = true
  try {
    await $fetch('/api/health/validate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: { pushups: pushupCount.value }
    })
    todayDone.value = true
    justValidated.value = true
    await fetchData()
    setTimeout(() => { justValidated.value = false }, 2000)
  } catch (err: unknown) {
    if ((err as { statusCode?: number })?.statusCode === 401) {
      handleUnauthorized()
    }
  } finally {
    validating.value = false
  }
}

function signOut() {
  authSignOut()
  stats.value = null
  entries.value = []
  todayDone.value = false
  // Re-render the sign-in button after DOM updates
  nextTick(() => {
    if (googleBtnRef.value) {
      initGIS(googleBtnRef.value)
    }
  })
}

function formatNumber(n: number): string {
  return n.toLocaleString()
}

// Push notifications
const pushEnabled = ref(false)
const pushDenied = ref(false)

async function togglePush() {
  if (pushEnabled.value) {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      await $fetch('/api/push/unsubscribe', { method: 'POST', body: { endpoint: sub.endpoint } })
      await sub.unsubscribe()
    }
    pushEnabled.value = false
  } else {
    const permission = await Notification.requestPermission()
    if (permission === 'denied') { pushDenied.value = true; return }
    if (permission !== 'granted') return

    const { key } = await $fetch<{ key: string }>('/api/push/vapid-public-key')
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(key)
    })
    const json = sub.toJSON()
    await $fetch('/api/push/subscribe', {
      method: 'POST',
      body: { endpoint: sub.endpoint, keys: json.keys }
    })
    pushEnabled.value = true
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

// Calendar logic
const calendarMonth = ref(new Date())

const dayLabels = computed(() => {
  return locale.value === 'fr'
    ? ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
    : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
})

const monthLabel = computed(() => {
  const m = calendarMonth.value
  return m.toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', { month: 'long', year: 'numeric' })
})

function prevMonth() {
  const d = new Date(calendarMonth.value)
  d.setMonth(d.getMonth() - 1)
  calendarMonth.value = d
}

function nextMonth() {
  const d = new Date(calendarMonth.value)
  d.setMonth(d.getMonth() + 1)
  calendarMonth.value = d
}

const calendarCells = computed(() => {
  const year = calendarMonth.value.getFullYear()
  const month = calendarMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const today = new Date().toISOString().slice(0, 10)
  const startDate = '2026-01-01'

  let dayOfWeek = firstDay.getDay() - 1
  if (dayOfWeek < 0) dayOfWeek = 6

  const validatedDates = new Set(
    (entries.value ?? []).filter(e => e.validated).map(e => e.date)
  )

  const pushupsByDate = new Map(
    (entries.value ?? []).filter(e => e.validated && e.pushups).map(e => [e.date, e.pushups])
  )

  const cells: { date: string | null; day: number; validated: boolean; missed: boolean; isToday: boolean; isFuture: boolean; pushups: number | null }[] = []

  for (let i = 0; i < dayOfWeek; i++) {
    cells.push({ date: null, day: 0, validated: false, missed: false, isToday: false, isFuture: false, pushups: null })
  }

  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isToday = dateStr === today
    const isFuture = dateStr > today
    const isBeforeStart = dateStr < startDate
    const validated = validatedDates.has(dateStr)
    const missed = !validated && !isFuture && !isBeforeStart && dateStr >= startDate

    cells.push({ date: dateStr, day: d, validated, missed, isToday, isFuture, pushups: pushupsByDate.get(dateStr) ?? null })
  }

  return cells
})

// Load GIS script + init on mount
onMounted(async () => {
  loadFromStorage()

  // Push notification state
  if ('Notification' in window && 'serviceWorker' in navigator) {
    pushDenied.value = Notification.permission === 'denied'
    if (Notification.permission === 'granted') {
      const reg = await navigator.serviceWorker.ready
      const sub = await reg.pushManager.getSubscription()
      pushEnabled.value = !!sub
    }
  }

  // Load Google Identity Services script
  await new Promise<void>((resolve) => {
    if (window.google?.accounts?.id) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => resolve() // fail silently
    document.head.appendChild(script)
  })

  if (isAuthenticated.value) {
    // Already signed in — fetch data
    await fetchData()
  } else {
    // Show sign-in button + One Tap
    await nextTick()
    initGIS(googleBtnRef.value)
  }

  // Watch for auth state change (after One Tap sign-in)
  watch(isAuthenticated, async (val) => {
    if (val) {
      await fetchData()
    }
  })
})

// SEO
const title = computed(() => locale.value === 'fr'
  ? 'Suivi pompes quotidien — Chetana YIN'
  : 'Daily Pushup Tracker — Chetana YIN'
)
const description = computed(() => locale.value === 'fr'
  ? 'Suivi quotidien de pompes avec streak, calendrier et validation. Chaque jour compte.'
  : 'Daily pushup tracking with streak, calendar and validation. Every day counts.'
)

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website'
})
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
  max-width: 420px;
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

/* Stats grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (max-width: 700px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

.stat-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  transition: transform 0.2s, border-color 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
  border-color: var(--accent);
}

.stat-icon {
  font-size: 1.5rem;
  display: block;
  margin-bottom: 0.5rem;
}

.stat-icon.pulse {
  animation: pulse 1.5s ease-in-out infinite;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.25rem;
}

/* Today card */
.today-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

@media (max-width: 500px) {
  .today-card { flex-direction: column; gap: 1rem; text-align: center; }
  .stepper-row { flex-direction: column; }
}

.today-header h2 {
  font-size: 1.3rem;
  margin-bottom: 0.25rem;
}

.today-target {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.btn-validate {
  font-size: 1.1rem;
  padding: 1rem 2.5rem;
}

.done-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(30, 144, 200, 0.08);
  border: 1px solid rgba(30, 144, 200, 0.25);
  border-radius: 12px;
  padding: 1rem 2rem;
  color: #1a7fb5;
  font-weight: 600;
  font-size: 1.1rem;
}

.done-badge.celebrate {
  animation: celebrate 0.6s ease-out;
}

.done-check {
  font-size: 1.5rem;
}

/* Stepper */
.stepper-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stepper {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.stepper-btn {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text);
  font-size: 1.2rem;
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stepper-btn:hover:not(:disabled) {
  border-color: var(--accent);
  background: rgba(196, 150, 60, 0.08);
}

.stepper-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.stepper-value {
  font-size: 1.3rem;
  font-weight: 700;
  min-width: 2.5rem;
  text-align: center;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Notification toggle */
.notif-row {
  margin-bottom: 2rem;
  display: flex;
  justify-content: center;
}

.btn-notif {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--bg-card);
  color: var(--text-muted);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-notif:hover:not(:disabled) {
  border-color: var(--accent);
  color: var(--text);
}

.btn-notif.active {
  border-color: var(--accent);
  background: rgba(196, 150, 60, 0.08);
  color: var(--accent-light);
}

.btn-notif.denied {
  opacity: 0.5;
  cursor: not-allowed;
}

.notif-icon {
  font-size: 1.1rem;
}

/* Calendar */
.calendar-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 2rem;
}

.calendar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
}

.calendar-header h3 {
  font-size: 1.1rem;
  text-transform: capitalize;
}

.cal-nav {
  background: transparent;
  border: 1px solid var(--border);
  color: var(--text);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: border-color 0.2s;
}

.cal-nav:hover {
  border-color: var(--accent);
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
}

.cal-day-label {
  text-align: center;
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding-bottom: 0.5rem;
}

.cal-cell {
  aspect-ratio: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  font-size: 0.85rem;
  position: relative;
  transition: background 0.2s;
  min-width: 0;
  overflow: hidden;
}

.cal-cell.empty {
  background: transparent;
}

.cal-cell.validated {
  background: rgba(196, 150, 60, 0.1);
  border: 1px solid rgba(196, 150, 60, 0.3);
}

.cal-cell.missed {
  background: rgba(220, 60, 60, 0.08);
  border: 1px solid rgba(220, 60, 60, 0.2);
}

.cal-cell.today {
  border: 2px solid var(--accent) !important;
  box-shadow: 0 0 12px rgba(196, 150, 60, 0.3);
}

.cal-cell.future {
  opacity: 0.3;
}

.cal-date {
  font-size: 0.8rem;
  color: var(--text-muted);
}

.cal-check {
  color: var(--accent-light);
  font-size: 0.7rem;
  font-weight: 700;
}

.cal-miss {
  color: #ff5050;
  font-size: 0.65rem;
}

@media (max-width: 480px) {
  .calendar-section { padding: 1rem; }
  .calendar-grid { gap: 2px; }
  .cal-cell { border-radius: 4px; font-size: 0.75rem; }
  .cal-date { font-size: 0.65rem; }
  .cal-check { font-size: 0.55rem; }
  .cal-miss { font-size: 0.5rem; }
  .cal-day-label { font-size: 0.6rem; letter-spacing: 0; }
}

/* Animations */
@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

@keyframes celebrate {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}
</style>
