import { inject } from '@vercel/analytics'

export default defineNuxtPlugin(() => {
  if (process.client) {
    inject()
  }
})
