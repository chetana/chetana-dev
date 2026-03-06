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

      <!-- Mode tabs -->
      <div class="mode-tabs">
        <button class="mode-tab" :class="{ active: activeMode === 'generate' }" @click="activeMode = 'generate'">
          ✨ {{ locale === 'fr' ? 'Génération' : 'Generate' }}
        </button>
        <button class="mode-tab" :class="{ active: activeMode === 'bgswap' }" @click="activeMode = 'bgswap'">
          🔄 BGSWAP
        </button>
        <button class="mode-tab" :class="{ active: activeMode === 'outpaint' }" @click="activeMode = 'outpaint'">
          ↔️ Outpaint
        </button>
        <button class="mode-tab" :class="{ active: activeMode === 'inpaint' }" @click="activeMode = 'inpaint'">
          🖌️ Inpainting
        </button>
      </div>

      <!-- Forms (animated tab switch) -->
      <Transition name="tab" mode="out-in">
      <div :key="activeMode" class="tab-panel">

      <!-- Generator form -->
      <div v-if="activeMode === 'generate'" class="generator-card">
        <p class="mode-desc">{{ locale === 'fr'
          ? 'Génère une image originale à partir d\'un prompt. Choisis un style et un ratio.'
          : 'Generate an original image from a text prompt. Choose a style and aspect ratio.' }}</p>

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

      <!-- BGSWAP form -->
      <div v-else-if="activeMode === 'bgswap'" class="generator-card">
        <p class="mode-desc">{{ locale === 'fr'
          ? 'Remplace le fond d\'une photo en gardant le sujet intact. Upload ta photo, décris ou choisis un nouveau fond.'
          : 'Replace the background of a photo while keeping the subject. Upload your photo, then describe or pick a new background.' }}</p>

        <div class="field">
          <label class="field-label">{{ locale === 'fr' ? 'Photo sujet' : 'Subject photo' }}</label>
          <div
            class="upload-zone"
            :class="{ 'has-image': subjectPreviewUrl }"
            @click="subjectInputRef?.click()"
            @dragover.prevent
            @drop.prevent="(e) => onDropFile(e, 'bgswap')"
          >
            <img v-if="subjectPreviewUrl" :src="subjectPreviewUrl" class="upload-preview" alt="subject" />
            <div v-else class="upload-placeholder">
              <span class="upload-icon">📷</span>
              <span>{{ locale === 'fr' ? 'Cliquer ou glisser une image' : 'Click or drag an image' }}</span>
            </div>
          </div>
          <input ref="subjectInputRef" type="file" accept="image/*" style="display:none" @change="(e) => onFileInput(e, 'bgswap')" />
        </div>

        <div class="field">
          <label class="field-label">{{ locale === 'fr' ? 'Fond (preset)' : 'Background (preset)' }}</label>
          <div class="btn-group">
            <button
              v-for="bg in BG_PRESETS"
              :key="bg.label"
              class="style-btn"
              :class="{ active: selectedBgPreset === bg.label }"
              @click="selectBgPreset(bg)"
            >{{ bg.label }}</button>
          </div>
        </div>

        <div class="field">
          <label class="field-label">{{ locale === 'fr' ? 'Ou décrire le fond' : 'Or describe the background' }}</label>
          <textarea
            v-model="bgPrompt"
            class="text-input"
            :placeholder="locale === 'fr' ? 'Ex: une plage tropicale au coucher du soleil...' : 'e.g. a tropical beach at sunset...'"
            rows="2"
            @input="selectedBgPreset = ''"
          />
        </div>

        <button class="btn-generate" :disabled="generating || !subjectBase64 || !bgPrompt.trim()" @click="bgswap">
          <span v-if="generating" class="spinner">⏳</span>
          <span v-else>🔄</span>
          {{ generating
            ? (locale === 'fr' ? 'Traitement en cours...' : 'Processing...')
            : (locale === 'fr' ? 'Changer le fond' : 'Swap background') }}
        </button>

        <p v-if="genError" class="error-msg">{{ genError }}</p>
      </div>

      <!-- OUTPAINT form -->
      <div v-else-if="activeMode === 'outpaint'" class="generator-card">
        <p class="mode-desc">{{ locale === 'fr'
          ? 'Étend une image au-delà de ses bords vers un ratio cible. L\'IA génère le contenu manquant de façon cohérente.'
          : 'Extend an image beyond its borders toward a target aspect ratio. The AI generates the missing content seamlessly.' }}</p>

        <div class="field">
          <label class="field-label">{{ locale === 'fr' ? 'Image source' : 'Source image' }}</label>
          <div
            class="upload-zone"
            :class="{ 'has-image': outpaintPreviewUrl }"
            @click="outpaintInputRef?.click()"
            @dragover.prevent
            @drop.prevent="(e) => onDropFile(e, 'outpaint')"
          >
            <img v-if="outpaintPreviewUrl" :src="outpaintPreviewUrl" class="upload-preview" alt="source" />
            <div v-else class="upload-placeholder">
              <span class="upload-icon">📷</span>
              <span>{{ locale === 'fr' ? 'Cliquer ou glisser une image' : 'Click or drag an image' }}</span>
            </div>
          </div>
          <input ref="outpaintInputRef" type="file" accept="image/*" style="display:none" @change="(e) => onFileInput(e, 'outpaint')" />
        </div>

        <div class="field">
          <label class="field-label">{{ locale === 'fr' ? 'Ratio cible' : 'Target ratio' }}</label>
          <div class="btn-group">
            <button
              v-for="r in RATIOS_FULL"
              :key="r"
              class="ratio-btn"
              :class="{ active: outpaintTargetRatio === r }"
              @click="outpaintTargetRatio = r"
            >{{ r }}</button>
          </div>
        </div>

        <div class="field">
          <label class="field-label">{{ locale === 'fr' ? 'Position de l\'image originale' : 'Original image position' }}</label>
          <div class="btn-group">
            <button
              v-for="pos in OUTPAINT_POSITIONS"
              :key="pos"
              class="style-btn"
              :class="{ active: outpaintPosition === pos }"
              @click="outpaintPosition = pos"
            >{{ pos }}</button>
          </div>
        </div>

        <div class="field">
          <label class="field-label">{{ locale === 'fr' ? 'Prompt (optionnel)' : 'Prompt (optional)' }}</label>
          <textarea
            v-model="outpaintPrompt"
            class="text-input"
            :placeholder="locale === 'fr' ? 'Ex: ciel dégagé, paysage verdoyant...' : 'e.g. clear sky, green landscape...'"
            rows="2"
          />
        </div>

        <button class="btn-generate" :disabled="generating || !outpaintBase64" @click="outpaint">
          <span v-if="generating" class="spinner">⏳</span>
          <span v-else>↔️</span>
          {{ generating
            ? (locale === 'fr' ? 'Extension en cours...' : 'Extending...')
            : (locale === 'fr' ? 'Étendre' : 'Extend') }}
        </button>

        <p v-if="genError" class="error-msg">{{ genError }}</p>
      </div>

      <!-- INPAINTING form -->
      <div v-else class="generator-card">
        <p class="mode-desc">{{ locale === 'fr'
          ? 'Peins une zone sur l\'image pour l\'effacer ou y insérer un élément. Sans prompt → suppression. Avec prompt → insertion.'
          : 'Paint a zone on the image to remove or insert something. No prompt → removal. With prompt → insertion.' }}</p>

        <div class="field">
          <label class="field-label">{{ locale === 'fr' ? 'Image' : 'Image' }}</label>
          <div v-if="!inpaintBase64"
            class="upload-zone"
            @click="inpaintInputRef?.click()"
            @dragover.prevent
            @drop.prevent="(e) => onDropFile(e, 'inpaint')"
          >
            <div class="upload-placeholder">
              <span class="upload-icon">📷</span>
              <span>{{ locale === 'fr' ? 'Cliquer ou glisser une image' : 'Click or drag an image' }}</span>
            </div>
          </div>
          <div v-else class="inpaint-canvas-wrap" ref="inpaintWrapRef">
            <img :src="inpaintPreviewUrl" class="inpaint-img" alt="inpaint source" />
            <canvas
              ref="inpaintCanvasRef"
              class="inpaint-canvas"
              @mousedown="onCanvasMouseDown"
              @mousemove="onCanvasMouseMove"
              @mouseup="onCanvasMouseUp"
              @mouseleave="onCanvasMouseUp"
              @touchstart.prevent="onCanvasTouchStart"
              @touchmove.prevent="onCanvasTouchMove"
              @touchend="onCanvasMouseUp"
            />
          </div>
          <input ref="inpaintInputRef" type="file" accept="image/*" style="display:none" @change="(e) => onFileInput(e, 'inpaint')" />
          <button v-if="inpaintBase64" class="btn-change-img" @click="inpaintInputRef?.click()">
            {{ locale === 'fr' ? '↺ Changer l\'image' : '↺ Change image' }}
          </button>
        </div>

        <div v-if="inpaintBase64" class="field">
          <label class="field-label">{{ locale === 'fr' ? 'Pinceau' : 'Brush' }}</label>
          <div class="brush-controls">
            <span class="brush-label">{{ locale === 'fr' ? 'Taille' : 'Size' }}: {{ inpaintBrushSize }}px</span>
            <input type="range" v-model.number="inpaintBrushSize" min="10" max="80" step="5" class="brush-slider" />
            <button class="btn-undo" :disabled="inpaintUndoStack.length === 0" @click="undoMask">
              ↩ {{ locale === 'fr' ? 'Annuler' : 'Undo' }}
            </button>
            <button class="btn-clear-mask" @click="clearMask">
              🗑️ {{ locale === 'fr' ? 'Effacer' : 'Clear' }}
            </button>
          </div>
        </div>

        <div class="field">
          <label class="field-label">
            {{ locale === 'fr' ? 'Prompt' : 'Prompt' }}
            <span class="field-hint">{{ locale === 'fr' ? '(vide = supprimer, rempli = insérer)' : '(empty = remove, filled = insert)' }}</span>
          </label>
          <textarea
            v-model="inpaintPrompt"
            class="text-input"
            :placeholder="locale === 'fr' ? 'Ex: un chapeau de cowboy rouge (laisser vide pour supprimer)' : 'e.g. a red cowboy hat (leave empty to remove)'"
            rows="2"
          />
        </div>

        <button class="btn-generate" :disabled="generating || !inpaintBase64" @click="inpaint">
          <span v-if="generating" class="spinner">⏳</span>
          <span v-else>🖌️</span>
          {{ generating
            ? (locale === 'fr' ? 'Traitement en cours...' : 'Processing...')
            : (locale === 'fr' ? 'Appliquer' : 'Apply') }}
        </button>

        <p v-if="genError" class="error-msg">{{ genError }}</p>
      </div>

      </div><!-- /tab-panel -->
      </Transition>

      <!-- Result -->
      <Transition name="result">
      <div v-if="lastResult" class="result-card">
        <img :src="`data:${lastResult.mimeType};base64,${lastResult.base64}`" class="result-img" :alt="lastResult.entry.prompt" />
        <div class="result-meta">
          <span v-if="lastResult.entry.mode === 'bgswap'" class="badge-bgswap">BGSWAP</span>
          <span v-else-if="lastResult.entry.mode === 'outpaint'" class="badge-outpaint">OUTPAINT</span>
          <span v-else-if="lastResult.entry.mode === 'inpaint'" class="badge-inpaint">INPAINT</span>
          <span v-else-if="lastResult.entry.style" class="result-style">{{ lastResult.entry.style }}</span>
          <span v-if="!lastResult.entry.mode || lastResult.entry.mode === 'generate'" class="result-ratio">{{ lastResult.entry.aspectRatio }}</span>
          <button class="btn-delete-result" @click="deleteEntry(lastResult!.entry.id)">🗑️</button>
        </div>
      </div>
      </Transition>

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
              <span v-if="entry.mode === 'bgswap'" class="badge-bgswap badge-sm">BGSWAP</span>
              <span v-else-if="entry.mode === 'outpaint'" class="badge-outpaint badge-sm">OUTPAINT</span>
              <span v-else-if="entry.mode === 'inpaint'" class="badge-inpaint badge-sm">INPAINT</span>
              <span v-else-if="entry.style" class="gallery-style-badge">{{ entry.style }}</span>
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
              <span v-if="modalEntry.mode === 'bgswap'" class="badge-bgswap">BGSWAP</span>
              <span v-else-if="modalEntry.mode === 'outpaint'" class="badge-outpaint">OUTPAINT</span>
              <span v-else-if="modalEntry.mode === 'inpaint'" class="badge-inpaint">INPAINT</span>
              <span v-else-if="modalEntry.style" class="gallery-style-badge">{{ modalEntry.style }}</span>
              <span v-if="!modalEntry.mode || modalEntry.mode === 'generate'" class="result-ratio">{{ modalEntry.aspectRatio }}</span>
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

