<template>
  <div class="section" style="padding-top: 8rem;">
    <NuxtLink to="/blog" class="back-link">← Blog</NuxtLink>

    <div v-if="post">
      <div class="post-date">{{ new Date(post.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</div>
      <h1>{{ locale === 'fr' ? post.titleFr : post.titleEn }}</h1>

      <div class="tags" style="margin: 1.5rem 0;">
        <span v-for="tag in (post.tags || [])" :key="tag" class="tag">{{ tag }}</span>
      </div>

      <div class="post-content" v-html="renderedContent" />

      <CommentSection :post-id="post.id" />
    </div>

    <div v-else class="empty">
      {{ locale === 'fr' ? 'Article introuvable.' : 'Post not found.' }}
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale } = useLocale()
const route = useRoute()

const { data: post } = await useFetch(`/api/blog/${route.params.slug}`)

const renderedContent = computed(() => {
  if (!post.value) return ''
  const raw = locale.value === 'fr' ? post.value.contentFr : post.value.contentEn
  // Basic markdown-like rendering (headers, bold, paragraphs)
  return raw
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n\n/g, '</p><p>')
    .replace(/^/, '<p>')
    .replace(/$/, '</p>')
})

const postTitle = computed(() => {
  if (!post.value) return 'Blog'
  return locale.value === 'fr' ? post.value.titleFr : post.value.titleEn
})

const postDescription = computed(() => {
  if (!post.value) return ''
  return locale.value === 'fr' ? post.value.excerptFr : post.value.excerptEn
})

useSeoMeta({
  title: () => `${postTitle.value} \u2014 Chetana YIN`,
  description: postDescription,
  ogTitle: () => `${postTitle.value} \u2014 Chetana YIN`,
  ogDescription: postDescription,
  ogType: 'article',
  articlePublishedTime: post.value?.createdAt,
  articleTag: post.value?.tags
})

if (post.value) {
  useSchemaOrg([
    defineArticle({
      '@type': 'BlogPosting',
      headline: post.value.titleEn || post.value.titleFr,
      description: post.value.excerptEn || post.value.excerptFr,
      datePublished: post.value.createdAt,
      dateModified: post.value.updatedAt || post.value.createdAt,
      author: {
        name: 'Chetana YIN',
        url: 'https://chetana.dev'
      }
    })
  ])
}
</script>

<style scoped>
.back-link {
  color: var(--accent-light);
  text-decoration: none;
  font-size: 0.9rem;
  display: inline-block;
  margin-bottom: 2rem;
}

.post-date { color: var(--accent-light); font-size: 0.9rem; margin-bottom: 0.5rem; }

h1 { font-size: 2rem; margin-bottom: 1rem; }

.post-content {
  color: var(--text-muted);
  line-height: 1.8;
  max-width: 800px;
}

.post-content :deep(h2) {
  color: var(--text);
  font-size: 1.4rem;
  margin: 2rem 0 1rem;
}

.post-content :deep(h3) {
  color: var(--text);
  font-size: 1.2rem;
  margin: 1.5rem 0 0.8rem;
}

.post-content :deep(p) { margin-bottom: 1rem; }
.post-content :deep(strong) { color: var(--text); }

.empty { color: var(--text-dim); text-align: center; padding: 4rem; }
</style>
