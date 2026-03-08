<template>
  <div class="section natation-page">
    <NuxtLink to="/passions" class="back-link">← Passions</NuxtLink>

    <div class="section-label">Passions</div>
    <h1 class="section-title">🏊 Natation</h1>
    <p class="page-subtitle">Toutes mes sessions Strava — stats, allure et progression.</p>

    <!-- ── Stats accordéon ── -->
    <div v-if="stats" class="profile-section">
      <button class="stats-toggle" @click="statsOpen = !statsOpen">
        <span class="stats-toggle-label">📊 Mes stats natation</span>
        <span class="stats-toggle-chevron" :class="{ open: statsOpen }">›</span>
      </button>

      <div class="stats-body" :class="{ open: statsOpen }">

        <!-- Chips -->
        <div class="stats-strip">
          <div class="stat-item">
            <span class="stat-value">{{ Math.round(stats.total_km * 1000).toLocaleString('fr-FR') }}</span>
            <span class="stat-label">m nagés</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.total_rides }}</span>
            <span class="stat-label">sessions</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatHours(stats.total_moving_time_s) }}</span>
            <span class="stat-label">dans l'eau</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ Math.round(stats.best_ride_km * 1000).toLocaleString('fr-FR') }}</span>
            <span class="stat-label">m record</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ Math.round(stats.average_km_per_ride * 1000) }}</span>
            <span class="stat-label">m moy/session</span>
          </div>
        </div>

        <!-- Distance par mois -->
        <div v-if="stats.monthly.length" class="chart-section">
          <div class="chart-title">📅 Distance par mois (12 derniers mois)</div>
          <div class="bar-chart">
            <div v-for="m in stats.monthly" :key="m.month" class="bar-col">
              <div class="bar-label-top">{{ Math.round(m.km * 1000) }}</div>
              <div class="bar-track">
                <div class="bar-fill dist-fill" :style="{ height: distBarHeight(m.km) }" />
              </div>
              <div class="bar-label-bot">{{ formatMonth(m.month) }}</div>
            </div>
          </div>
        </div>

        <!-- Deux colonnes : Top sessions + répartition -->
        <div class="two-cols">

          <!-- Top 5 sessions -->
          <div class="col-card">
            <div class="col-title">🏆 Top 5 sessions (distance)</div>
            <div class="top-rides">
              <div v-for="(r, i) in stats.top_rides" :key="r.id" class="top-ride">
                <span class="ride-rank">{{ i + 1 }}</span>
                <div class="ride-info">
                  <span class="ride-name">{{ r.name }}</span>
                  <span class="ride-meta">
                    {{ Math.round(r.distance_m) }} m
                    · {{ formatDuration(r.moving_time_s) }}
                    <span v-if="r.average_speed_ms"> · {{ formatPaceSwim(r.average_speed_ms) }}/100m</span>
                  </span>
                  <span class="ride-date">{{ formatDate(r.start_date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Répartition types -->
          <div class="col-card">
            <div class="col-title">🌊 Types de session</div>
            <div class="sport-types">
              <div v-for="s in stats.by_sport_type" :key="s.sport_type" class="sport-row">
                <span class="sport-name">{{ SPORT_LABEL[s.sport_type] ?? s.sport_type }}</span>
                <div class="sport-bar-track">
                  <div class="sport-bar-fill" :style="{ width: sportBarWidth(s.count) }" />
                </div>
                <span class="sport-meta">{{ s.count }} session{{ s.count > 1 ? 's' : '' }} · {{ Math.round(s.km * 1000) }} m</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Loading stats -->
    <div v-else-if="statsPending" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Chargement des stats…</span>
    </div>

    <!-- ── Liste des sessions récentes ── -->
    <div class="rides-section">
      <h2 class="rides-title">Sessions récentes</h2>

      <div v-if="activitiesPending" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Chargement…</span>
      </div>

      <div v-else-if="activities?.length" class="rides-list">
        <div v-for="a in activities" :key="a.id" class="ride-card">
          <div class="ride-header">
            <span class="ride-card-name">{{ a.name }}</span>
            <span class="ride-card-date">{{ formatDate(a.start_date) }}</span>
          </div>
          <div class="ride-card-stats">
            <span class="ride-stat">📍 {{ Math.round(a.distance_m) }} m</span>
            <span class="ride-stat">⏱️ {{ formatDuration(a.moving_time_s) }}</span>
            <span v-if="a.average_speed_ms" class="ride-stat">💨 {{ formatPaceSwim(a.average_speed_ms) }}/100m</span>
            <span v-if="a.average_heartrate" class="ride-stat">❤️ {{ Math.round(a.average_heartrate) }} bpm</span>
            <span v-if="a.average_cadence" class="ride-stat">🔄 {{ Math.round(a.average_cadence) }} cycles/min</span>
          </div>
          <div class="ride-card-tags">
            <span class="ride-tag type">{{ SPORT_LABEL[a.sport_type] ?? a.sport_type }}</span>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <p>Aucune session enregistrée pour l'instant.</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Natation — Chetana YIN' })

const API_BASE = 'https://chetaku-rs-267131866578.europe-west1.run.app'

interface MonthlyTotal { month: string; km: number; elevation_m: number; rides: number }
interface SportTypeStat { sport_type: string; count: number; km: number }
interface TopRide {
  id: number; name: string; start_date: string
  distance_m: number; elevation_gain_m: number; moving_time_s: number; average_speed_ms: number | null
}
interface SwimStats {
  total_rides: number; total_km: number; total_elevation_m: number
  total_moving_time_s: number; best_ride_km: number; best_elevation_m: number
  average_km_per_ride: number; monthly: MonthlyTotal[]
  by_sport_type: SportTypeStat[]; top_rides: TopRide[]
}
interface Activity {
  id: number; name: string; sport_type: string; start_date: string
  distance_m: number; moving_time_s: number; elevation_gain_m: number
  average_speed_ms: number | null; average_heartrate: number | null
  max_heartrate: number | null; average_watts: number | null
  average_cadence: number | null; kudos_count: number; pr_count: number
  trainer: boolean; commute: boolean
}

const { data: stats, pending: statsPending } = useFetch<SwimStats>(`${API_BASE}/strava/stats?sport=swimming`)
const { data: activities, pending: activitiesPending } = useFetch<Activity[]>(`${API_BASE}/strava/activities?sport=swimming`)

const statsOpen = ref(false)
watch(stats, (val) => {
  if (val && !statsOpen.value) setTimeout(() => { statsOpen.value = true }, 150)
})

const SPORT_LABEL: Record<string, string> = {
  Swim: 'Piscine',
  OpenWaterSwim: 'Eau libre',
}

const maxDist = computed(() => Math.max(...(stats.value?.monthly.map(m => m.km) ?? [1]), 1))
const maxCount = computed(() => Math.max(...(stats.value?.by_sport_type.map(s => s.count) ?? [1]), 1))

function distBarHeight(km: number) { return `${(km / maxDist.value) * 100}%` }
function sportBarWidth(count: number) { return `${(count / maxCount.value) * 100}%` }

// Allure natation : min/100m
function formatPaceSwim(speedMs: number) {
  const secPer100m = 100 / speedMs
  const m = Math.floor(secPer100m / 60)
  const s = Math.round(secPer100m % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

function formatHours(seconds: number) {
  const h = Math.floor(seconds / 3600)
  return `${h.toLocaleString('fr-FR')}h`
}

function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}h${m.toString().padStart(2, '0')}` : `${m}min`
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatMonth(ym: string) {
  const [, m] = ym.split('-')
  const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']
  return months[parseInt(m) - 1] ?? ym
}
</script>

<style scoped>
.natation-page {
  padding-top: 8rem;
  max-width: 900px;
}

.back-link {
  color: var(--accent-light);
  text-decoration: none;
  font-size: 0.9rem;
  display: inline-block;
  margin-bottom: 1.5rem;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 1.05rem;
  margin-bottom: 2rem;
  max-width: 560px;
}

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
.stats-toggle-label { font-size: 0.92rem; font-weight: 600; }
.stats-toggle-chevron {
  font-size: 1.2rem;
  color: var(--text-dim);
  transition: transform 0.35s cubic-bezier(0.23, 1, 0.32, 1);
}
.stats-toggle-chevron.open { transform: rotate(90deg); }

.stats-body {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.5s cubic-bezier(0.23, 1, 0.32, 1), padding 0.3s ease;
  padding: 0 1.25rem;
}
.stats-body.open { max-height: 4000px; padding: 0 1.25rem 1.25rem; }

.stats-strip {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.6rem 1rem;
  min-width: 80px;
}

.stat-value {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text);
  line-height: 1.2;
}

.stat-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 0.2rem;
  white-space: nowrap;
}

.chart-section { }
.chart-title {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 0.4rem;
  height: 120px;
  padding-top: 1.5rem;
  position: relative;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
  gap: 0.25rem;
}

.bar-label-top {
  font-size: 0.6rem;
  color: var(--text-dim);
  height: 1rem;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
}

.bar-track {
  flex: 1;
  width: 100%;
  background: rgba(255,255,255,0.04);
  border-radius: 4px 4px 0 0;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 0.6s cubic-bezier(0.23, 1, 0.32, 1);
  min-height: 2px;
}

.dist-fill { background: linear-gradient(180deg, #06b6d4, #0891b2); }

.bar-label-bot {
  font-size: 0.6rem;
  color: var(--text-dim);
  white-space: nowrap;
}

.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 640px) {
  .two-cols { grid-template-columns: 1fr; }
}

.col-card {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1rem;
}

.col-title {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-muted);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.top-rides { display: flex; flex-direction: column; gap: 0.75rem; }

.top-ride {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.ride-rank {
  font-size: 0.85rem;
  font-weight: 700;
  color: #06b6d4;
  min-width: 1.2rem;
  padding-top: 0.1rem;
}

.ride-info { display: flex; flex-direction: column; gap: 0.15rem; }
.ride-name { font-size: 0.85rem; font-weight: 600; color: var(--text); }
.ride-meta { font-size: 0.75rem; color: var(--text-muted); }
.ride-date { font-size: 0.7rem; color: var(--text-dim); }

.sport-types { display: flex; flex-direction: column; gap: 0.6rem; }
.sport-row { display: flex; flex-direction: column; gap: 0.2rem; }
.sport-name { font-size: 0.82rem; font-weight: 600; color: var(--text); }

.sport-bar-track {
  height: 6px;
  background: rgba(255,255,255,0.06);
  border-radius: 3px;
  overflow: hidden;
}
.sport-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #06b6d4, #0891b2);
  border-radius: 3px;
  transition: width 0.5s ease;
}
.sport-meta { font-size: 0.72rem; color: var(--text-dim); }

.rides-section { margin-top: 0.5rem; }
.rides-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--text);
}

.rides-list { display: flex; flex-direction: column; gap: 0.75rem; }

.ride-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1rem 1.25rem;
  transition: border-color 0.2s;
}
.ride-card:hover { border-color: #06b6d4; }

.ride-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.ride-card-name { font-size: 0.95rem; font-weight: 600; color: var(--text); }
.ride-card-date { font-size: 0.75rem; color: var(--text-dim); white-space: nowrap; flex-shrink: 0; }

.ride-card-stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.ride-stat {
  font-size: 0.8rem;
  color: var(--text-muted);
  background: rgba(255,255,255,0.04);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 0.2rem 0.5rem;
}

.ride-card-tags { display: flex; gap: 0.35rem; flex-wrap: wrap; }

.ride-tag {
  font-size: 0.68rem;
  padding: 0.15rem 0.5rem;
  border-radius: 5px;
  font-weight: 500;
}
.ride-tag.type { background: rgba(6,182,212,0.1); color: #22d3ee; border: 1px solid rgba(6,182,212,0.2); }

.loading-state {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-dim);
  padding: 1.5rem 0;
  font-size: 0.9rem;
}

.loading-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid var(--border);
  border-top-color: #06b6d4;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { color: var(--text-dim); padding: 2rem 0; font-size: 0.9rem; }
</style>