// ─── Mode ────────────────────────────────────────────────────────────────────

const activeMode = ref<'generate' | 'bgswap' | 'outpaint' | 'inpaint'>('generate')

// ─── Generator state ─────────────────────────────────────────────────────────

const STYLE_LABELS = ['', 'Aquarelle', 'Cinématique', 'Manga', 'Illustration', 'Photo réaliste']
const RATIOS = ['1:1', '16:9', '9:16']
const RATIOS_FULL = ['1:1', '16:9', '9:16', '4:3', '3:4']
const OUTPAINT_POSITIONS = ['Centre', 'Haut', 'Bas', 'Gauche', 'Droite']

const BG_PRESETS = [
  { label: 'Aucun', prompt: '' },
  { label: 'Plage', prompt: 'tropical beach at golden hour, turquoise water, palm trees' },
  { label: 'Forêt', prompt: 'lush green forest, soft sunlight through trees, moss ground' },
  { label: 'Ville nuit', prompt: 'city at night, bokeh lights, rain reflections on pavement' },
  { label: 'Studio', prompt: 'professional photo studio, white seamless background, soft lighting' },
  { label: 'Montagne', prompt: 'mountain landscape, dramatic clouds, snow peaks, golden hour' },
]

const prompt = ref('')
const selectedStyle = ref('')
const selectedRatio = ref('1:1')
const negativePrompt = ref('')
const showNeg = ref(false)

