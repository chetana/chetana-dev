<template>
  <div class="section" style="padding-top: 6rem;">
    <div class="section-label">{{ t('mentions.title') }}</div>
    <h1 class="section-title">{{ t('mentions.title') }}</h1>

    <div class="mentions-grid">
      <div class="mentions-card">
        <h2>{{ t('mentions.responsable') }}</h2>
        <p class="mentions-value">{{ t('mentions.responsable.value') }}</p>
      </div>

      <div class="mentions-card">
        <h2>{{ t('mentions.donnees') }}</h2>
        <p>{{ t('mentions.donnees.body') }}</p>
      </div>

      <div class="mentions-card">
        <h2>{{ t('mentions.finalite') }}</h2>
        <p>{{ t('mentions.finalite.body') }}</p>
      </div>

      <div class="mentions-card">
        <h2>{{ t('mentions.partage') }}</h2>
        <p>{{ t('mentions.partage.body') }}</p>
      </div>

      <div class="mentions-card">
        <h2>{{ t('mentions.hebergement') }}</h2>
        <p>{{ t('mentions.hebergement.body') }}</p>
      </div>

      <div class="mentions-card">
        <h2>{{ t('mentions.droits') }}</h2>
        <p>{{ t('mentions.droits.body') }}</p>
      </div>
    </div>

    <div class="mentions-back">
      <NuxtLink to="/contact" class="btn btn-outline">
        {{ t('contact.title') }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
const { t } = useLocale()

const description = computed(() => 'Mentions légales — Chetana YIN')

useSeoMeta({
  title: 'Mentions légales — Chetana YIN',
  description,
  ogTitle: 'Mentions légales — Chetana YIN',
  ogDescription: description,
  ogType: 'website'
})
</script>

<style scoped>
.mentions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.mentions-card {
  padding: 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-sm);
}

.mentions-card h2 {
  font-size: 1.1rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--accent-light);
}

.mentions-card p {
  font-size: 0.95rem;
  line-height: 1.7;
  color: var(--text);
}

.mentions-value {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--text);
}

.mentions-back {
  margin-top: 3rem;
  text-align: center;
}

@media (max-width: 768px) {
  .section {
    padding: 4rem 1.5rem;
  }
  .mentions-grid {
    grid-template-columns: 1fr;
  }
}
</style>