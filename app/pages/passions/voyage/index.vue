<template>
  <div class="section voyage-page">
    <NuxtLink to="/passions" class="back-link">← Passions</NuxtLink>

    <div class="section-label">Passions</div>
    <h1 class="section-title">✈️ Voyage</h1>
    <p class="page-subtitle">Les pays visités avec Lys — cartes, stats et souvenirs.</p>

    <!-- ── Stats band ── -->
    <div v-if="stats" class="stats-band">
      <div class="stat-item">
        <span class="stat-value">{{ stats.total_countries }}</span>
        <span class="stat-label">pays visités</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.continents.length }}</span>
        <span class="stat-label">continents</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.total_km.toLocaleString('fr-FR') }}</span>
        <span class="stat-label">km parcourus</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ stats.total_trips }}</span>
        <span class="stat-label">voyages</span>
      </div>
    </div>

    <!-- ── Carte monde ── -->
    <ClientOnly>
      <div ref="mapEl" class="world-map" />
    </ClientOnly>

    <!-- ── Liste des voyages ── -->
    <div v-if="trips && trips.length" class="trips-list">
      <h2 class="list-title">Tous les voyages</h2>
      <div v-for="trip in trips" :key="trip.id" class="trip-card">
        <div v-if="coverUrls[trip.id]" class="trip-cover">
          <img :src="coverUrls[trip.id]" :alt="trip.title" loading="lazy">
        </div>
        <div class="trip-cover-placeholder" v-else>
          <span class="trip-flag">{{ countryFlag(trip.country_code) }}</span>
        </div>
        <div class="trip-body">
          <div class="trip-header">
            <h3 class="trip-title">{{ trip.title }}</h3>
            <span class="trip-dates">{{ formatDate(trip.date_start) }} → {{ formatDate(trip.date_end) }}</span>
          </div>
          <div class="trip-meta">
            <span class="trip-location">{{ trip.country_name }} · {{ trip.continent }}</span>
            <span class="trip-km">{{ trip.distance_km.toLocaleString('fr-FR') }} km</span>
          </div>
          <p v-if="trip.notes" class="trip-notes">{{ trip.notes }}</p>
        </div>
      </div>
    </div>

    <div v-else-if="trips && trips.length === 0" class="empty-state">
      Pas encore de voyages enregistrés.
    </div>
  </div>
</template>

<script setup lang="ts">
const API_BASE = 'https://chetaku-rs-267131866578.europe-west1.run.app'

interface YearCount { year: number; trips: number }
interface VoyageStats {
  total_trips: number
  total_countries: number
  total_km: number
  continents: string[]
  by_year: YearCount[]
}
interface Voyage {
  id: number
  title: string
  country_code: string
  country_name: string
  continent: string
  date_start: string
  date_end: string
  lat: number
  lng: number
  distance_km: number
  cover_gcs_path: string | null
  notes: string | null
  created_at: string
}

useHead({ title: 'Voyage — Chetana YIN' })

const { data: trips } = await useFetch<Voyage[]>(`${API_BASE}/voyage`)
const { data: stats } = await useFetch<VoyageStats>(`${API_BASE}/voyage/stats`)

// ── Signed cover URLs ────────────────────────────────────────────────
const coverUrls = ref<Record<number, string>>({})

watch(trips, async (list) => {
  for (const t of list ?? []) {
    if (t.cover_gcs_path && !coverUrls.value[t.id]) {
      try {
        const res = await $fetch<{ url: string }>(`/api/voyage/cover?path=${encodeURIComponent(t.cover_gcs_path)}`)
        coverUrls.value[t.id] = res.url
      } catch { /* ignore */ }
    }
  }
}, { immediate: true })

// ── World map ────────────────────────────────────────────────────────
const mapEl = ref<HTMLElement | null>(null)
let map: any = null

