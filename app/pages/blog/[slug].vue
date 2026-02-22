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
  let html = raw

  // 1. Extraire les blocs de code (```lang\n...\n```) avant tout autre traitement
  //    car ils peuvent contenir des \n\n et du markdown qui ne doit pas être rendu
  const codeBlocks: string[] = []
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
    const langAttr = lang ? ` class="language-${lang}"` : ''
    codeBlocks.push(`<pre><code${langAttr}>${escaped}</code></pre>`)
    return `\n\n__CODEBLOCK_${codeBlocks.length - 1}__\n\n`
  })

  // 2. Éléments block
  html = html
    .replace(/^---$/gm, '<hr>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')

  // Listes non ordonnées
  html = html.replace(/(^- .+$(\n- .+$)*)/gm, (match) => {
    const items = match.split('\n').map(line => `<li>${line.replace(/^- /, '')}</li>`).join('\n')
    return `<ul>${items}</ul>`
  })

  // Listes ordonnées
  html = html.replace(/(^\d+\. .+$(\n\d+\. .+$)*)/gm, (match) => {
    const items = match.split('\n').map(line => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('\n')
    return `<ol>${items}</ol>`
  })

  // Tableaux
  html = html.replace(/(^\|.+\|$(\n\|.+\|$)+)/gm, (match) => {
    const rows = match.trim().split('\n')
    const headerCells = rows[0].split('|').filter(c => c.trim()).map(c => `<th>${c.trim()}</th>`).join('')
    const bodyRows = rows.slice(2)
      .map(row => {
        const cells = row.split('|').filter(c => c.trim()).map(c => `<td>${c.trim()}</td>`).join('')
        return `<tr>${cells}</tr>`
      }).join('\n')
    return `<table><thead><tr>${headerCells}</tr></thead><tbody>${bodyRows}</tbody></table>`
  })

  // 3. Formatage inline — après extraction des blocs code
  html = html
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`([^`\n]+)`/g, '<code>$1</code>')  // code inline

  // 4. Paragraphes
  html = html
    .split(/\n\n/)
    .map(block => {
      const trimmed = block.trim()
      if (!trimmed) return ''
      if (/^<(h[23]|ul|ol|hr|blockquote|table|pre)/.test(trimmed)) return trimmed
      if (/^__CODEBLOCK_\d+__$/.test(trimmed)) return trimmed  // placeholder
      return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`
    })
    .join('\n')

  // 5. Réinjecter les blocs de code à la place des placeholders
  codeBlocks.forEach((block, i) => {
    html = html.replace(`<p>__CODEBLOCK_${i}__</p>`, block)
    html = html.replace(`__CODEBLOCK_${i}__`, block)
  })

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

.post-content :deep(pre) {
  background: var(--bg-card, rgba(255, 255, 255, 0.04));
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1.2rem 1.4rem;
  margin: 1.5rem 0;
  overflow-x: auto;
  font-size: 0.85rem;
  line-height: 1.6;
}

.post-content :deep(pre code) {
  background: none;
  padding: 0;
  border-radius: 0;
  font-size: inherit;
  color: var(--text-muted);
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
}

.post-content :deep(code) {
  background: var(--bg-card, rgba(255, 255, 255, 0.06));
  border: 1px solid var(--border);
  border-radius: 3px;
  padding: 0.15em 0.4em;
  font-size: 0.85em;
  font-family: 'Fira Code', 'Cascadia Code', 'Consolas', monospace;
  color: var(--accent-light);
}

@media (max-width: 768px) {
  h1 { font-size: 1.5rem; }
  .post-content :deep(h2) { font-size: 1.2rem; }
  .post-content :deep(h3) { font-size: 1.1rem; }
}

.empty { color: var(--text-dim); text-align: center; padding: 4rem; }
</style>
