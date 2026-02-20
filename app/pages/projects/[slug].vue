<template>
  <div class="section" style="padding-top: 8rem;">
    <NuxtLink to="/projects" class="back-link">← {{ t('nav.projects') }}</NuxtLink>

    <div v-if="project">
      <h1>{{ locale === 'fr' ? project.titleFr : project.titleEn }}</h1>

      <div class="tags" style="margin: 1.5rem 0;">
        <span v-for="tag in (project.tags || [])" :key="tag" class="tag">{{ tag }}</span>
      </div>

      <div class="project-content">
        <p>{{ locale === 'fr' ? project.descriptionFr : project.descriptionEn }}</p>
      </div>

      <div class="project-actions">
        <a v-if="project.demoUrl" :href="project.demoUrl" target="_blank" class="btn btn-primary">
          {{ t('projects.demo') }} →
        </a>
        <a v-if="project.githubUrl" :href="project.githubUrl" target="_blank" class="btn btn-outline">
          {{ t('projects.github') }}
        </a>
      </div>
    </div>

    <div v-else class="empty">
      {{ locale === 'fr' ? 'Projet introuvable.' : 'Project not found.' }}
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, t } = useLocale()
const route = useRoute()

const { data: project } = await useFetch(`/api/projects/${route.params.slug}`)

const projectTitle = computed(() => {
  if (!project.value) return 'Projet'
  return locale.value === 'fr' ? project.value.titleFr : project.value.titleEn
})

const projectDescription = computed(() => {
  if (!project.value) return ''
  return locale.value === 'fr' ? project.value.descriptionFr : project.value.descriptionEn
})

useSeoMeta({
  title: () => `${projectTitle.value} \u2014 Chetana YIN`,
  description: projectDescription,
  ogTitle: () => `${projectTitle.value} \u2014 Chetana YIN`,
  ogDescription: projectDescription,
  ogType: 'website'
})
</script>

<style scoped>
.back-link {
  color: var(--accent-light);
  text-decoration: none;
  font-size: 0.9rem;
  display: inline-block;
  margin-bottom: 2rem;
}

h1 { font-size: 2rem; margin-bottom: 1rem; }

.project-content { color: var(--text-muted); line-height: 1.8; margin-bottom: 2rem; }

.project-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

.empty { color: var(--text-dim); text-align: center; padding: 4rem; }
</style>
