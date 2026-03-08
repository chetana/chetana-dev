import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const config = useRuntimeConfig()

  if (user.email !== config.medialistOwnerEmail) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const body = await readBody(event) as {
    type: 'anime' | 'game'
    id: number
    status: string
    platform?: string
  }

  if (!body.type || !body.id || !body.status) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  const endpoint = body.type === 'anime' ? '/sync/anime' : '/sync/game'
  const payload = body.type === 'anime'
    ? { mal_ids: [body.id], status: body.status }
    : { rawg_ids: [body.id], status: body.status, platform: body.platform ?? null }

  const result = await $fetch(`${config.chetakuApiUrl}${endpoint}`, {
    method: 'POST',
    headers: {
      'x-api-key': config.chetakuApiKey,
      'Content-Type': 'application/json',
    },
    body: payload,
  })

  return result
})
