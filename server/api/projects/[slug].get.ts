const API = 'https://api.chetana.dev'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, message: 'Slug is required' })

  return await $fetch(`${API}/projects/${slug}`).catch((e) => {
    throw createError({ statusCode: e.statusCode ?? 500, message: e.data?.error ?? 'Not found' })
  })
})