// BGSWAP state
const subjectInputRef = ref<HTMLInputElement | null>(null)
const subjectBase64 = ref('')
const subjectPreviewUrl = ref('')
const bgPrompt = ref('')
const selectedBgPreset = ref('')

// OUTPAINT state
const outpaintInputRef = ref<HTMLInputElement | null>(null)
const outpaintBase64 = ref('')
const outpaintPreviewUrl = ref('')
const outpaintTargetRatio = ref('16:9')
const outpaintPosition = ref('Centre')
const outpaintPrompt = ref('')

// INPAINTING state
const inpaintInputRef = ref<HTMLInputElement | null>(null)
const inpaintBase64 = ref('')
const inpaintPreviewUrl = ref('')
const inpaintCanvasRef = ref<HTMLCanvasElement | null>(null)
const inpaintWrapRef = ref<HTMLElement | null>(null)
const inpaintBrushSize = ref(30)
const inpaintUndoStack = ref<ImageData[]>([])
const inpaintPrompt = ref('')
const isDrawing = ref(false)
let lastInpaintPos = { x: 0, y: 0 }

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
  mode?: 'generate' | 'bgswap' | 'outpaint' | 'inpaint'
}

const gallery = ref<GalleryEntry[]>([])
const signedUrls = ref<Record<string, string>>({})
const galleryLoaded = ref(false)
const galleryLoading = ref(false)
const modalEntry = ref<GalleryEntry | null>(null)

// ─── File upload ──────────────────────────────────────────────────────────────

