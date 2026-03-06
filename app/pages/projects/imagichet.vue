<template>
  <div class="section" style="padding-top: 8rem;">
    <NuxtLink to="/projects" class="back-link">← {{ t('nav.projects') }}</NuxtLink>
    <div class="section-label">{{ t('nav.projects') }}</div>
    <h1 class="section-title">ImagiChet</h1>

    <!-- Auth gate -->
    <div v-if="!isAuthenticated" class="auth-gate">
      <div class="auth-card">
        <div class="auth-icon">🎨</div>
        <h2>{{ locale === 'fr' ? 'Connectez-vous pour générer' : 'Sign in to generate' }}</h2>
        <p>{{ locale === 'fr'
          ? 'Créez des images avec Imagen 3 de Google — styles prédéfinis, galerie personnelle, sauvegarde automatique.'
          : 'Create images with Google\'s Imagen 3 — preset styles, personal gallery, automatic saving.' }}</p>
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

      <!-- Generator form -->
      <div class="generator-card">
        <div class="field">
          <label class="field-label">{{ locale === 'fr' ? 'Prompt' : 'Prompt' }}</label>
          <textarea
            v-model="prompt"
            class="text-input"
            :placeholder="locale === 'fr' ? 'Un chat roux sur les toits de Paris au coucher du soleil...' : 'A red cat on Paris rooftops at sunset...'"
            rows="3"
          />
        </div>

        <div class="field">
          <label class="field-label">Style</label>
          <div class="btn-group">
            <button
              v-for="s in STYLE_LABELS"
              :key="s"
              class="style-btn"
              :class="{ active: selectedStyle === s }"
              @click="selectedStyle = s"
            >{{ s || (locale === 'fr' ? 'Aucun' : 'None') }}</button>
          </div>
        </div>

        <div class="field">
          <label class="field-label">{{ locale === 'fr' ? 'Ratio' : 'Aspect ratio' }}</label>
          <div class="btn-group">
            <button
              v-for="r in RATIOS"
              :key="r"
              class="ratio-btn"
              :class="{ active: selectedRatio === r }"
              @click="selectedRatio = r"
            >{{ r }}</button>
          </div>
        </div>

        <div class="field">
          <button class="toggle-neg" @click="showNeg = !showNeg">
            {{ showNeg ? '▾' : '▸' }} {{ locale === 'fr' ? 'Prompt négatif (optionnel)' : 'Negative prompt (optional)' }}
          </button>
          <textarea
            v-if="showNeg"
            v-model="negativePrompt"
            class="text-input neg-input"
            :placeholder="locale === 'fr' ? 'Ex: flou, mauvaise qualité, texte...' : 'e.g. blurry, low quality, text...'"
            rows="2"
          />
        </div>

        <button class="btn-generate" :disabled="generating || !prompt.trim()" @click="generate">
          <span v-if="generating" class="spinner">⏳</span>
          <span v-else>✨</span>
          {{ generating
            ? (locale === 'fr' ? 'Génération en cours...' : 'Generating...')
            : (locale === 'fr' ? 'Générer' : 'Generate') }}
        </button>

        <p v-if="genError" class="error-msg">{{ genError }}</p>
      </div>

      <!-- Result -->
      <div v-if="lastResult" class="result-card">
        <img :src="`data:${lastResult.mimeType};base64,${lastResult.base64}`" class="result-img" :alt="prompt" />
        <div class="result-meta">
          <span class="result-style">{{ lastResult.entry.style || (locale === 'fr' ? 'Aucun style' : 'No style') }}</span>
          <span class="result-ratio">{{ lastResult.entry.aspectRatio }}</span>
          <button class="btn-delete-result" @click="deleteEntry(lastResult!.entry.id)">🗑️</button>
        </div>
      </div>

      <!-- Gallery -->
      <div class="gallery-header">
        <h3 class="gallery-title">
          🖼️ {{ locale === 'fr' ? 'Galerie' : 'Gallery' }}
          <span v-if="gallery.length" class="gallery-count">({{ gallery.length }})</span>
        </h3>
        <button v-if="!galleryLoaded" class="btn-load-gallery" @click="loadGallery">
          {{ locale === 'fr' ? 'Charger la galerie' : 'Load gallery' }}
        </button>
      </div>

      <div v-if="galleryLoading" class="gallery-loading">{{ locale === 'fr' ? 'Chargement...' : 'Loading...' }}</div>

      <div v-if="gallery.length" class="gallery-grid">
        <div v-for="entry in gallery" :key="entry.id" class="gallery-card">
          <div class="gallery-img-wrap" @click="openModal(entry)">
            <img
              v-if="signedUrls[entry.id]"
              :src="signedUrls[entry.id]"
              :alt="entry.prompt"
              class="gallery-img"
              loading="lazy"
            />
            <div v-else class="gallery-img-placeholder">⏳</div>
          </div>
          <div class="gallery-card-meta">
            <span class="gallery-prompt">{{ entry.prompt.length > 60 ? entry.prompt.slice(0, 60) + '…' : entry.prompt }}</span>
            <div class="gallery-card-row">
              <span v-if="entry.style" class="gallery-style-badge">{{ entry.style }}</span>
              <span class="gallery-date">{{ formatDate(entry.ts) }}</span>
              <button class="btn-delete-small" @click.stop="deleteEntry(entry.id)">🗑️</button>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="galleryLoaded && !galleryLoading" class="gallery-empty">
        {{ locale === 'fr' ? 'Aucune image générée pour l\'instant.' : 'No images generated yet.' }}
      </div>

      <!-- Modal -->
      <div v-if="modalEntry" class="modal-overlay" @click.self="modalEntry = null">
        <div class="modal-content">
          <button class="modal-close" @click="modalEntry = null">✕</button>
          <img
            v-if="signedUrls[modalEntry.id]"
            :src="signedUrls[modalEntry.id]"
            :alt="modalEntry.prompt"
            class="modal-img"
          />
          <div class="modal-meta">
            <p class="modal-prompt">{{ modalEntry.prompt }}</p>
            <div class="modal-tags">
              <span v-if="modalEntry.style" class="gallery-style-badge">{{ modalEntry.style }}</span>
              <span class="result-ratio">{{ modalEntry.aspectRatio }}</span>
              <span class="gallery-date">{{ formatDate(modalEntry.ts) }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const { locale, t } = useLocale()
const { isAuthenticated, userName, signOut, getAuthHeaders, handleUnauthorized, loadFromStorage, initGIS } = useGoogleAuth()

// ─── Generator state ────────────────────────────────────────────────────────

const STYLE_LABELS = ['', 'Aquarelle', 'Cinématique', 'Manga', 'Illustration', 'Photo réaliste']
const RATIOS = ['1:1', '16:9', '9:16']

const prompt = ref('')
const selectedStyle = ref('')
const selectedRatio = ref('1:1')
const negativePrompt = ref('')
const showNeg = ref(false)
const generating = ref(false)
const genError = ref('')
const lastResult = ref<{ base64: string; mimeType: string; entry: GalleryEntry } | null>(null)

interface GalleryEntry {
  id: string
  ts: string
  author: string
  prompt: string
  style: string
  aspectRatio: string
  path: string
}

const gallery = ref<GalleryEntry[]>([])
const signedUrls = ref<Record<string, string>>({})
const galleryLoaded = ref(false)
const galleryLoading = ref(false)
const modalEntry = ref<GalleryEntry | null>(null)

async function generate() {
  if (!prompt.value.trim() || generating.value) return
  generating.value = true
  genError.value = ''
  lastResult.value = null

  try {
    const data = await $fetch<{ id: string; base64: string; mimeType: string; entry: GalleryEntry }>('/api/imagenie/generate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: {
        prompt: prompt.value.trim(),
        style: selectedStyle.value,
        aspectRatio: selectedRatio.value,
        negativePrompt: negativePrompt.value.trim() || undefined,
      },
    })
    lastResult.value = data
    // Prepend to gallery
    gallery.value.unshift(data.entry)
    if (galleryLoaded.value) {
      // Signed URL not needed for just-generated image (base64 available)
      signedUrls.value[data.id] = `data:${data.mimeType};base64,${data.base64}`
    }
  } catch (err: any) {
    if (err?.statusCode === 401) { handleUnauthorized(); return }
    genError.value = locale.value === 'fr'
      ? `Erreur : ${err?.statusMessage ?? 'génération échouée'}`
      : `Error: ${err?.statusMessage ?? 'generation failed'}`
  } finally {
    generating.value = false
  }
}

