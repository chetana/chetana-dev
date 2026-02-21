<template>
  <footer>
    <div>{{ t('footer.text') }} &mdash; {{ new Date().getFullYear() }}</div>
    <div class="footer-meta">
      v{{ version }}
      <span class="separator">•</span>
      <span class="commit" :title="`Commit: ${commitSha}`">{{ commitSha }}</span>
      <span class="separator">•</span>
      <time :datetime="deployDate">{{ deployDateFormatted }}</time>
    </div>
  </footer>
</template>

<script setup lang="ts">
import pkg from '~/package.json'

const { t } = useLocale()
const config = useRuntimeConfig()

const version = pkg.version
const commitSha = config.public.commitSha || 'local'

const deployDate = new Date().toISOString()
const deployDateFormatted = new Date().toLocaleDateString('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: '2-digit'
})
</script>

<style scoped>
footer {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-dim);
  font-size: 0.85rem;
  border-top: 1px solid var(--border);
}

.footer-meta {
  margin-top: 0.5rem;
  font-size: 0.75rem;
  color: var(--text-muted);
  letter-spacing: 0.02em;
}

.commit {
  font-family: 'Monaco', 'Courier New', monospace;
  font-size: 0.7rem;
  color: var(--accent-light);
  cursor: help;
}

.separator {
  margin: 0 0.35rem;
  opacity: 0.5;
}

time {
  white-space: nowrap;
}
</style>
