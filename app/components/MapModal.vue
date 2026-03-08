<template>
  <div class="map-overlay" @click.self="$emit('close')">
    <div class="map-container">
      <div class="map-header">
        <span class="map-title">{{ name }}</span>
        <button class="map-close" @click="$emit('close')">✕</button>
      </div>
      <div ref="mapEl" class="map-el" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { decodePolyline } from '~/utils/polyline'

const props = defineProps<{ polyline: string; name: string }>()
defineEmits<{ close: [] }>()

const mapEl = ref<HTMLElement | null>(null)
let leafletInstance: any = null

onMounted(async () => {
  if (!mapEl.value) return
  const L = (await import('leaflet')).default
  const coords = decodePolyline(props.polyline)
  if (!coords.length) return

  leafletInstance = L.map(mapEl.value, { zoomControl: true }).setView(coords[0], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(leafletInstance)

  const poly = L.polyline(coords, { color: '#c4963c', weight: 3, opacity: 0.9 }).addTo(leafletInstance)
  leafletInstance.fitBounds(poly.getBounds(), { padding: [20, 20] })
})

onUnmounted(() => {
  leafletInstance?.remove()
  leafletInstance = null
})
</script>

<style scoped>
.map-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
}

.map-container {
  width: 100%;
  max-width: 680px;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg, 12px);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.map-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  border-bottom: 1px solid var(--border);
  gap: 1rem;
}

.map-title {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.map-close {
  background: none;
  border: none;
  color: var(--text-dim);
  cursor: pointer;
  font-size: 1rem;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  flex-shrink: 0;
  transition: color 0.2s;
}
.map-close:hover { color: var(--text); }

.map-el {
  height: 420px;
  width: 100%;
}

@media (max-width: 640px) {
  .map-el { height: 260px; }
}
</style>