async function loadGallery() {
  galleryLoading.value = true
  galleryLoaded.value = true
  try {
    const data = await $fetch<GalleryEntry[]>('/api/imagenie/gallery', {
      headers: getAuthHeaders(),
    })
    gallery.value = data
    // Load signed URLs
    await Promise.all(data.map(entry => loadSignedUrl(entry)))
  } catch (err: any) {
    if (err?.statusCode === 401) handleUnauthorized()
  } finally {
    galleryLoading.value = false
  }
}

async function loadSignedUrl(entry: GalleryEntry) {
  if (signedUrls.value[entry.id]) return
  try {
    const data = await $fetch<{ url: string }>(`/api/imagenie/image?path=${encodeURIComponent(entry.path)}`, {
      headers: getAuthHeaders(),
    })
    signedUrls.value[entry.id] = data.url
  } catch {
    // skip
  }
}

async function deleteEntry(id: string) {
  try {
    await $fetch('/api/imagenie/delete', {
      method: 'DELETE',
      headers: getAuthHeaders(),
      body: { id },
    })
    gallery.value = gallery.value.filter(e => e.id !== id)
    delete signedUrls.value[id]
    if (lastResult.value?.entry.id === id) lastResult.value = null
    if (modalEntry.value?.id === id) modalEntry.value = null
  } catch (err: any) {
    if (err?.statusCode === 401) handleUnauthorized()
  }
}

