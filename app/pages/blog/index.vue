<template>
  <div class="section" style="padding-top: 8rem;">
    <div class="section-label">Blog</div>
    <h1 class="section-title">{{ t('blog.title') }}</h1>
    <p class="subtitle">{{ t('blog.subtitle') }}</p>

    <div class="blog-grid">
      <BlogCard v-for="post in posts" :key="post.slug" :post="post" />
    </div>

    <div v-if="!posts?.length" class="empty">
      {{ locale === 'fr' ? 'Aucun article pour le moment.' : 'No articles yet.' }}
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, t } = useLocale()
const { data: posts } = await useFetch('/api/blog', { default: () => [] })

const description = computed(() => locale.value === 'fr'
  ? "Articles techniques et retours d'exp\u00e9rience sur le d\u00e9veloppement, le management et l'IA."
  : 'Technical articles and experience reports on development, management and AI.'
)

useSeoMeta({
  title: 'Blog \u2014 Chetana YIN',
  description,
  ogTitle: 'Blog \u2014 Chetana YIN',
  ogDescription: description,
  ogType: 'website'
})
</script>

<style scoped>
.subtitle { color: var(--text-muted); margin-top: -2rem; margin-bottom: 3rem; }

.blog-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.5rem;
}

.empty { color: var(--text-dim); text-align: center; padding: 4rem; }
</style>
