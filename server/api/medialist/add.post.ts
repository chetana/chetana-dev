import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const config = useRuntimeConfig()

  if (user.email !== config.medialistOwnerEmail) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const body = await readBody(event) as {
    type: 'anime' | 'game' | 'movie' | 'series'
    id: number
    status: string
    platform?: string
  }

  if (!body.type || !body.id || !body.status) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  const endpointMap: Record<string, string> = {
    anime: '/sync/anime',
    game: '/sync/game',
    movie: '/sync/movie',
    series: '/sync/series',
  }
  const endpoint = endpointMap[body.type]
  if (!endpoint) throw createError({ statusCode: 400, statusMessage: 'Invalid type' })

  const idKey = body.type === 'anime' ? 'mal_ids' : body.type === 'game' ? 'rawg_ids' : 'tmdb_ids'
  const payload: Record<string, unknown> = { [idKey]: [body.id], status: body.status }
  if (body.type === 'game') payload.platform = body.platform ?? null

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
