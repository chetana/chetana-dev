<template>
  <!-- ── Sidebar (desktop always visible, mobile slide-in) ── -->
  <aside class="sidebar" :class="{ open: mobileOpen }">
    <div class="sidebar-header">
      <NuxtLink to="/" class="logo" @click="mobileOpen = false">CY</NuxtLink>
      <p class="logo-sub">Chetana YIN</p>
    </div>

    <nav class="sidebar-nav">
      <NuxtLink to="/#about"      class="nav-link" @click="mobileOpen = false">{{ t('nav.about') }}</NuxtLink>
      <NuxtLink to="/#experience" class="nav-link" @click="mobileOpen = false">{{ t('nav.experience') }}</NuxtLink>
      <NuxtLink to="/#skills"     class="nav-link" @click="mobileOpen = false">{{ t('nav.skills') }}</NuxtLink>
      <NuxtLink to="/#education"  class="nav-link" @click="mobileOpen = false">{{ t('nav.education') }}</NuxtLink>
      <NuxtLink to="/projects"    class="nav-link" @click="mobileOpen = false">{{ t('nav.projects') }}</NuxtLink>
      <NuxtLink to="/blog"        class="nav-link" @click="mobileOpen = false">{{ t('nav.blog') }}</NuxtLink>
      <NuxtLink to="/contact"     class="nav-link" @click="mobileOpen = false">{{ t('nav.contact') }}</NuxtLink>
    </nav>

    <div class="sidebar-footer">
      <button class="lang-btn" @click="toggleLocale">
        {{ locale === 'fr' ? 'EN' : locale === 'en' ? 'ខ្មែរ' : 'FR' }}
      </button>
    </div>
  </aside>

  <!-- ── Mobile overlay ── -->
  <Transition name="fade">
    <div v-if="mobileOpen" class="overlay" @click="mobileOpen = false" />
  </Transition>

  <!-- ── Mobile top bar ── -->
  <header class="mobile-bar">
    <NuxtLink to="/" class="logo">CY</NuxtLink>
    <button
      class="burger"
      :class="{ open: mobileOpen }"
      :aria-expanded="mobileOpen"
      aria-label="Menu"
      @click="mobileOpen = !mobileOpen"
    >
      <span></span>
      <span></span>
      <span></span>
    </button>
  </header>
</template>

<script setup lang="ts">
const { locale, t, toggleLocale } = useLocale()
const mobileOpen = ref(false)
</script>

<style scoped>
/* ─── Sidebar ──────────────────────────────────────────────────────────── */
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  width: var(--sidebar-width, 220px);
  display: flex;
  flex-direction: column;
  background: var(--bg);
  border-right: 1px solid var(--border);
  z-index: 100;
  transition: transform 0.32s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

/* ─── Header (logo area) ────────────────────────────────────────────────── */
.sidebar-header {
  padding: 2rem 1.5rem 1.75rem;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
  line-height: 1;
}

.logo-sub {
  font-size: 0.72rem;
  color: var(--text-dim);
  margin-top: 0.4rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

/* ─── Nav links ─────────────────────────────────────────────────────────── */
.sidebar-nav {
  flex: 1;
  padding: 1.25rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  overflow-y: auto;
}

.nav-link {
  display: block;
  padding: 0.6rem 0.75rem;
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  border-left: 2px solid transparent;
  transition: background 0.18s, color 0.18s, border-color 0.18s;
  white-space: nowrap;
}

.nav-link:hover {
  color: var(--text);
  background: rgba(196, 150, 60, 0.07);
  border-left-color: rgba(196, 150, 60, 0.4);
}

.nav-link.router-link-active {
  color: var(--accent-light);
  background: rgba(196, 150, 60, 0.1);
  border-left-color: var(--accent);
  font-weight: 600;
}

/* ─── Footer (lang toggle) ──────────────────────────────────────────────── */
.sidebar-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.lang-btn {
  background: transparent;
  color: var(--accent-light);
  border: 1px solid var(--accent);
  border-radius: 6px;
  padding: 0.35rem 0.8rem;
  font-size: 0.78rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  font-family: inherit;
  letter-spacing: 0.04em;
}

.lang-btn:hover {
  background: var(--accent);
  color: #fff;
}

/* ─── Mobile top bar ────────────────────────────────────────────────────── */
.mobile-bar {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--mobile-bar-height, 56px);
  z-index: 150;
  padding: 0 1.25rem;
  align-items: center;
  justify-content: space-between;
  background: rgba(245, 242, 236, 0.94);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border);
}

/* ─── Animated burger ───────────────────────────────────────────────────── */
.burger {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  width: 36px;
  height: 36px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 6px;
  border-radius: 8px;
  transition: background 0.2s;
}

.burger:hover { background: rgba(196, 150, 60, 0.1); }

.burger span {
  display: block;
  height: 2px;
  background: var(--text);
  border-radius: 2px;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s, width 0.3s;
}

.burger span:nth-child(1) { width: 20px; }
.burger span:nth-child(2) { width: 14px; margin-left: auto; }
.burger span:nth-child(3) { width: 20px; }

.burger.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
.burger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
.burger.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

/* ─── Mobile overlay ────────────────────────────────────────────────────── */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  z-index: 120;
}

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ─── Responsive ────────────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .sidebar {
    width: min(280px, 85vw);
    transform: translateX(-110%);
    z-index: 200;
    box-shadow: 6px 0 32px rgba(0, 0, 0, 0.12);
  }

  .sidebar.open {
    transform: translateX(0);
  }

  .mobile-bar {
    display: flex;
  }
}
</style>
