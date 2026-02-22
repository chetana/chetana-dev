import { requireAuth } from '../../utils/auth'
import { getGcsBucket } from '../../utils/gcs'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const path = query.path as string

  if (!path) {
    throw createError({ statusCode: 400, statusMessage: 'path is required' })
  }

  const [url] = await getGcsBucket().file(path).getSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000,
  })

  return { url }
})
