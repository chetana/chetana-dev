// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  future: {
    compatibilityVersion: 4
  },
  devtools: { enabled: true },
  modules: ['@nuxtjs/seo'],
  css: ['~/assets/css/main.css'],
  site: {
    url: 'https://chetana.dev',
    name: 'Chetana YIN',
    description: 'Engineering Manager & hands-on tech lead avec 13 ans d\'exp\u00e9rience. Portfolio, projets et blog technique.',
    defaultLocale: 'fr'
  },
  ogImage: {
    enabled: false
  },
  sitemap: {
    sources: ['/api/__sitemap__/urls']
  },
  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Khmer:wght@400;700&display=swap' }
      ]
    }
  },
  routeRules: {
    '/cv': { robots: false }
  },
  nitro: {
    preset: 'vercel'
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || ''
  }
})
