const API = 'https://api.chetana.dev'

export default defineEventHandler(async () => {
  return await $fetch(`${API}/blog`)
})
