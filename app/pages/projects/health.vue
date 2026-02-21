<template>
  <div class="section" style="padding-top: 8rem;">
    <div class="section-label">{{ t('nav.projects') }}</div>
    <h1 class="section-title">{{ t('health.title') }}</h1>
    <p class="subtitle">{{ t('health.subtitle') }}</p>

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
        <button
          v-if="!todayDone"
          class="btn btn-primary btn-validate"
          :disabled="validating"
          @click="validateToday"
        >
          {{ t('health.validate') }}
        </button>
        <div v-else class="done-badge" :class="{ celebrate: justValidated }">
          <span class="done-check">✓</span>
          <span>{{ t('health.done') }}</span>
        </div>
      </div>
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
        >
          <span v-if="cell.date" class="cal-date">{{ cell.day }}</span>
          <span v-if="cell.validated" class="cal-check">✓</span>
          <span v-else-if="cell.missed" class="cal-miss">✗</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, t } = useLocale()

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

const { data: stats, refresh: refreshStats } = await useFetch<Stats>('/api/health/stats')
const { data: entries } = await useFetch<Entry[]>('/api/health/entries', { default: () => [] })

const todayDone = ref(stats.value?.todayValidated ?? false)
const validating = ref(false)
const justValidated = ref(false)

watch(() => stats.value?.todayValidated, (val) => {
  if (val) todayDone.value = true
})

async function validateToday() {
  validating.value = true
  try {
    await $fetch('/api/health/validate', { method: 'POST' })
    todayDone.value = true
    justValidated.value = true
    await refreshStats()
    setTimeout(() => { justValidated.value = false }, 2000)
  } finally {
    validating.value = false
  }
}

function formatNumber(n: number): string {
  return n.toLocaleString()
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

  // Monday = 0, Sunday = 6
  let dayOfWeek = firstDay.getDay() - 1
  if (dayOfWeek < 0) dayOfWeek = 6

  const validatedDates = new Set(
    (entries.value ?? []).filter(e => e.validated).map(e => e.date)
  )

  const cells: { date: string | null; day: number; validated: boolean; missed: boolean; isToday: boolean; isFuture: boolean }[] = []

  // Empty cells before first day
  for (let i = 0; i < dayOfWeek; i++) {
    cells.push({ date: null, day: 0, validated: false, missed: false, isToday: false, isFuture: false })
  }

  // Days of month
  for (let d = 1; d <= lastDay.getDate(); d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const isToday = dateStr === today
    const isFuture = dateStr > today
    const isBeforeStart = dateStr < startDate
    const validated = validatedDates.has(dateStr)
    const missed = !validated && !isFuture && !isBeforeStart && dateStr >= startDate

    cells.push({ date: dateStr, day: d, validated, missed, isToday, isFuture })
  }

  return cells
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
  background: rgba(72, 198, 239, 0.1);
  border: 1px solid rgba(72, 198, 239, 0.3);
  border-radius: 12px;
  padding: 1rem 2rem;
  color: #48c6ef;
  font-weight: 600;
  font-size: 1.1rem;
}

.done-badge.celebrate {
  animation: celebrate 0.6s ease-out;
}

.done-check {
  font-size: 1.5rem;
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
}

.cal-cell.empty {
  background: transparent;
}

.cal-cell.validated {
  background: rgba(108, 99, 255, 0.2);
  border: 1px solid rgba(108, 99, 255, 0.4);
}

.cal-cell.missed {
  background: rgba(255, 80, 80, 0.1);
  border: 1px solid rgba(255, 80, 80, 0.2);
}

.cal-cell.today {
  border: 2px solid var(--accent) !important;
  box-shadow: 0 0 12px rgba(108, 99, 255, 0.3);
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
