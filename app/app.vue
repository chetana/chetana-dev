<template>
  <div>
    <Nav />
    <NuxtPage />
    <Footer />
  </div>
</template>

<script setup lang="ts">
const { locale } = useLocale()

useHead({
  htmlAttrs: {
    lang: () => locale.value
  }
})

useSchemaOrg([
  definePerson({
    name: 'Chetana YIN',
    jobTitle: 'Engineering Manager',
    url: 'https://chetana.dev',
    sameAs: [
      'https://www.linkedin.com/in/chetana-yin-79b36754/'
    ]
  })
])
</script>
