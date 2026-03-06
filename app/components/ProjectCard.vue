<template>
  <NuxtLink :to="`/projects/${project.slug}`" class="project-card">
    <div v-if="project.imageUrl" class="project-image">
      <img :src="project.imageUrl" :alt="title" />
    </div>
    <div class="project-body">
      <h3>{{ title }}</h3>
      <p>{{ description }}</p>
      <div class="tags">
        <span v-for="tag in (project.tags || [])" :key="tag" class="tag">{{ tag }}</span>
      </div>
      <div class="project-links">
        <span v-if="project.demoUrl" class="link">{{ t('projects.demo') }} →</span>
        <span v-if="project.githubUrl" class="link secondary">{{ t('projects.github') }}</span>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const { locale, t, localeField } = useLocale()

const props = defineProps<{
  project: Record<string, any> & {
    slug: string
    titleFr: string
    titleEn: string
    descriptionFr: string
    descriptionEn: string
    tags: string[] | null
    githubUrl: string | null
    demoUrl: string | null
    imageUrl: string | null
    featured: boolean | null
  }
}>()

const title = computed(() => localeField(props.project, 'title'))
const description = computed(() => {
  const raw = localeField(props.project, 'description')
  // Extract first paragraph (skip markdown headers)
  const lines = raw.split('\n').filter(l => l.trim() && !l.startsWith('#'))
  const first = lines[0] || ''
  // Strip markdown formatting
  const clean = first.replace(/\*\*(.+?)\*\*/g, '$1').replace(/\*(.+?)\*/g, '$1').replace(/`(.+?)`/g, '$1')
  return clean.length > 160 ? clean.slice(0, 157) + '...' : clean
})
</script>

<style scoped>
.project-card {
  display: block;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius, 14px);
  overflow: hidden;
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  text-decoration: none;
  color: var(--text);
  box-shadow: var(--shadow-sm);
}

.project-card:hover {
  border-color: rgba(196,150,60,0.45);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.project-image {
  overflow: hidden;
}

.project-image img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.project-card:hover .project-image img {
  transform: scale(1.04);
}

.project-body { padding: 1.5rem; }

h3 { font-size: 1.1rem; margin-bottom: 0.5rem; font-weight: 700; }

p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; line-height: 1.6; }

.project-links {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.link {
  color: var(--accent-light);
  font-size: 0.85rem;
  font-weight: 600;
  transition: color 0.2s, gap 0.2s;
  display: inline-flex;
  align-items: center;
}
.link:hover { color: var(--accent); }
.link.secondary { color: var(--text-dim); font-weight: 500; }
.link.secondary:hover { color: var(--text-muted); }
</style>
