const API = 'https://api.chetana.dev'

export default defineEventHandler(async (event) => {
  const postId = getRouterParam(event, 'postId')
  if (!postId || isNaN(Number(postId))) {
    throw createError({ statusCode: 400, message: 'Valid postId is required' })
  }

  return await $fetch(`${API}/comments/${postId}`)
})