function loadImageFile(file: File, onReady: (base64: string, previewUrl: string) => void) {
  const reader = new FileReader()
  reader.onload = (ev) => {
    const dataUrl = ev.target?.result as string
    const img = new Image()
    img.onload = () => {
      const MAX = 1024
      let { width, height } = img
      if (width > MAX || height > MAX) {
        if (width > height) { height = Math.round(height * MAX / width); width = MAX }
        else { width = Math.round(width * MAX / height); height = MAX }
      }
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      canvas.getContext('2d')!.drawImage(img, 0, 0, width, height)
      onReady(canvas.toDataURL('image/jpeg', 0.85).split(',')[1] ?? '', dataUrl)
    }
    img.src = dataUrl
  }
  reader.readAsDataURL(file)
}

function onFileInput(e: Event, target: 'bgswap' | 'outpaint' | 'inpaint') {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) handleImageFile(file, target)
}

function onDropFile(e: DragEvent, target: 'bgswap' | 'outpaint' | 'inpaint') {
  const file = e.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) handleImageFile(file, target)
}

function handleImageFile(file: File, target: 'bgswap' | 'outpaint' | 'inpaint') {
  if (target === 'bgswap') {
    loadImageFile(file, (base64, previewUrl) => {
      subjectBase64.value = base64
      subjectPreviewUrl.value = previewUrl
    })
  } else if (target === 'outpaint') {
    loadImageFile(file, (base64, previewUrl) => {
      outpaintBase64.value = base64
      outpaintPreviewUrl.value = previewUrl
    })
  } else {
    loadImageFile(file, (base64, previewUrl) => {
      inpaintBase64.value = base64
      inpaintPreviewUrl.value = previewUrl
    })
  }
}

function selectBgPreset(bg: { label: string; prompt: string }) {
  selectedBgPreset.value = bg.label
  bgPrompt.value = bg.prompt
}

// ─── Inpaint canvas ───────────────────────────────────────────────────────────

watch(inpaintBase64, async (base64) => {
  if (!base64) return
  await nextTick()
  const canvas = inpaintCanvasRef.value
  if (!canvas) return
  const img = new Image()
  img.onload = () => {
    canvas.width = img.naturalWidth
    canvas.height = img.naturalHeight
    const ctx = canvas.getContext('2d')!
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    inpaintUndoStack.value = []
  }
  img.src = `data:image/jpeg;base64,${base64}`
})

function getCanvasPos(clientX: number, clientY: number): { x: number; y: number } {
  const canvas = inpaintCanvasRef.value!
  const rect = canvas.getBoundingClientRect()
  return {
    x: (clientX - rect.left) * (canvas.width / rect.width),
    y: (clientY - rect.top) * (canvas.height / rect.height),
  }
}

function paintBrush(x: number, y: number) {
  const canvas = inpaintCanvasRef.value!
  const ctx = canvas.getContext('2d')!
  ctx.beginPath()
  ctx.arc(x, y, inpaintBrushSize.value / 2, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255, 60, 60, 0.55)'
  ctx.fill()
}

function onCanvasMouseDown(e: MouseEvent) {
  const canvas = inpaintCanvasRef.value!
  const ctx = canvas.getContext('2d')!
  inpaintUndoStack.value.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
  if (inpaintUndoStack.value.length > 20) inpaintUndoStack.value.shift()
  isDrawing.value = true
  const pos = getCanvasPos(e.clientX, e.clientY)
  lastInpaintPos = pos
  paintBrush(pos.x, pos.y)
}

function onCanvasMouseMove(e: MouseEvent) {
  if (!isDrawing.value) return
  const pos = getCanvasPos(e.clientX, e.clientY)
  // Draw line between last pos and current for smooth stroke
  const canvas = inpaintCanvasRef.value!
  const ctx = canvas.getContext('2d')!
  const dist = Math.hypot(pos.x - lastInpaintPos.x, pos.y - lastInpaintPos.y)
  const steps = Math.max(1, Math.ceil(dist / (inpaintBrushSize.value / 4)))
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    paintBrush(
      lastInpaintPos.x + (pos.x - lastInpaintPos.x) * t,
      lastInpaintPos.y + (pos.y - lastInpaintPos.y) * t,
    )
  }
  lastInpaintPos = pos
}

function onCanvasMouseUp() {
  isDrawing.value = false
}

function onCanvasTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  const canvas = inpaintCanvasRef.value!
  const ctx = canvas.getContext('2d')!
  inpaintUndoStack.value.push(ctx.getImageData(0, 0, canvas.width, canvas.height))
  if (inpaintUndoStack.value.length > 20) inpaintUndoStack.value.shift()
  isDrawing.value = true
  const pos = getCanvasPos(touch.clientX, touch.clientY)
  lastInpaintPos = pos
  paintBrush(pos.x, pos.y)
}

function onCanvasTouchMove(e: TouchEvent) {
  if (!isDrawing.value) return
  const touch = e.touches[0]
  const pos = getCanvasPos(touch.clientX, touch.clientY)
  const dist = Math.hypot(pos.x - lastInpaintPos.x, pos.y - lastInpaintPos.y)
  const steps = Math.max(1, Math.ceil(dist / (inpaintBrushSize.value / 4)))
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    paintBrush(
      lastInpaintPos.x + (pos.x - lastInpaintPos.x) * t,
      lastInpaintPos.y + (pos.y - lastInpaintPos.y) * t,
    )
  }
  lastInpaintPos = pos
}

function clearMask() {
  const canvas = inpaintCanvasRef.value!
  canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height)
  inpaintUndoStack.value = []
}

function undoMask() {
  if (inpaintUndoStack.value.length === 0) return
  const canvas = inpaintCanvasRef.value!
  const prev = inpaintUndoStack.value.pop()!
  canvas.getContext('2d')!.putImageData(prev, 0, 0)
}

