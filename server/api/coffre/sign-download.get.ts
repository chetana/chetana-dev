import { Storage } from '@google-cloud/storage'
import { requireAuth } from '../../utils/auth'

function getStorage(): Storage {
  const credentials = JSON.parse(process.env.GCS_SERVICE_ACCOUNT_JSON!)
  return new Storage({ credentials })
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const bucket = process.env.GCS_BUCKET_NAME!

  const query = getQuery(event)
  const path = query.path as string

  if (!path) {
    throw createError({ statusCode: 400, statusMessage: 'path is required' })
  }

  const storage = getStorage()
  const file = storage.bucket(bucket).file(path)

  const [url] = await file.generateSignedUrl({
    version: 'v4',
    action: 'read',
    expires: Date.now() + 60 * 60 * 1000,
  })

  return { url }
})
