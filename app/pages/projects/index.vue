<template>
  <div class="section" style="padding-top: 8rem;">
    <div class="section-label">{{ t('nav.projects') }}</div>
    <h1 class="section-title">{{ t('projects.title') }}</h1>
    <p class="subtitle">{{ t('projects.subtitle') }}</p>

    <div class="projects-grid">
      <ProjectCard v-for="project in projects" :key="project.slug" :project="project" />
    </div>

    <div v-if="!projects?.length" class="empty">
      {{ locale === 'fr' ? 'Aucun projet pour le moment.' : 'No projects yet.' }}
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, t } = useLocale()
const { data: projects } = await useFetch('/api/projects', { default: () => [] })

const description = computed(() => locale.value === 'fr'
  ? 'Mes projets personnels et exp\u00e9rimentations techniques.'
  : 'My personal projects and technical experiments.'
)

useSeoMeta({
  title: 'Projets \u2014 Chetana YIN',
  description,
  ogTitle: 'Projets \u2014 Chetana YIN',
  ogDescription: description,
  ogType: 'website'
})
</script>

<style scoped>
.subtitle { color: var(--text-muted); margin-top: -2rem; margin-bottom: 3rem; }

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.5rem;
}

.empty { color: var(--text-dim); text-align: center; padding: 4rem; }
</style>