function openModal(entry: GalleryEntry) {
  modalEntry.value = entry
}

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString(locale.value === 'fr' ? 'fr-FR' : 'en-US', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

// ─── Auth + init ─────────────────────────────────────────────────────────────

const googleBtnRef = ref<HTMLElement | null>(null)

onMounted(async () => {
  loadFromStorage()

  await new Promise<void>((resolve) => {
    if ((window as any).google?.accounts?.id) { resolve(); return }
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.onload = () => resolve()
    document.head.appendChild(script)
  })

  if (isAuthenticated.value) {
    await loadGallery()
  } else {
    await nextTick()
    initGIS(googleBtnRef.value)
  }

  watch(isAuthenticated, async (val) => {
    if (val) await loadGallery()
  })
})

useSeoMeta({
  title: 'ImagiChet — Générateur d\'images Imagen 3 — Chetana YIN',
  description: 'Générateur d\'images personnel propulsé par Imagen 3 de Google via Vertex AI. Styles prédéfinis, galerie GCS, suppression.',
  robots: 'noindex',
})
</script>

<style scoped>
.back-link { color: var(--accent-light); text-decoration: none; font-size: 0.9rem; display: inline-block; margin-bottom: 1rem; }

/* Auth gate */
.auth-gate { display: flex; justify-content: center; padding: 2rem 0; }
.auth-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 2.5rem; text-align: center; max-width: 480px; width: 100%; }
.auth-icon { font-size: 3rem; margin-bottom: 1rem; }
.auth-card h2 { font-size: 1.3rem; margin-bottom: 0.75rem; }
.auth-card p { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.6; }
.google-btn-container { display: flex; justify-content: center; }

/* User row */
.user-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem; }
.user-name { color: var(--text-muted); font-size: 0.9rem; }
.btn-signout { background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; }
.btn-signout:hover { border-color: var(--text-muted); }

