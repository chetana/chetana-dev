import { requireAuth } from '../../utils/auth'
import { getGcsBucket } from '../../utils/gcs'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event)
  const { path, contentType } = body as { path: string; contentType: string }

  if (!path || !contentType) {
    throw createError({ statusCode: 400, statusMessage: 'path and contentType are required' })
  }

  try {
    const [url] = await getGcsBucket().file(path).getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: Date.now() + 15 * 60 * 1000,
      contentType,
    })
    return { url }
  } catch (e: any) {
    throw createError({ statusCode: 500, statusMessage: e?.message ?? String(e) })
  }
})
