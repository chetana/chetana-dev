import { requireAuth } from '../../utils/auth'
import { signedPutUrl } from '../../utils/gcs'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event)
  const { path, contentType } = body as { path: string; contentType: string }

  if (!path || !contentType) {
    throw createError({ statusCode: 400, statusMessage: 'path and contentType are required' })
  }

  try {
    const url = signedPutUrl(path, contentType)
    return { url }
  } catch (e: any) {
    throw createError({ statusCode: 500, statusMessage: e?.message ?? String(e) })
  }
})
