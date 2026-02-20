<template>
  <NuxtLink :to="`/blog/${post.slug}`" class="blog-card">
    <div class="blog-date">{{ new Date(post.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US') }}</div>
    <h3>{{ title }}</h3>
    <p>{{ excerpt }}</p>
    <div class="tags">
      <span v-for="tag in (post.tags || [])" :key="tag" class="tag">{{ tag }}</span>
    </div>
    <span class="read-more">{{ t('blog.readmore') }} →</span>
  </NuxtLink>
</template>

<script setup lang="ts">
const { locale, t } = useLocale()

const props = defineProps<{
  post: {
    slug: string
    titleFr: string
    titleEn: string
    excerptFr: string
    excerptEn: string
    tags: string[] | null
    createdAt: string
  }
}>()

const title = computed(() => props.post[locale.value === 'fr' ? 'titleFr' : 'titleEn'])
const excerpt = computed(() => props.post[locale.value === 'fr' ? 'excerptFr' : 'excerptEn'])
</script>

<style scoped>
.blog-card {
  display: block;
  padding: 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: all 0.3s;
  text-decoration: none;
  color: var(--text);
}

.blog-card:hover { border-color: var(--accent); transform: translateY(-4px); }

.blog-date { font-size: 0.8rem; color: var(--accent-light); margin-bottom: 0.5rem; }

h3 { font-size: 1.15rem; margin-bottom: 0.8rem; }

p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; }

.read-more { color: var(--accent-light); font-size: 0.85rem; }
</style>
