import { Storage } from '@google-cloud/storage'
import { requireAuth } from '../../utils/auth'

function getStorage(): Storage {
  const credentials = JSON.parse(process.env.GCS_SERVICE_ACCOUNT_JSON!)
  return new Storage({ credentials })
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const bucket = process.env.GCS_BUCKET_NAME!

  const body = await readBody(event)
  const { path, contentType } = body as { path: string; contentType: string }

  if (!path || !contentType) {
    throw createError({ statusCode: 400, statusMessage: 'path and contentType are required' })
  }

  try {
    const storage = getStorage()
    const file = storage.bucket(bucket).file(path)

    const [url] = await file.getSignedUrl({
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