/* Generator */
.generator-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 16px; padding: 1.5rem; max-width: 640px; margin-bottom: 2rem; }
.field { margin-bottom: 1.2rem; }
.field-label { display: block; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.text-input { width: 100%; background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 0.75rem; color: var(--text); font-family: inherit; font-size: 0.95rem; resize: vertical; box-sizing: border-box; }
.text-input:focus { outline: none; border-color: var(--accent-light); }
.neg-input { margin-top: 0.5rem; }

.btn-group { display: flex; flex-wrap: wrap; gap: 6px; }
.style-btn, .ratio-btn { background: var(--bg); border: 1px solid var(--border); color: var(--text-muted); padding: 6px 12px; border-radius: 20px; cursor: pointer; font-size: 0.85rem; transition: all 0.15s; }
.style-btn:hover, .ratio-btn:hover { border-color: var(--accent-light); color: var(--text); }
.style-btn.active, .ratio-btn.active { background: var(--accent-light); border-color: var(--accent-light); color: #000; font-weight: 600; }

.toggle-neg { background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.85rem; padding: 0; margin-bottom: 0; }
.toggle-neg:hover { color: var(--text); }

.btn-generate { width: 100%; padding: 0.85rem; background: var(--accent-light); color: #000; border: none; border-radius: 10px; font-size: 1rem; font-weight: 700; cursor: pointer; transition: opacity 0.15s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
.btn-generate:hover:not(:disabled) { opacity: 0.85; }
.btn-generate:disabled { opacity: 0.5; cursor: not-allowed; }

.error-msg { color: #ff6b6b; font-size: 0.875rem; margin-top: 0.75rem; }

/* Result */
.result-card { max-width: 640px; margin-bottom: 2rem; }
.result-img { width: 100%; border-radius: 12px; display: block; }
.result-meta { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.75rem; }
.result-style { background: var(--card-bg); border: 1px solid var(--border); padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; color: var(--text-muted); }
.result-ratio { background: var(--card-bg); border: 1px solid var(--border); padding: 3px 8px; border-radius: 12px; font-size: 0.8rem; color: var(--text-muted); }
.btn-delete-result { background: none; border: none; cursor: pointer; font-size: 1rem; margin-left: auto; opacity: 0.6; }
.btn-delete-result:hover { opacity: 1; }

/* Gallery */
.gallery-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem; }
.gallery-title { font-size: 1.2rem; font-weight: 600; margin: 0; }
.gallery-count { color: var(--text-muted); font-weight: 400; font-size: 1rem; }
.btn-load-gallery { background: var(--card-bg); border: 1px solid var(--border); color: var(--text-muted); padding: 6px 14px; border-radius: 8px; cursor: pointer; font-size: 0.85rem; }
.btn-load-gallery:hover { border-color: var(--accent-light); }
.gallery-loading { color: var(--text-muted); padding: 1rem 0; }
.gallery-empty { color: var(--text-dim); padding: 2rem; text-align: center; }

.gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 3rem; }
.gallery-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
.gallery-img-wrap { aspect-ratio: 1; overflow: hidden; cursor: pointer; background: var(--bg); }
.gallery-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.2s; }
.gallery-img-wrap:hover .gallery-img { transform: scale(1.03); }
.gallery-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.gallery-card-meta { padding: 0.75rem; }
.gallery-prompt { display: block; font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.4rem; line-height: 1.4; }
.gallery-card-row { display: flex; align-items: center; gap: 0.5rem; }
.gallery-style-badge { background: var(--bg); border: 1px solid var(--border); padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; color: var(--text-muted); }
.gallery-date { font-size: 0.75rem; color: var(--text-dim); margin-left: auto; }
.btn-delete-small { background: none; border: none; cursor: pointer; font-size: 0.9rem; opacity: 0.5; padding: 0; }
.btn-delete-small:hover { opacity: 1; }

/* Modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; }
.modal-content { background: var(--card-bg); border-radius: 16px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; }
.modal-close { position: absolute; top: 1rem; right: 1rem; background: var(--bg); border: 1px solid var(--border); color: var(--text); width: 32px; height: 32px; border-radius: 50%; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; z-index: 1; }
.modal-img { width: 100%; border-radius: 16px 16px 0 0; display: block; }
.modal-meta { padding: 1rem 1.25rem; }
.modal-prompt { font-size: 0.95rem; color: var(--text-muted); margin-bottom: 0.75rem; }
.modal-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }

@media (max-width: 768px) {
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .generator-card { padding: 1rem; }
}
</style>
