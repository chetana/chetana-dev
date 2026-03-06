import { requireAuth } from '../../utils/auth'
import { signedGetUrl } from '../../utils/gcs'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const path = query.path as string

  if (!path?.startsWith('imagenie/')) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid path' })
  }

  const url = await signedGetUrl(path)
  return { url }
})
