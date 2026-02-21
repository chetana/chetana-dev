<template>
  <section class="hero">
    <div class="hero-content">
      <div class="hero-badge">{{ t('hero.badge') }}</div>
      <h1>Chetana <span class="gradient">YIN</span></h1>
      <p>{{ t('hero.desc') }}</p>
      <div class="hero-cta">
        <NuxtLink to="/contact" class="btn btn-primary">{{ t('hero.cta1') }}</NuxtLink>
        <a href="#experience" class="btn btn-outline">{{ t('hero.cta2') }}</a>
        <NuxtLink to="/cv" class="btn btn-outline">{{ t('hero.cta3') }}</NuxtLink>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const { t } = useLocale()
</script>

<style scoped>
.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 2rem 4rem;
  position: relative;
  overflow: hidden;
}

.hero::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 50%, rgba(108, 99, 255, 0.06) 0%, transparent 50%),
              radial-gradient(circle at 70% 50%, rgba(72, 198, 239, 0.04) 0%, transparent 50%);
  animation: drift 20s ease-in-out infinite;
}

@keyframes drift {
  0%, 100% { transform: translate(0, 0); }
  50% { transform: translate(-2%, 2%); }
}

.hero-content {
  position: relative;
  max-width: 800px;
  text-align: center;
}

.hero-badge {
  display: inline-block;
  padding: 0.4rem 1.2rem;
  border: 1px solid var(--accent);
  border-radius: 100px;
  font-size: 0.8rem;
  color: var(--accent-light);
  margin-bottom: 2rem;
  letter-spacing: 0.05em;
}

h1 {
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 1.5rem;
}

.gradient {
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  font-size: 1.2rem;
  color: var(--text-muted);
  max-width: 600px;
  margin: 0 auto 2.5rem;
}

.hero-cta {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}
</style>
