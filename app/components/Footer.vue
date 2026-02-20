<template>
  <footer>
    {{ t('footer.text') }} &mdash; {{ new Date().getFullYear() }}
  </footer>
</template>

<script setup lang="ts">
const { t } = useLocale()
</script>

<style scoped>
footer {
  text-align: center;
  padding: 3rem 2rem;
  color: var(--text-dim);
  font-size: 0.85rem;
  border-top: 1px solid var(--border);
}
</style>
