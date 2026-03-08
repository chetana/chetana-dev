import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const config = useRuntimeConfig()

  if (user.email !== config.medialistOwnerEmail) {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const id = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, statusMessage: 'Missing id' })

  const body = await readBody(event) as {
    status?: string
    platform?: string
    episodes_watched?: number
    score?: number
    notes?: string
  }

  const result = await $fetch(`${config.chetakuApiUrl}/media/${id}`, {
    method: 'PATCH',
    headers: {
      'x-api-key': config.chetakuApiKey,
      'Content-Type': 'application/json',
    },
    body,
  })

  return result
})
