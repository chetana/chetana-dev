// Rate-limit global par IP sur les routes /api (ceinture-et-bretelles anti-bot / anti-abus de coût).
// Fenêtre glissante en mémoire (best-effort ; l'état se réinitialise au scale-to-zero).
const HITS = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX = 120 // 120 req/min/IP : large pour un humain, borne un bot

export default defineEventHandler((event) => {
  const path = event.path || ''
  if (!path.startsWith('/api/')) return // pages et assets non concernés

  // Seules les requêtes EXTERNES (via le proxy Scaleway) portent X-Forwarded-For.
  // Les appels internes (SSR $fetch) n'en ont pas → on les laisse passer librement.
  const xff = getRequestHeader(event, 'x-forwarded-for')
  if (!xff) return
  const ip = xff.split(',')[0].trim() || 'unknown'

  const now = Date.now()
  const arr = (HITS.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (arr.length >= MAX) {
    HITS.set(ip, arr)
    throw createError({ statusCode: 429, statusMessage: 'Trop de requêtes, réessaie dans un instant.' })
  }
  arr.push(now)
  HITS.set(ip, arr)

  // Nettoyage opportuniste pour borner la mémoire
  if (HITS.size > 3000) {
    HITS.forEach((v, k) => { if (!v.some((t) => now - t < WINDOW_MS)) HITS.delete(k) })
  }
})