function prepareMask(): string {
  const src = inpaintCanvasRef.value!
  const maskCanvas = document.createElement('canvas')
  maskCanvas.width = src.width
  maskCanvas.height = src.height
  const maskCtx = maskCanvas.getContext('2d')!
  maskCtx.fillStyle = '#000000'
  maskCtx.fillRect(0, 0, maskCanvas.width, maskCanvas.height)
  const srcData = src.getContext('2d')!.getImageData(0, 0, src.width, src.height)
  const maskData = maskCtx.getImageData(0, 0, maskCanvas.width, maskCanvas.height)
  for (let i = 0; i < srcData.data.length; i += 4) {
    if (srcData.data[i + 3] > 10) {
      maskData.data[i] = 255
      maskData.data[i + 1] = 255
      maskData.data[i + 2] = 255
      maskData.data[i + 3] = 255
    }
  }
  maskCtx.putImageData(maskData, 0, 0)
  return maskCanvas.toDataURL('image/png').split(',')[1] ?? ''
}

// ─── Outpaint canvas prep ─────────────────────────────────────────────────────

function prepareOutpaint(srcBase64: string, targetRatio: string, position: string): Promise<{ paddedBase64: string; maskBase64: string }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const [rw, rh] = targetRatio.split(':').map(Number)
      const MAX = 1024
      let targetW: number, targetH: number
      if (rw >= rh) { targetW = MAX; targetH = Math.round(MAX * rh / rw) }
      else { targetH = MAX; targetW = Math.round(MAX * rw / rh) }

      const srcW = img.naturalWidth
      const srcH = img.naturalHeight
      // Scale src to fit inside target canvas (never upscale)
      const scale = Math.min(targetW / srcW, targetH / srcH, 1)
      const drawW = Math.round(srcW * scale)
      const drawH = Math.round(srcH * scale)

      let offsetX = 0, offsetY = 0
      if (position === 'Centre') { offsetX = Math.round((targetW - drawW) / 2); offsetY = Math.round((targetH - drawH) / 2) }
      else if (position === 'Haut') { offsetX = Math.round((targetW - drawW) / 2); offsetY = 0 }
      else if (position === 'Bas') { offsetX = Math.round((targetW - drawW) / 2); offsetY = targetH - drawH }
      else if (position === 'Gauche') { offsetX = 0; offsetY = Math.round((targetH - drawH) / 2) }
      else if (position === 'Droite') { offsetX = targetW - drawW; offsetY = Math.round((targetH - drawH) / 2) }

      const paddedCanvas = document.createElement('canvas')
      paddedCanvas.width = targetW
      paddedCanvas.height = targetH
      const pCtx = paddedCanvas.getContext('2d')!
      pCtx.fillStyle = '#000000'
      pCtx.fillRect(0, 0, targetW, targetH)
      pCtx.drawImage(img, offsetX, offsetY, drawW, drawH)

      const maskCanvas = document.createElement('canvas')
      maskCanvas.width = targetW
      maskCanvas.height = targetH
      const mCtx = maskCanvas.getContext('2d')!
      mCtx.fillStyle = '#ffffff'
      mCtx.fillRect(0, 0, targetW, targetH)
      mCtx.fillStyle = '#000000'
      mCtx.fillRect(offsetX, offsetY, drawW, drawH)

      resolve({
        paddedBase64: paddedCanvas.toDataURL('image/jpeg', 0.85).split(',')[1] ?? '',
        maskBase64: maskCanvas.toDataURL('image/png').split(',')[1] ?? '',
      })
    }
    img.src = `data:image/jpeg;base64,${srcBase64}`
  })
}

// ─── Actions ──────────────────────────────────────────────────────────────────

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
        mode: 'generate',
        prompt: prompt.value.trim(),
        style: selectedStyle.value,
        aspectRatio: selectedRatio.value,
        negativePrompt: negativePrompt.value.trim() || undefined,
      },
    })
    lastResult.value = data
    gallery.value.unshift(data.entry)
    if (galleryLoaded.value) signedUrls.value[data.id] = `data:${data.mimeType};base64,${data.base64}`
  } catch (err: any) {
    if (err?.statusCode === 401) { handleUnauthorized(); return }
    genError.value = locale.value === 'fr'
      ? `Erreur : ${err?.statusMessage ?? 'génération échouée'}`
      : `Error: ${err?.statusMessage ?? 'generation failed'}`
  } finally {
    generating.value = false
  }
}

async function bgswap() {
  if (!subjectBase64.value || !bgPrompt.value.trim() || generating.value) return
  generating.value = true
  genError.value = ''
  lastResult.value = null

  try {
    const data = await $fetch<{ id: string; base64: string; mimeType: string; entry: GalleryEntry }>('/api/imagenie/generate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: {
        mode: 'bgswap',
        subjectBase64: subjectBase64.value,
        backgroundPrompt: bgPrompt.value.trim(),
      },
    })
    lastResult.value = data
    gallery.value.unshift(data.entry)
    if (galleryLoaded.value) signedUrls.value[data.id] = `data:${data.mimeType};base64,${data.base64}`
  } catch (err: any) {
    if (err?.statusCode === 401) { handleUnauthorized(); return }
    genError.value = locale.value === 'fr'
      ? `Erreur : ${err?.statusMessage ?? 'BGSWAP échoué'}`
      : `Error: ${err?.statusMessage ?? 'BGSWAP failed'}`
  } finally {
    generating.value = false
  }
}

