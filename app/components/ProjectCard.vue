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
const { locale, t } = useLocale()

const props = defineProps<{
  project: {
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

const title = computed(() => props.project[locale.value === 'fr' ? 'titleFr' : 'titleEn'])
const description = computed(() => props.project[locale.value === 'fr' ? 'descriptionFr' : 'descriptionEn'])
</script>

<style scoped>
.project-card {
  display: block;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s;
  text-decoration: none;
  color: var(--text);
}

.project-card:hover { border-color: var(--accent); transform: translateY(-4px); }

.project-image img { width: 100%; height: 200px; object-fit: cover; }

.project-body { padding: 1.5rem; }

h3 { font-size: 1.1rem; margin-bottom: 0.5rem; }

p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; }

.project-links {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
}

.link { color: var(--accent-light); font-size: 0.85rem; }
.link.secondary { color: var(--text-muted); }
</style>
