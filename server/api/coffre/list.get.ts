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
  const query = getQuery(event)
  const prefix = (query.prefix as string) ?? ''

  const storage = getStorage()

  // getFiles with delimiter returns [files, nextPageToken, apiResponse]
  const [files, , apiResponse] = await storage.bucket(bucket).getFiles({
    prefix,
    delimiter: '/',
    autoPaginate: false,
  })

  // Sub-directory prefixes come in apiResponse.prefixes
  const prefixes: string[] = (apiResponse as any)?.prefixes ?? []

  // files excludes the "folder" placeholder objects
  const items = files
    .filter((f) => f.name !== prefix && !f.name.endsWith('/'))
    .map((f) => ({
      name: f.name,
      size: Number(f.metadata?.size ?? 0),
      contentType: (f.metadata as any)?.contentType ?? '',
      updated: (f.metadata as any)?.updated ?? '',
    }))

  return { prefixes, items }
})
