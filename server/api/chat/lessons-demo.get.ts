import { requireAuth } from '../../utils/auth'
import { getGcsBucket } from '../../utils/gcs'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const bucket = getGcsBucket()
  try {
    const [contents] = await bucket.file('chat/lessons-demo.json').download()
    return JSON.parse(contents.toString('utf-8'))
  } catch (e: any) {
    if (e?.code === 404) return []
    throw createError({ statusCode: 502, statusMessage: 'Failed to read demo lessons' })
  }
})
