const API = 'https://api.chetana.dev'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.postId || !body.authorName || !body.content) {
    throw createError({ statusCode: 400, message: 'postId, authorName and content are required' })
  }

  return await $fetch(`${API}/comments`, {
    method: 'POST',
    body: {
      post_id: Number(body.postId),
      author_name: body.authorName,
      content: body.content,
      honeypot: body.honeypot,
    },
  }).catch((e) => {
    throw createError({ statusCode: e.statusCode ?? 500, message: e.data?.error ?? 'Error' })
  })
})