async function outpaint() {
  if (!outpaintBase64.value || generating.value) return
  generating.value = true
  genError.value = ''
  lastResult.value = null

  try {
    const { paddedBase64, maskBase64 } = await prepareOutpaint(outpaintBase64.value, outpaintTargetRatio.value, outpaintPosition.value)
    const data = await $fetch<{ id: string; base64: string; mimeType: string; entry: GalleryEntry }>('/api/imagenie/generate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: {
        mode: 'outpaint',
        imageBase64: paddedBase64,
        maskBase64,
        inpaintPrompt: outpaintPrompt.value.trim() || undefined,
        inpaintMode: 'EDIT_MODE_OUTPAINT',
      },
    })
    lastResult.value = data
    gallery.value.unshift(data.entry)
    if (galleryLoaded.value) signedUrls.value[data.id] = `data:${data.mimeType};base64,${data.base64}`
  } catch (err: any) {
    if (err?.statusCode === 401) { handleUnauthorized(); return }
    genError.value = locale.value === 'fr'
      ? `Erreur : ${err?.statusMessage ?? 'outpaint échoué'}`
      : `Error: ${err?.statusMessage ?? 'outpaint failed'}`
  } finally {
    generating.value = false
  }
}

async function inpaint() {
  if (!inpaintBase64.value || generating.value) return
  generating.value = true
  genError.value = ''
  lastResult.value = null

  try {
    const maskBase64 = prepareMask()
    const hasPrompt = inpaintPrompt.value.trim().length > 0
    const data = await $fetch<{ id: string; base64: string; mimeType: string; entry: GalleryEntry }>('/api/imagenie/generate', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: {
        mode: 'inpaint',
        imageBase64: inpaintBase64.value,
        maskBase64,
        inpaintPrompt: inpaintPrompt.value.trim() || undefined,
        inpaintMode: hasPrompt ? 'EDIT_MODE_INPAINT_INSERTION' : 'EDIT_MODE_INPAINT_REMOVAL',
      },
    })
    lastResult.value = data
    gallery.value.unshift(data.entry)
    if (galleryLoaded.value) signedUrls.value[data.id] = `data:${data.mimeType};base64,${data.base64}`
  } catch (err: any) {
    if (err?.statusCode === 401) { handleUnauthorized(); return }
    genError.value = locale.value === 'fr'
      ? `Erreur : ${err?.statusMessage ?? 'inpainting échoué'}`
      : `Error: ${err?.statusMessage ?? 'inpainting failed'}`
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

// ─── Auth + init ──────────────────────────────────────────────────────────────

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
  description: 'Générateur d\'images personnel propulsé par Imagen 3 de Google via Vertex AI. Styles prédéfinis, BGSWAP, outpaint, inpainting, galerie GCS.',
  robots: 'noindex',
})
</script>

<style scoped>
.back-link { color: var(--accent-light); text-decoration: none; font-size: 0.9rem; display: inline-block; margin-bottom: 1rem; transition: color 0.2s; }
.back-link:hover { color: var(--accent); }

/* ── Tab transitions ───────────────────────────────────────────────────────── */
.tab-enter-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.tab-leave-active { transition: opacity 0.15s ease, transform 0.15s ease; }
.tab-enter-from { opacity: 0; transform: translateY(8px); }
.tab-leave-to { opacity: 0; transform: translateY(-6px); }

.result-enter-active { animation: slideUp 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.98); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

/* ── Auth gate ─────────────────────────────────────────────────────────────── */
.auth-gate { display: flex; justify-content: center; padding: 2rem 0; }
.auth-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 20px; padding: 2.5rem; text-align: center; max-width: 480px; width: 100%; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
.auth-icon { font-size: 3rem; margin-bottom: 1rem; }
.auth-card h2 { font-size: 1.3rem; margin-bottom: 0.75rem; }
.auth-card p { color: var(--text-muted); font-size: 0.95rem; margin-bottom: 1.5rem; line-height: 1.6; }
.google-btn-container { display: flex; justify-content: center; }

/* ── User row ──────────────────────────────────────────────────────────────── */
.user-row { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.75rem; }
.user-name { color: var(--text-muted); font-size: 0.9rem; }
.btn-signout { background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 4px 10px; border-radius: 6px; cursor: pointer; font-size: 0.8rem; transition: all 0.2s; }
.btn-signout:hover { border-color: var(--text-muted); color: var(--text); }

/* ── Mode tabs — segmented control ────────────────────────────────────────── */
.mode-tabs {
  display: inline-flex;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 32px;
  padding: 4px;
  gap: 2px;
  margin-bottom: 1.75rem;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05), 0 2px 8px rgba(0,0,0,0.04);
}
.mode-tab {
  background: transparent;
  border: none;
  color: var(--text-muted);
  padding: 8px 18px;
  border-radius: 28px;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 500;
  transition: all 0.22s ease;
  white-space: nowrap;
}
.mode-tab:hover { color: var(--text); background: rgba(0,0,0,0.04); }
.mode-tab.active {
  background: var(--accent-light);
  color: #fff;
  font-weight: 700;
  box-shadow: 0 2px 10px rgba(138,104,32,0.35);
}