onMounted(async () => {
  if (!mapEl.value) return

  const L = (await import('leaflet')).default
  const geoData = await fetch('/countries.geojson').then(r => r.json())
  const visitedCodes = new Set(trips.value?.map(t => t.country_code) ?? [])

  map = L.map(mapEl.value, {
    zoomControl: false,
    scrollWheelZoom: false,
    attributionControl: false,
    dragging: true,
    doubleClickZoom: false,
  }).setView([20, 10], 2)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png', {
    maxZoom: 6,
    subdomains: 'abcd',
  }).addTo(map)

  L.geoJSON(geoData, {
    style: (f: any) => visitedCodes.has(f?.properties?.ISO_A2)
      ? { fillColor: '#10b981', fillOpacity: 0.45, color: '#10b981', weight: 1 }
      : { fillColor: '#ffffff', fillOpacity: 0.04, color: '#ffffff', weight: 0.3 },
    onEachFeature: (f: any, layer: any) => {
      if (visitedCodes.has(f?.properties?.ISO_A2)) {
        layer.bindTooltip(f.properties.ADMIN || f.properties.ISO_A2, {
          sticky: true,
          className: 'map-tooltip',
        })
      }
    },
  }).addTo(map)

  // Markers for each trip
  if (trips.value) {
    for (const t of trips.value) {
      const marker = L.circleMarker([t.lat, t.lng], {
        radius: 5,
        fillColor: '#10b981',
        color: '#fff',
        weight: 1.5,
        fillOpacity: 0.9,
      }).addTo(map)
      marker.bindTooltip(t.title, { className: 'map-tooltip' })
    }
  }
})

onUnmounted(() => map?.remove())

// ── Helpers ──────────────────────────────────────────────────────────
function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
}

function countryFlag(code: string) {
  // Convert ISO 3166-1 alpha-2 to regional indicator emoji
  return [...code.toUpperCase()].map(c => String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))).join('')
}
</script>

<style scoped>
.voyage-page { padding-top: 8rem; max-width: 860px; }

.page-subtitle {
  color: var(--text-muted);
  font-size: 1.05rem;
  margin-bottom: 2rem;
  max-width: 560px;
}

/* ── Stats band ──────────────────────────────────────────────────── */
.stats-band {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin-bottom: 2rem;
}

.stat-item {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0.9rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 100px;
}

.stat-value {
  font-size: 1.6rem;
  font-weight: 700;
  letter-spacing: -0.03em;
  color: #10b981;
  line-height: 1;
}

.stat-label {
  font-size: 0.72rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  font-weight: 500;
}

/* ── World map ───────────────────────────────────────────────────── */
.world-map {
  width: 100%;
  height: 340px;
  border-radius: 14px;
  border: 1px solid var(--border);
  overflow: hidden;
  margin-bottom: 3rem;
  background: #09090b;
}

/* ── Trip list ───────────────────────────────────────────────────── */
.list-title {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1.25rem;
  color: var(--text);
}

.trips-list { display: flex; flex-direction: column; gap: 1rem; }

.trip-card {
  display: flex;
  gap: 1.25rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.trip-card:hover {
  border-color: rgba(16, 185, 129, 0.4);
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.08);
}

.trip-cover {
  width: 160px;
  flex-shrink: 0;
}

.trip-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.trip-cover-placeholder {
  width: 120px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(16, 185, 129, 0.05);
  border-right: 1px solid var(--border);
}

.trip-flag {
  font-size: 2.5rem;
  line-height: 1;
}

.trip-body {
  flex: 1;
  padding: 1.1rem 1.25rem 1.1rem 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.trip-header {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.trip-title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text);
  margin: 0;
}

.trip-dates {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.trip-meta {
  display: flex;
  gap: 0.75rem;
  font-size: 0.82rem;
  color: var(--text-dim);
  flex-wrap: wrap;
}

.trip-km {
  color: #10b981;
  font-weight: 600;
}

.trip-notes {
  font-size: 0.83rem;
  color: var(--text-muted);
  line-height: 1.55;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* ── Empty state ─────────────────────────────────────────────────── */
.empty-state {
  color: var(--text-dim);
  font-size: 0.9rem;
  padding: 2rem 0;
}

/* ── Leaflet tooltip ─────────────────────────────────────────────── */
:global(.map-tooltip) {
  background: #18181b !important;
  border: 1px solid #27272a !important;
  color: #e5e5e5 !important;
  border-radius: 6px !important;
  font-size: 0.78rem !important;
  padding: 0.3rem 0.6rem !important;
  box-shadow: none !important;
}
:global(.map-tooltip::before) { display: none !important; }

/* ── Mobile ──────────────────────────────────────────────────────── */
@media (max-width: 640px) {
  .world-map { height: 220px; }

  .trip-cover { width: 100px; }
  .trip-cover-placeholder { width: 80px; }
  .trip-flag { font-size: 1.8rem; }

  .stats-band { gap: 0.5rem; }
  .stat-item { padding: 0.7rem 1rem; min-width: 80px; }
  .stat-value { font-size: 1.3rem; }
}
</style>
