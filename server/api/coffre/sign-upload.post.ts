import { Storage } from '@google-cloud/storage'
import { requireAuth } from '../../utils/auth'

let _storage: Storage | null = null

function getStorage(): Storage {
  if (!_storage) {
    const config = useRuntimeConfig()
    const credentials = JSON.parse(config.gcsServiceAccountJson)
    _storage = new Storage({ credentials })
  }
  return _storage
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const config = useRuntimeConfig()
  const bucket = config.gcsBucketName as string

  const body = await readBody(event)
  const { path, contentType } = body as { path: string; contentType: string }

  if (!path || !contentType) {
    throw createError({ statusCode: 400, statusMessage: 'path and contentType are required' })
  }

  const storage = getStorage()
  const file = storage.bucket(bucket).file(path)

  const [url] = await file.generateSignedUrl({
    version: 'v4',
    action: 'write',
    expires: Date.now() + 15 * 60 * 1000,
    contentType,
  })

  return { url }
})
