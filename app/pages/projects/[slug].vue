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

  // 1. Extract code blocks first to protect them from other transforms
  const codeBlocks: string[] = []
  let html = raw.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
    const escaped = code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const cls = lang ? ` class="language-${lang}"` : ''
    codeBlocks.push(`<pre><code${cls}>${escaped}</code></pre>`)
    return `\x00CODE${codeBlocks.length - 1}\x00`
  })

  // 2. Block-level transforms
  html = html
    .replace(/^---$/gm, '<hr>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')

  // 3. Tables
  html = html.replace(/(^\|.+\|\n)(^\|[-| :]+\|\n)((?:^\|.+\|\n?)*)/gm, (match) => {
    const lines = match.trim().split('\n').filter(l => !/^\|[-| :]+\|/.test(l))
    const [header, ...rows] = lines
    const th = (header.split('|').filter(Boolean).map(c => `<th>${c.trim()}</th>`).join(''))
    const trs = rows.map(r => `<tr>${r.split('|').filter(Boolean).map(c => `<td>${c.trim()}</td>`).join('')}</tr>`).join('\n')
    return `<table><thead><tr>${th}</tr></thead><tbody>${trs}</tbody></table>`
  })

  // 4. Lists
  html = html.replace(/(^- .+$(\n- .+$)*)/gm, (match) => {
    const items = match.split('\n').map(line => `<li>${line.replace(/^- /, '')}</li>`).join('\n')
    return `<ul>${items}</ul>`
  })
  html = html.replace(/(^\d+\. .+$(\n\d+\. .+$)*)/gm, (match) => {
    const items = match.split('\n').map(line => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('\n')
    return `<ol>${items}</ol>`
  })

  // 5. Inline
  html = html
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')

  // 6. Paragraphs
  html = html
    .split(/\n\n/)
    .map(block => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (/^<(h[23]|ul|ol|hr|table|pre|\x00CODE)/.test(trimmed)) return trimmed
      if (trimmed.startsWith('\x00CODE')) return trimmed
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')

  // 7. Reinsert code blocks
  html = html.replace(/\x00CODE(\d+)\x00/g, (_, i) => codeBlocks[Number(i)])

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
.project-content :deep(code) {
  font-family: monospace;
  font-size: 0.88em;
  background: rgba(196, 150, 60, 0.1);
  border: 1px solid rgba(196, 150, 60, 0.2);
  border-radius: 4px;
  padding: 0.1em 0.4em;
  color: var(--accent-light);
}
.project-content :deep(ul), .project-content :deep(ol) { padding-left: 1.5rem; margin-bottom: 1rem; }
.project-content :deep(li) { margin-bottom: 0.4rem; }
.project-content :deep(hr) { border: none; border-top: 1px solid var(--border); margin: 2rem 0; }
.project-content :deep(pre) {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 1.1rem 1.25rem;
  overflow-x: auto;
  margin-bottom: 1.25rem;
  font-family: monospace;
  font-size: 0.83rem;
  line-height: 1.65;
}
.project-content :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  color: var(--text-muted);
  font-size: inherit;
}
.project-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1.25rem;
  font-size: 0.88rem;
}
.project-content :deep(th),
.project-content :deep(td) {
  padding: 0.55rem 0.85rem;
  border: 1px solid var(--border);
  text-align: left;
}
.project-content :deep(th) {
  background: var(--bg-card);
  color: var(--text);
  font-weight: 600;
}

.project-actions { display: flex; gap: 1rem; flex-wrap: wrap; }

.empty { color: var(--text-dim); text-align: center; padding: 4rem; }
</style>
