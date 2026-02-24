import { requireAuth } from '../../utils/auth'
import { getGcsBucket } from '../../utils/gcs'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const y = String(query.y ?? '')
  const m = String(query.m ?? '')
  const d = String(query.d ?? '')

  if (!y || !m || !d) {
    throw createError({ statusCode: 400, statusMessage: 'y, m, d are required' })
  }

  const body = await readBody(event)
  const path = `${y}/${m}/${d}/meta.json`
  const bucket = getGcsBucket()

  await bucket.file(path).save(JSON.stringify(body), { contentType: 'application/json' })

  return { ok: true }
})
