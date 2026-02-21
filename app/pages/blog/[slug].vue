<template>
  <div class="section" style="padding-top: 8rem;">
    <NuxtLink to="/blog" class="back-link">← Blog</NuxtLink>

    <div v-if="post">
      <div class="post-date">{{ new Date(post.createdAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</div>
      <h1>{{ localeField(post, 'title') }}</h1>

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
const { locale, localeField } = useLocale()
const route = useRoute()

const { data: post } = await useFetch(`/api/blog/${route.params.slug}`)

const renderedContent = computed(() => {
  if (!post.value) return ''
  const raw = localeField(post.value, 'content')
  // Basic markdown-like rendering (headers, bold, paragraphs)
  // Process block-level elements first
  let html = raw
    // Horizontal rules
    .replace(/^---$/gm, '<hr>')
    // Headers
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')

  // Process unordered lists (consecutive `- ` lines)
  html = html.replace(/(^- .+$(\n- .+$)*)/gm, (match) => {
    const items = match.split('\n').map(line => `<li>${line.replace(/^- /, '')}</li>`).join('\n')
    return `<ul>${items}</ul>`
  })

  // Process ordered lists (consecutive `1. ` lines)
  html = html.replace(/(^\d+\. .+$(\n\d+\. .+$)*)/gm, (match) => {
    const items = match.split('\n').map(line => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('\n')
    return `<ol>${items}</ol>`
  })

  // Process markdown tables
  html = html.replace(/(^\|.+\|$(\n\|.+\|$)+)/gm, (match) => {
    const rows = match.trim().split('\n')
    const headerCells = rows[0].split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('')
    const bodyRows = rows.slice(2) // skip header + separator
      .map(row => {
        const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('')
        return `<tr>${cells}</tr>`
      }).join('\n')
    return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`
  })

  // Inline formatting
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')

  // Paragraphs: split on double newlines, wrap non-block content in <p>
  html = html
    .split(/\n\n/)
    .map(block => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (/^<(h[23]|ul|ol|hr|blockquote|table)/.test(trimmed)) return trimmed
      // Convert single newlines to <br> for line breaks within paragraphs
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')

  return html
})

const postTitle = computed(() => {
  if (!post.value) return 'Blog'
  return localeField(post.value, 'title')
})

const postDescription = computed(() => {
  if (!post.value) return ''
  return localeField(post.value, 'excerpt')
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
.post-content :deep(em) { font-style: italic; }

.post-content :deep(ul),
.post-content :deep(ol) {
  padding-left: 1.5rem;
  margin-bottom: 1rem;
}

.post-content :deep(li) {
  margin-bottom: 0.4rem;
}

.post-content :deep(hr) {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2rem 0;
}

.post-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1.5rem 0;
  font-size: 0.9rem;
  overflow-x: auto;
  display: block;
}

.post-content :deep(thead) {
  background: var(--bg-card, rgba(196, 150, 60, 0.08));
}

.post-content :deep(th),
.post-content :deep(td) {
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--border);
  text-align: left;
}

.post-content :deep(th) {
  color: var(--text);
  font-weight: 600;
}

.post-content :deep(tbody tr:hover) {
  background: rgba(196, 150, 60, 0.04);
}

@media (max-width: 768px) {
  h1 { font-size: 1.5rem; }
  .post-content :deep(h2) { font-size: 1.2rem; }
  .post-content :deep(h3) { font-size: 1.1rem; }
}

.empty { color: var(--text-dim); text-align: center; padding: 4rem; }
</style>
