<template>
  <div class="section velo-page">
    <NuxtLink to="/passions" class="back-link">← Passions</NuxtLink>

    <div class="section-label">Passions</div>
    <h1 class="section-title">🚴 Vélo</h1>
    <p class="page-subtitle">Toutes mes sorties Strava — stats, tendances et performances.</p>

    <!-- ── Stats accordéon ── -->
    <div v-if="stats" class="profile-section">
      <button class="stats-toggle" @click="statsOpen = !statsOpen">
        <span class="stats-toggle-label">📊 Mes stats vélo</span>
        <span class="stats-toggle-chevron" :class="{ open: statsOpen }">›</span>
      </button>

      <div class="stats-body" :class="{ open: statsOpen }">

        <!-- Chips -->
        <div class="stats-strip">
          <div class="stat-item">
            <span class="stat-value">{{ Math.round(stats.total_km).toLocaleString('fr-FR') }}</span>
            <span class="stat-label">km total</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ Math.round(stats.total_elevation_m).toLocaleString('fr-FR') }}</span>
            <span class="stat-label">m D+ total</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.total_rides }}</span>
            <span class="stat-label">sorties</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ formatHours(stats.total_moving_time_s) }}</span>
            <span class="stat-label">en selle</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.average_km_per_ride.toFixed(1) }}</span>
            <span class="stat-label">km moy/sortie</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ Math.round(stats.best_ride_km) }}</span>
            <span class="stat-label">km record</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ Math.round(stats.best_elevation_m).toLocaleString('fr-FR') }}</span>
            <span class="stat-label">m D+ record</span>
          </div>
        </div>

        <!-- Km par mois -->
        <div v-if="stats.monthly.length" class="chart-section">
          <div class="chart-title">📅 Km par mois (12 derniers mois)</div>
          <div class="bar-chart">
            <div v-for="m in stats.monthly" :key="m.month" class="bar-col">
              <div class="bar-label-top">{{ Math.round(m.km) }}</div>
              <div class="bar-track">
                <div class="bar-fill km-fill" :style="{ height: kmBarHeight(m.km) }" />
              </div>
              <div class="bar-label-bot">{{ formatMonth(m.month) }}</div>
            </div>
          </div>
        </div>

        <!-- D+ par mois -->
        <div v-if="stats.monthly.length" class="chart-section">
          <div class="chart-title">⛰️ Dénivelé par mois (12 derniers mois)</div>
          <div class="bar-chart">
            <div v-for="m in stats.monthly" :key="m.month" class="bar-col">
              <div class="bar-label-top">{{ Math.round(m.elevation_m) }}</div>
              <div class="bar-track">
                <div class="bar-fill elev-fill" :style="{ height: elevBarHeight(m.elevation_m) }" />
              </div>
              <div class="bar-label-bot">{{ formatMonth(m.month) }}</div>
            </div>
          </div>
        </div>

        <!-- Deux colonnes : Top sorties + répartition -->
        <div class="two-cols">

          <!-- Top 5 sorties -->
          <div class="col-card">
            <div class="col-title">🏆 Top 5 sorties (distance)</div>
            <div class="top-rides">
              <div v-for="(r, i) in stats.top_rides" :key="r.id" class="top-ride">
                <span class="ride-rank">{{ i + 1 }}</span>
                <div class="ride-info">
                  <span class="ride-name">{{ r.name }}</span>
                  <span class="ride-meta">
                    {{ Math.round(r.distance_m / 1000) }} km
                    · {{ Math.round(r.elevation_gain_m) }} m D+
                    · {{ formatDuration(r.moving_time_s) }}
                    <span v-if="r.average_speed_ms"> · {{ (r.average_speed_ms * 3.6).toFixed(1) }} km/h</span>
                  </span>
                  <span class="ride-date">{{ formatDate(r.start_date) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Répartition types -->
          <div class="col-card">
            <div class="col-title">🚲 Types de sortie</div>
            <div class="sport-types">
              <div v-for="s in stats.by_sport_type" :key="s.sport_type" class="sport-row">
                <span class="sport-name">{{ SPORT_LABEL[s.sport_type] ?? s.sport_type }}</span>
                <div class="sport-bar-track">
                  <div class="sport-bar-fill" :style="{ width: sportBarWidth(s.count) }" />
                </div>
                <span class="sport-meta">{{ s.count }} sortie{{ s.count > 1 ? 's' : '' }} · {{ Math.round(s.km) }} km</span>
              </div>
            </div>
          </div>

        </div>
      </div><!-- /stats-body -->
    </div>

    <!-- Loading stats -->
    <div v-else-if="statsPending" class="loading-state">
      <div class="loading-spinner"></div>
      <span>Chargement des stats…</span>
    </div>

    <!-- ── Liste des sorties récentes ── -->
    <div class="rides-section">
      <h2 class="rides-title">Sorties récentes</h2>

      <div v-if="activitiesPending" class="loading-state">
        <div class="loading-spinner"></div>
        <span>Chargement…</span>
      </div>

      <div v-else-if="activities?.length" class="rides-list">
        <div v-for="a in displayed" :key="a.id" class="ride-card">
          <div class="ride-header">
            <span class="ride-card-name">{{ a.name }}</span>
            <span class="ride-card-date">{{ formatDate(a.start_date) }}</span>
          </div>
          <div class="ride-card-stats">
            <span class="ride-stat">📍 {{ (a.distance_m / 1000).toFixed(1) }} km</span>
            <span class="ride-stat">⛰️ {{ Math.round(a.elevation_gain_m) }} m</span>
            <span class="ride-stat">⏱️ {{ formatDuration(a.moving_time_s) }}</span>
            <span v-if="a.average_speed_ms" class="ride-stat">💨 {{ (a.average_speed_ms * 3.6).toFixed(1) }} km/h</span>
            <span v-if="a.average_heartrate" class="ride-stat">❤️ {{ Math.round(a.average_heartrate) }} bpm</span>
            <span v-if="a.average_watts" class="ride-stat">⚡ {{ Math.round(a.average_watts) }} W</span>
            <span v-if="a.pr_count" class="ride-stat pr">🏅 {{ a.pr_count }} PR{{ a.pr_count > 1 ? 's' : '' }}</span>
          </div>
          <div class="ride-card-tags">
            <span v-if="a.trainer" class="ride-tag trainer">Home trainer</span>
            <span v-if="a.commute" class="ride-tag commute">Trajet</span>
            <span class="ride-tag type">{{ SPORT_LABEL[a.sport_type] ?? a.sport_type }}</span>
          </div>
        </div>
      </div>

      <div v-if="hasMore" class="load-more">
        <button class="load-more-btn" @click="displayedCount += PAGE_SIZE">
          Voir plus <span class="load-more-count">({{ (activities?.length ?? 0) - displayedCount }} restantes)</span>
        </button>
      </div>

      <div v-else-if="!activities?.length" class="empty-state">
        <p>Aucune sortie enregistrée pour l'instant.</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
useHead({ title: 'Vélo — Chetana YIN' })

const API_BASE = 'https://chetaku-rs-267131866578.europe-west1.run.app'

// ── Types ──────────────────────────────────────────────────────────────────
interface MonthlyTotal { month: string; km: number; elevation_m: number; rides: number }
interface SportTypeStat { sport_type: string; count: number; km: number }
interface TopRide {
  id: number; name: string; start_date: string
  distance_m: number; elevation_gain_m: number; moving_time_s: number; average_speed_ms: number | null
}
interface CyclingStats {
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

// ── Data ───────────────────────────────────────────────────────────────────
const CYCLING_TYPES = ['Ride', 'VirtualRide', 'MountainBikeRide', 'GravelRide', 'EBikeRide', 'Velomobile']

const { data: stats, pending: statsPending } = useFetch<CyclingStats>(`${API_BASE}/strava/stats?sport=cycling`)
const { data: activities, pending: activitiesPending } = useFetch<Activity[]>(`${API_BASE}/strava/activities?sport=cycling`)

// ── Accordéon auto-ouverture ────────────────────────────────────────────────
const statsOpen = ref(false)
watch(stats, (val) => {
  if (val && !statsOpen.value) setTimeout(() => { statsOpen.value = true }, 150)
})

// ── Pagination front-end ────────────────────────────────────────────────────
const PAGE_SIZE = 20
const displayedCount = ref(PAGE_SIZE)
const displayed = computed(() => activities.value?.slice(0, displayedCount.value) ?? [])
const hasMore = computed(() => displayedCount.value < (activities.value?.length ?? 0))

// ── Labels ──────────────────────────────────────────────────────────────────
const SPORT_LABEL: Record<string, string> = {
  Ride: 'Route',
  VirtualRide: 'Home trainer',
  MountainBikeRide: 'VTT',
  GravelRide: 'Gravel',
  EBikeRide: 'Vélo électrique',
  Velomobile: 'Vélocar',
}

// ── Chart helpers ────────────────────────────────────────────────────────────
const maxKm = computed(() => Math.max(...(stats.value?.monthly.map(m => m.km) ?? [1]), 1))
const maxElev = computed(() => Math.max(...(stats.value?.monthly.map(m => m.elevation_m) ?? [1]), 1))
const maxCount = computed(() => Math.max(...(stats.value?.by_sport_type.map(s => s.count) ?? [1]), 1))

function kmBarHeight(km: number) { return `${(km / maxKm.value) * 100}%` }
function elevBarHeight(m: number) { return `${(m / maxElev.value) * 100}%` }
function sportBarWidth(count: number) { return `${(count / maxCount.value) * 100}%` }

// ── Format helpers ───────────────────────────────────────────────────────────
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
  const [y, m] = ym.split('-')
  const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']
  return months[parseInt(m) - 1] ?? ym
}
</script>

<style scoped>
.velo-page {
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

/* ── Profile accordéon ── */
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

/* ── Chips ── */
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

/* ── Bar charts ── */
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
  padding-top: 1.5rem; /* space for top labels */
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

.km-fill { background: var(--gradient); }
.elev-fill { background: linear-gradient(180deg, #10b981, #059669); }

.bar-label-bot {
  font-size: 0.6rem;
  color: var(--text-dim);
  white-space: nowrap;
}

/* ── Two columns ── */
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

/* ── Top rides ── */
.top-rides { display: flex; flex-direction: column; gap: 0.75rem; }

.top-ride {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.ride-rank {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--accent);
  min-width: 1.2rem;
  padding-top: 0.1rem;
}

.ride-info { display: flex; flex-direction: column; gap: 0.15rem; }
.ride-name { font-size: 0.85rem; font-weight: 600; color: var(--text); }
.ride-meta { font-size: 0.75rem; color: var(--text-muted); }
.ride-date { font-size: 0.7rem; color: var(--text-dim); }

/* ── Sport types ── */
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
  background: var(--gradient);
  border-radius: 3px;
  transition: width 0.5s ease;
}
.sport-meta { font-size: 0.72rem; color: var(--text-dim); }

/* ── Rides list ── */
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
.ride-card:hover { border-color: var(--accent); }

.ride-header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 0.5rem;
}

.ride-card-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text);
}

.ride-card-date {
  font-size: 0.75rem;
  color: var(--text-dim);
  white-space: nowrap;
  flex-shrink: 0;
}

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

.ride-stat.pr {
  background: rgba(196, 150, 60, 0.1);
  border-color: rgba(196, 150, 60, 0.3);
  color: var(--accent-light);
}

.ride-card-tags { display: flex; gap: 0.35rem; flex-wrap: wrap; }

.ride-tag {
  font-size: 0.68rem;
  padding: 0.15rem 0.5rem;
  border-radius: 5px;
  font-weight: 500;
}

.ride-tag.trainer { background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2); }
.ride-tag.commute { background: rgba(107,114,128,0.12); color: var(--text-dim); border: 1px solid var(--border); }
.ride-tag.type    { background: rgba(16,185,129,0.1);   color: #34d399;  border: 1px solid rgba(16,185,129,0.2); }

/* ── Loading / empty ── */
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
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.empty-state { color: var(--text-dim); padding: 2rem 0; font-size: 0.9rem; }

.load-more { display: flex; justify-content: center; padding: 1.5rem 0 0.5rem; }
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
.load-more-btn:hover { border-color: #3b82f6; color: var(--text); }
.load-more-count { color: var(--text-dim); }
</style>
