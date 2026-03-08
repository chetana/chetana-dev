<template>
  <div class="section passions-page">
    <div class="section-label">{{ t('nav.passions') }}</div>
    <h1 class="section-title">Ce qui m'anime</h1>
    <p class="page-subtitle">Des projets personnels nés de vraies passions — chacun avec sa propre histoire.</p>

    <div class="cards-grid" ref="gridRef">
      <!-- Médiathèque — live -->
      <NuxtLink to="/passions/medialist" class="tcg-card medialist">
        <div class="card-shine" />
        <div class="card-inner">
          <div class="card-icon">🎬</div>
          <div class="card-content">
            <span class="card-badge live">Live</span>
            <h2 class="card-title">Médiathèque</h2>
            <p class="card-desc">Tracker d'animés, jeux, films et séries — avec stats pondérées par mes notes personnelles.</p>
            <div class="card-tags">
              <span class="tag">Rust</span>
              <span class="tag">PostgreSQL</span>
              <span class="tag">TMDB</span>
            </div>
          </div>
          <div class="card-arrow">→</div>
        </div>
      </NuxtLink>

      <!-- Vélo — live -->
      <NuxtLink to="/passions/velo" class="tcg-card velo">
        <div class="card-shine" />
        <div class="card-inner">
          <div class="card-icon">🚴</div>
          <div class="card-content">
            <span class="card-badge live">Live</span>
            <h2 class="card-title">Vélo</h2>
            <p class="card-desc">Suivi de sorties, élévation, PRs sur les segments et analyse des performances.</p>
            <div class="card-tags">
              <span class="tag">Strava API</span>
              <span class="tag">Charts</span>
            </div>
          </div>
          <div class="card-arrow">→</div>
        </div>
      </NuxtLink>

      <!-- Voyage — bientôt -->
      <div class="tcg-card voyage disabled">
        <div class="card-shine" />
        <div class="card-inner">
          <div class="card-icon">✈️</div>
          <div class="card-content">
            <span class="card-badge soon">Bientôt</span>
            <h2 class="card-title">Voyage</h2>
            <p class="card-desc">Carte des pays visités, anecdotes et photos marquantes par destination.</p>
            <div class="card-tags">
              <span class="tag">Maps</span>
              <span class="tag">GCS</span>
            </div>
          </div>
          <div class="card-arrow muted">→</div>
        </div>
      </div>
    </div>

    <!-- Dots — mobile slideshow only -->
    <div class="slide-dots" aria-hidden="true">
      <button
        v-for="(_, i) in 3"
        :key="i"
        :class="['dot', { active: activeIdx === i }]"
        @click="scrollToCard(i)"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useLocale()

useHead({ title: 'Passions — Chetana YIN' })

const gridRef = ref<HTMLElement | null>(null)
const activeIdx = ref(0)

// ── Tilt helpers ────────────────────────────────────────────────────
function applyTilt(card: HTMLElement, x: number, y: number) {
  const rect = card.getBoundingClientRect()
  const cx = rect.width / 2
  const cy = rect.height / 2
  const rotX = ((y - cy) / cy) * -6
  const rotY = ((x - cx) / cx) * 8
  card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`
  const shine = card.querySelector<HTMLElement>('.card-shine')
  if (shine) {
    shine.style.opacity = '1'
    shine.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.18) 0%, transparent 65%)`
  }
}

function resetTilt(card: HTMLElement) {
  card.style.transform = ''
  const shine = card.querySelector<HTMLElement>('.card-shine')
  if (shine) shine.style.opacity = '0'
}

