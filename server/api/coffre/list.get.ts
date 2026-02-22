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
