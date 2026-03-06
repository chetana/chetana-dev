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
const { locale, t, localeField } = useLocale()

const props = defineProps<{
  post: Record<string, any> & {
    slug: string
    titleFr: string
    titleEn: string
    excerptFr: string
    excerptEn: string
    tags: string[] | null
    createdAt: string
  }
}>()

const title = computed(() => localeField(props.post, 'title'))
const excerpt = computed(() => localeField(props.post, 'excerpt'))
</script>

<style scoped>
.blog-card {
  display: block;
  padding: 1.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius, 14px);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  text-decoration: none;
  color: var(--text);
  box-shadow: var(--shadow-sm);
}

.blog-card:hover {
  border-color: rgba(196,150,60,0.45);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.blog-date {
  font-size: 0.78rem;
  color: var(--accent);
  margin-bottom: 0.6rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

h3 { font-size: 1.15rem; margin-bottom: 0.8rem; font-weight: 700; line-height: 1.35; }

p { color: var(--text-muted); font-size: 0.9rem; margin-bottom: 1rem; line-height: 1.6; }

.read-more {
  color: var(--accent-light);
  font-size: 0.85rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  transition: gap 0.2s ease, color 0.2s ease;
}

.blog-card:hover .read-more {
  color: var(--accent);
  gap: 0.55rem;
}
</style>
