const API = 'https://api.chetana.dev'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.name || !body.email || !body.content) {
    throw createError({ statusCode: 400, message: 'name, email and content are required' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({ statusCode: 400, message: 'Invalid email address' })
  }

  return await $fetch(`${API}/messages`, {
    method: 'POST',
    body: {
      name: body.name,
      email: body.email,
      content: body.content,
      honeypot: body.website,
    },
  }).catch((e) => {
    throw createError({ statusCode: e.statusCode ?? 500, message: e.data?.error ?? 'Error' })
  })
})