/* ── Generator card ────────────────────────────────────────────────────────── */
.generator-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 20px;
  padding: 1.75rem;
  max-width: 640px;
  margin-bottom: 2rem;
  box-shadow: 0 4px 24px rgba(0,0,0,0.06), 0 1px 3px rgba(0,0,0,0.04);
  transition: box-shadow 0.3s ease;
}
.generator-card:focus-within { box-shadow: 0 8px 32px rgba(0,0,0,0.1), 0 1px 4px rgba(0,0,0,0.05); }

.mode-desc {
  color: var(--text-muted);
  font-size: 0.9rem;
  line-height: 1.65;
  margin-bottom: 1.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--border);
}
.field { margin-bottom: 1.35rem; }
.field-label {
  display: block;
  font-size: 0.78rem;
  color: var(--text-dim);
  margin-bottom: 0.55rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}
.field-hint { font-weight: 400; text-transform: none; letter-spacing: 0; font-size: 0.78rem; opacity: 0.85; }

/* ── Text inputs ───────────────────────────────────────────────────────────── */
.text-input {
  width: 100%;
  background: var(--bg);
  border: 1.5px solid var(--border);
  border-radius: 10px;
  padding: 0.8rem 1rem;
  color: var(--text);
  font-family: inherit;
  font-size: 0.95rem;
  resize: vertical;
  box-sizing: border-box;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}
.text-input:focus {
  outline: none;
  border-color: var(--accent);
  box-shadow: 0 0 0 3px rgba(196,150,60,0.15);
}
.text-input::placeholder { color: var(--text-dim); }
.neg-input { margin-top: 0.5rem; }

/* ── Button groups (style / ratio / position) ─────────────────────────────── */
.btn-group { display: flex; flex-wrap: wrap; gap: 6px; }
.style-btn, .ratio-btn {
  background: var(--bg);
  border: 1.5px solid var(--border);
  color: var(--text-muted);
  padding: 6px 14px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.18s ease;
}
.style-btn:hover, .ratio-btn:hover {
  border-color: var(--accent);
  color: var(--text);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.style-btn.active, .ratio-btn.active {
  background: var(--accent);
  border-color: var(--accent);
  color: #fff;
  font-weight: 600;
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(196,150,60,0.35);
}

.toggle-neg { background: none; border: none; color: var(--text-dim); cursor: pointer; font-size: 0.85rem; padding: 0; transition: color 0.2s; }
.toggle-neg:hover { color: var(--text-muted); }

/* ── Generate button ───────────────────────────────────────────────────────── */
.btn-generate {
  width: 100%;
  padding: 1rem;
  background: var(--gradient);
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  box-shadow: 0 3px 12px rgba(196,150,60,0.25);
}
.btn-generate::after {
  content: '';
  position: absolute;
  inset: 0;
  background: rgba(255,255,255,0);
  transition: background 0.2s;
}
.btn-generate:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(196,150,60,0.4);
}
.btn-generate:hover:not(:disabled)::after { background: rgba(255,255,255,0.08); }
.btn-generate:active:not(:disabled) { transform: translateY(0); box-shadow: 0 2px 6px rgba(196,150,60,0.2); }
.btn-generate:disabled { opacity: 0.45; cursor: not-allowed; filter: grayscale(20%); box-shadow: none; }

.error-msg { color: #e05c5c; font-size: 0.875rem; margin-top: 0.75rem; background: rgba(224,92,92,0.08); padding: 0.6rem 0.75rem; border-radius: 8px; border-left: 3px solid #e05c5c; }

/* ── Upload zone ───────────────────────────────────────────────────────────── */
.upload-zone {
  border: 2px dashed var(--border);
  border-radius: 14px;
  min-height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s, background 0.2s, transform 0.2s;
  position: relative;
  background: var(--bg);
}
.upload-zone:hover {
  border-color: var(--accent);
  background: rgba(196,150,60,0.04);
  transform: translateY(-1px);
}
.upload-zone.has-image { border-style: solid; min-height: 0; transform: none; }
.upload-placeholder { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; color: var(--text-dim); font-size: 0.9rem; padding: 1.5rem; }
.upload-icon { font-size: 2.5rem; filter: grayscale(20%); transition: transform 0.2s; }
.upload-zone:hover .upload-icon { transform: scale(1.1); }
.upload-preview { width: 100%; max-height: 280px; object-fit: contain; display: block; }

.btn-change-img { background: none; border: none; color: var(--text-dim); font-size: 0.8rem; cursor: pointer; margin-top: 0.4rem; padding: 0; transition: color 0.2s; }
.btn-change-img:hover { color: var(--accent); }

/* ── Inpaint canvas ────────────────────────────────────────────────────────── */
.inpaint-canvas-wrap {
  position: relative;
  display: block;
  border-radius: 14px;
  overflow: hidden;
  border: 1.5px solid var(--border);
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
}
.inpaint-img { display: block; width: 100%; max-height: 400px; object-fit: contain; }
.inpaint-canvas { position: absolute; top: 0; left: 0; width: 100%; height: 100%; cursor: crosshair; }

/* ── Brush controls ────────────────────────────────────────────────────────── */
.brush-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 0.6rem 0.9rem;
}
.brush-label { font-size: 0.82rem; color: var(--text-muted); white-space: nowrap; min-width: 80px; }
.brush-slider { flex: 1; min-width: 80px; accent-color: var(--accent); cursor: pointer; }
.btn-undo, .btn-clear-mask {
  background: var(--bg-card);
  border: 1.5px solid var(--border);
  color: var(--text-muted);
  padding: 5px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.8rem;
  white-space: nowrap;
  transition: all 0.18s ease;
}
.btn-undo:hover:not(:disabled), .btn-clear-mask:hover {
  border-color: var(--accent);
  color: var(--text);
  transform: translateY(-1px);
}
.btn-undo:disabled { opacity: 0.35; cursor: not-allowed; }

