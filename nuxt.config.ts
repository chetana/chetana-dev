// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-05-15',
  future: {
    compatibilityVersion: 4
  },
  devtools: { enabled: true },
  modules: ['@nuxtjs/seo', '@vite-pwa/nuxt'],
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'Chetana YIN',
      short_name: 'Chetana',
      start_url: '/projects/health',
      display: 'standalone',
      theme_color: '#c4963c',
      background_color: '#f5f2ec',
      icons: [
        { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
      ]
    },
    workbox: {
      importScripts: ['/push-sw.js'],
      navigateFallback: undefined,
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'google-fonts-cache',
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
          }
        },
        {
          urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
          handler: 'CacheFirst',
          options: {
            cacheName: 'gstatic-fonts-cache',
            expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 }
          }
        }
      ]
    }
  },
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
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#c4963c' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
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
    preset: 'vercel',
    externals: {
      external: ['@google-cloud/storage']
    }
  },
  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL || '',
    googleClientId: process.env.GOOGLE_CLIENT_ID || '',
    vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
    cronSecret: process.env.CRON_SECRET || '',
    gcsBucketName: process.env.GCS_BUCKET_NAME || '',
    gcsServiceAccountJson: process.env.GCS_SERVICE_ACCOUNT_JSON || '',
    public: {
      vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
      commitSha: (process.env.VERCEL_GIT_COMMIT_SHA || 'local').slice(0, 7),
      googleClientId: process.env.GOOGLE_CLIENT_ID || ''
    }
  }
})