// ── Entrance animation (tilt-in → reset, half sine wave) ────────────
function playEntranceAnim(card: HTMLElement) {
  const rect = card.getBoundingClientRect()
  const cx = rect.width / 2
  const cy = rect.height / 2
  let elapsed = 0
  const dur = 800
  const step = () => {
    elapsed += 16
    const p = elapsed / dur
    if (p >= 1) { resetTilt(card); return }
    const wave = Math.sin(p * Math.PI)
    const rotY = wave * 10
    const rotX = wave * -4
    card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(${wave * -6}px)`
    const shine = card.querySelector<HTMLElement>('.card-shine')
    if (shine) {
      shine.style.opacity = String(wave * 0.7)
      shine.style.background = `radial-gradient(circle at ${cx + rotY * 8}px ${cy + rotX * 8}px, rgba(255,255,255,0.18) 0%, transparent 65%)`
    }
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

// ── Scroll to card (for dot clicks) ─────────────────────────────────
function scrollToCard(i: number) {
  const grid = gridRef.value
  const card = grid?.querySelectorAll<HTMLElement>('.tcg-card')[i]
  card?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
}

// ── Mount ────────────────────────────────────────────────────────────
onMounted(() => {
  const grid = gridRef.value
  if (!grid) return
  const allCards = Array.from(grid.querySelectorAll<HTMLElement>('.tcg-card'))
  const isMobile = () => window.innerWidth < 640

  allCards.forEach((card, idx) => {
    // ── Desktop: mouse tilt ────────────────────────────────────────
    card.addEventListener('mousemove', (e: MouseEvent) => {
      const rect = card.getBoundingClientRect()
      applyTilt(card, e.clientX - rect.left, e.clientY - rect.top)
    })
    card.addEventListener('mouseleave', () => resetTilt(card))

    // ── IntersectionObserver ───────────────────────────────────────
    // Desktop: observe relative to viewport, fire once (staggered on load)
    // Mobile:  observe relative to scroll container, fire on every snap
    const buildObserver = () => {
      const mobile = isMobile()
      const obs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return
          playEntranceAnim(card)
          activeIdx.value = idx
          if (!mobile) obs.unobserve(card) // desktop: once only
        })
      }, {
        root: mobile ? grid : null,
        threshold: mobile ? 0.65 : 0.35,
      })
      obs.observe(card)
      return obs
    }

    let obs = buildObserver()

    // Rebuild observer on resize (desktop ↔ mobile switch)
    let resizeTimer: ReturnType<typeof setTimeout>
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer)
      resizeTimer = setTimeout(() => { obs.disconnect(); obs = buildObserver() }, 200)
    }, { passive: true })

    // Stagger desktop entrance (don't stagger mobile — each card animates on snap)
    if (!isMobile()) {
      // Desktop: slight stagger on initial load handled by observer threshold
    }
  })
})
</script>

<style scoped>
.passions-page {
  padding-top: 8rem;
  max-width: 860px;
}

.page-subtitle {
  color: var(--text-muted);
  font-size: 1.05rem;
  margin-bottom: 3rem;
  max-width: 560px;
}

/* ── Grid — desktop ───────────────────────────────────────────────── */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
}

@media (max-width: 900px) and (min-width: 641px) {
  .cards-grid { grid-template-columns: 1fr 1fr; }
}

/* ── Slideshow — mobile ───────────────────────────────────────────── */
@media (max-width: 640px) {
  .cards-grid {
    display: flex;
    overflow-x: scroll;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    -webkit-overflow-scrolling: touch;
    gap: 1rem;
    /* side padding to peek at adjacent cards */
    padding: 0.5rem 12% 1rem;
    scrollbar-width: none;
    /* extend beyond page to avoid clipping */
    margin: 0 -1.5rem;
  }
  .cards-grid::-webkit-scrollbar { display: none; }

  .tcg-card {
    flex: 0 0 76vw;
    scroll-snap-align: center;
  }
}

/* ── TCG Card ─────────────────────────────────────────────────────── */
.tcg-card {
  position: relative;
  display: block;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  overflow: hidden;
  text-decoration: none;
  color: inherit;
  transition: transform 0.35s cubic-bezier(0.23, 1, 0.32, 1),
              box-shadow 0.35s cubic-bezier(0.23, 1, 0.32, 1),
              border-color 0.25s;
  cursor: pointer;
  will-change: transform;
  aspect-ratio: 2/3;
}

.tcg-card.disabled {
  cursor: default;
  opacity: 0.55;
}

/* ── Color accents per card ───────────────────────────────────────── */
.tcg-card.medialist { --card-accent: var(--accent); --card-accent-rgb: 196, 150, 60; }
.tcg-card.velo      { --card-accent: #3b82f6;       --card-accent-rgb: 59, 130, 246; }
.tcg-card.voyage    { --card-accent: #10b981;        --card-accent-rgb: 16, 185, 129; }

.tcg-card:not(.disabled):hover {
  border-color: var(--card-accent);
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.16), 0 0 0 1px var(--card-accent),
              0 6px 20px rgba(var(--card-accent-rgb), 0.2);
}

/* ── Shine overlay ────────────────────────────────────────────────── */
.card-shine {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s;
  z-index: 2;
  border-radius: inherit;
}

/* ── Inner layout ─────────────────────────────────────────────────── */
.card-inner {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1.25rem 1.25rem;
  gap: 0.75rem;
}

.card-icon {
  font-size: 2.5rem;
  line-height: 1;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,0.12));
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

/* ── Badge ────────────────────────────────────────────────────────── */
.card-badge {
  display: inline-block;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  padding: 0.2rem 0.6rem;
  border-radius: 20px;
  width: fit-content;
}

.card-badge.live {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.card-badge.soon {
  background: rgba(107, 114, 128, 0.12);
  color: var(--text-dim);
  border: 1px solid var(--border);
}

/* ── Text ─────────────────────────────────────────────────────────── */
.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0;
  color: var(--text);
}

.card-desc {
  font-size: 0.82rem;
  color: var(--text-muted);
  line-height: 1.55;
  margin: 0;
  flex: 1;
}

/* ── Tags ─────────────────────────────────────────────────────────── */
.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: auto;
}

.tag {
  font-size: 0.68rem;
  padding: 0.2rem 0.55rem;
  background: rgba(var(--card-accent-rgb, 196, 150, 60), 0.1);
  color: var(--text-muted);
  border-radius: 6px;
  border: 1px solid rgba(var(--card-accent-rgb, 196, 150, 60), 0.2);
  font-weight: 500;
}

/* ── Arrow ────────────────────────────────────────────────────────── */
.card-arrow {
  font-size: 1.1rem;
  color: var(--card-accent, var(--accent));
  font-weight: 700;
  align-self: flex-end;
  transition: transform 0.2s;
}

.card-arrow.muted { color: var(--text-dim); }

.tcg-card:not(.disabled):hover .card-arrow {
  transform: translateX(4px);
}

/* ── Dots ─────────────────────────────────────────────────────────── */
.slide-dots {
  display: none;
}

@media (max-width: 640px) {
  .slide-dots {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 1.25rem;
  }
}

.dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--border);
  border: none;
  padding: 0;
  cursor: pointer;
  transition: background 0.25s, transform 0.25s;
}

.dot.active {
  background: var(--accent);
  transform: scale(1.4);
}
</style>