/* ── Badges ────────────────────────────────────────────────────────────────── */
.badge-bgswap { background: #7c3aed20; border: 1px solid #7c3aed70; color: #a78bfa; padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.badge-bgswap.badge-sm { font-size: 0.72rem; padding: 2px 8px; }
.badge-outpaint { background: #0d948820; border: 1px solid #0d948870; color: #14b8a6; padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.badge-outpaint.badge-sm { font-size: 0.72rem; padding: 2px 8px; }
.badge-inpaint { background: #ea580c20; border: 1px solid #ea580c70; color: #f97316; padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; }
.badge-inpaint.badge-sm { font-size: 0.72rem; padding: 2px 8px; }

/* ── Result card ───────────────────────────────────────────────────────────── */
.result-card { max-width: 640px; margin-bottom: 2rem; }
.result-img { width: 100%; border-radius: 16px; display: block; box-shadow: 0 8px 32px rgba(0,0,0,0.12); }
.result-meta { display: flex; align-items: center; gap: 0.75rem; margin-top: 0.85rem; }
.result-style { background: var(--bg-card); border: 1px solid var(--border); padding: 3px 10px; border-radius: 12px; font-size: 0.8rem; color: var(--text-muted); }
.result-ratio { background: var(--bg-card); border: 1px solid var(--border); padding: 3px 8px; border-radius: 12px; font-size: 0.8rem; color: var(--text-muted); }
.btn-delete-result { background: none; border: none; cursor: pointer; font-size: 1rem; margin-left: auto; opacity: 0.5; transition: opacity 0.2s, transform 0.2s; }
.btn-delete-result:hover { opacity: 1; transform: scale(1.1); }

/* ── Gallery ───────────────────────────────────────────────────────────────── */
.gallery-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 1.25rem; }
.gallery-title { font-size: 1.2rem; font-weight: 600; margin: 0; }
.gallery-count { color: var(--text-muted); font-weight: 400; font-size: 1rem; }
.btn-load-gallery { background: var(--bg-card); border: 1.5px solid var(--border); color: var(--text-muted); padding: 6px 16px; border-radius: 20px; cursor: pointer; font-size: 0.85rem; transition: all 0.2s; }
.btn-load-gallery:hover { border-color: var(--accent); color: var(--text); transform: translateY(-1px); }
.gallery-loading { color: var(--text-muted); padding: 1rem 0; }
.gallery-empty { color: var(--text-dim); padding: 2rem; text-align: center; }

.gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 3rem; }
.gallery-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 14px;
  overflow: hidden;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
}
.gallery-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.1);
  border-color: rgba(196,150,60,0.4);
}
.gallery-img-wrap { aspect-ratio: 1; overflow: hidden; cursor: pointer; background: var(--bg); }
.gallery-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.35s ease; }
.gallery-img-wrap:hover .gallery-img { transform: scale(1.06); }
.gallery-img-placeholder { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; }
.gallery-card-meta { padding: 0.75rem; }
.gallery-prompt { display: block; font-size: 0.8rem; color: var(--text); margin-bottom: 0.4rem; line-height: 1.4; }
.gallery-card-row { display: flex; align-items: center; gap: 0.5rem; }
.gallery-style-badge { background: var(--bg); border: 1px solid var(--border); padding: 2px 8px; border-radius: 10px; font-size: 0.75rem; color: var(--text-muted); }
.gallery-date { font-size: 0.72rem; color: var(--text-dim); margin-left: auto; }
.btn-delete-small { background: none; border: none; cursor: pointer; font-size: 0.9rem; opacity: 0.4; padding: 0; transition: opacity 0.2s, transform 0.2s; }
.btn-delete-small:hover { opacity: 1; transform: scale(1.15); }

/* ── Modal ─────────────────────────────────────────────────────────────────── */
.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.82); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1rem; backdrop-filter: blur(4px); }
.modal-content { background: var(--bg-card); border-radius: 20px; max-width: 800px; width: 100%; max-height: 90vh; overflow-y: auto; position: relative; box-shadow: 0 24px 80px rgba(0,0,0,0.4); }
.modal-close { position: absolute; top: 1rem; right: 1rem; background: var(--bg); border: 1px solid var(--border); color: var(--text); width: 34px; height: 34px; border-radius: 50%; cursor: pointer; font-size: 0.9rem; display: flex; align-items: center; justify-content: center; z-index: 1; transition: all 0.2s; }
.modal-close:hover { background: var(--accent); border-color: var(--accent); color: #fff; transform: scale(1.05); }
.modal-img { width: 100%; border-radius: 20px 20px 0 0; display: block; }
.modal-meta { padding: 1rem 1.25rem; }
.modal-prompt { font-size: 0.95rem; color: var(--text-muted); margin-bottom: 0.75rem; }
.modal-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }

@media (max-width: 768px) {
  .gallery-grid { grid-template-columns: repeat(2, 1fr); }
  .generator-card { padding: 1.25rem; }
  .mode-tabs { flex-wrap: wrap; }
  .mode-tab { padding: 7px 14px; font-size: 0.82rem; }
}
</style>
