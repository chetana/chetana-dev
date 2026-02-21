<template>
  <div class="section" style="padding-top: 8rem;">
    <NuxtLink to="/projects" class="back-link">← {{ t('nav.projects') }}</NuxtLink>

    <div v-if="project">
      <h1>{{ localeField(project, 'title') }}</h1>

      <div class="tags" style="margin: 1.5rem 0;">
        <span v-for="tag in (project.tags || [])" :key="tag" class="tag">{{ tag }}</span>
      </div>

      <div class="project-content" v-html="renderedDescription" />

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
const { locale, t, localeField } = useLocale()
const route = useRoute()

const { data: project } = await useFetch(`/api/projects/${route.params.slug}`)

const projectTitle = computed(() => {
  if (!project.value) return 'Projet'
  return localeField(project.value, 'title')
})

const projectDescription = computed(() => {
  if (!project.value) return ''
  return localeField(project.value, 'description')
})

const renderedDescription = computed(() => {
  const raw = projectDescription.value
  if (!raw) return ''
  let html = raw
    .replace(/^---$/gm, '<hr>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
  html = html.replace(/(^- .+$(\n- .+$)*)/gm, (match) => {
    const items = match.split('\n').map(line => `<li>${line.replace(/^- /, '')}</li>`).join('\n')
    return `<ul>${items}</ul>`
  })
  html = html.replace(/(^\d+\. .+$(\n\d+\. .+$)*)/gm, (match) => {
    const items = match.split('\n').map(line => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('\n')
    return `<ol>${items}</ol>`
  })
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html
    .split(/\n\n/)
    .map(block => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (/^<(h[23]|ul|ol|hr|blockquote|table)/.test(trimmed)) return trimmed
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')
  return html
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

.project-content { color: var(--text-muted); line-height: 1.8; margin-bottom: 2rem; max-width: 800px; }
.project-content :deep(h2) { color: var(--text); font-size: 1.4rem; margin: 2rem 0 1rem; }
.project-content :deep(h3) { color: var(--text); font-size: 1.2rem; margin: 1.5rem 0 0.8rem; }
.project-content :deep(p) { margin-bottom: 1rem; }
.project-content :deep(strong) { color: var(--text); }
.project-content :deep(em) { font-style: italic; }
.project-content :deep(ul), .project-content :deep(ol) { padding-left: 1.5rem; margin-bottom: 1rem; }
.project-content :deep(li) { margin-bottom: 0.4rem; }
.project-content :deep(hr) { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }

.project-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

.empty { color: var(--text-dim); text-align: center; padding: 4rem; }
</style>
