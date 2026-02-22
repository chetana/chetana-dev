import { requireAuth } from '../../utils/auth'
import { getGcsBucket } from '../../utils/gcs'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const prefix = (query.prefix as string) ?? ''
  const bucket = getGcsBucket()

  const [files, , apiResponse] = await bucket.getFiles({
    prefix,
    delimiter: '/',
    autoPaginate: false,
  })

  const prefixes: string[] = (apiResponse as any)?.prefixes ?? []
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
