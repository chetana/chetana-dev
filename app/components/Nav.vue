<template>
  <nav>
    <NuxtLink to="/" class="logo">CY</NuxtLink>
    <div class="links">
      <NuxtLink to="/#about">{{ t('nav.about') }}</NuxtLink>
      <NuxtLink to="/#experience">{{ t('nav.experience') }}</NuxtLink>
      <NuxtLink to="/#skills">{{ t('nav.skills') }}</NuxtLink>
      <NuxtLink to="/#education">{{ t('nav.education') }}</NuxtLink>
      <NuxtLink to="/projects">{{ t('nav.projects') }}</NuxtLink>
      <NuxtLink to="/blog">{{ t('nav.blog') }}</NuxtLink>
      <NuxtLink to="/contact">{{ t('nav.contact') }}</NuxtLink>
      <button class="lang-toggle" @click="toggleLocale">
        {{ locale === 'fr' ? 'EN' : locale === 'en' ? 'ខ្មែរ' : 'FR' }}
      </button>
    </div>
    <button class="mobile-menu" @click="mobileOpen = !mobileOpen">☰</button>
  </nav>

  <!-- Mobile menu -->
  <div v-if="mobileOpen" class="mobile-nav" @click="mobileOpen = false">
    <NuxtLink to="/#about">{{ t('nav.about') }}</NuxtLink>
    <NuxtLink to="/#experience">{{ t('nav.experience') }}</NuxtLink>
    <NuxtLink to="/#skills">{{ t('nav.skills') }}</NuxtLink>
    <NuxtLink to="/projects">{{ t('nav.projects') }}</NuxtLink>
    <NuxtLink to="/blog">{{ t('nav.blog') }}</NuxtLink>
    <NuxtLink to="/contact">{{ t('nav.contact') }}</NuxtLink>
  </div>

  <!-- Mobile lang toggle -->
  <div class="lang-toggle-mobile">
    <button class="lang-toggle" @click="toggleLocale">
      {{ locale === 'fr' ? 'EN' : locale === 'en' ? 'ខ្មែរ' : 'FR' }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { locale, t, toggleLocale } = useLocale()
const mobileOpen = ref(false)
</script>

<style scoped>
nav {
  position: fixed;
  top: 0;
  width: 100%;
  z-index: 100;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  backdrop-filter: blur(20px);
  background: rgba(250, 248, 245, 0.85);
  border-bottom: 1px solid var(--border);
  transition: all 0.3s;
}

.logo {
  font-weight: 700;
  font-size: 1.1rem;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
}

.links { display: flex; gap: 2rem; align-items: center; }

.links a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.links a:hover, .links a.router-link-active { color: var(--text); }

.lang-toggle {
  background: transparent;
  color: var(--accent-light);
  border: 1px solid var(--accent);
  border-radius: 6px;
  padding: 0.3rem 0.7rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.lang-toggle:hover { background: var(--accent); color: #fff; }

.mobile-menu {
  display: none;
  background: none;
  border: none;
  color: var(--text);
  font-size: 1.5rem;
  cursor: pointer;
}

.mobile-nav {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  z-index: 99;
  background: rgba(250, 248, 245, 0.97);
  backdrop-filter: blur(20px);
  padding: 1rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-nav a {
  color: var(--text-muted);
  text-decoration: none;
  font-size: 1rem;
  padding: 0.5rem 0;
}

.lang-toggle-mobile {
  display: none;
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 100;
}

@media (max-width: 768px) {
  .links { display: none; }
  .mobile-menu { display: block; }
  .lang-toggle-mobile { display: block; }
}
</style>
