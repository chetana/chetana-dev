import { requireAuth } from '../../utils/auth'
import { getGcsBucket } from '../../utils/gcs'

export interface ChatMessage {
  id: string
  author: string
  text: string
  fr: string
  en: string
  kh: string
  ts: string
  image?: string   // chemin GCS de l'image (optionnel)
  source?: 'audio' // indique que le message vient d'un vocal
}

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const y = String(query.y ?? '')
  const m = String(query.m ?? '')
  const d = String(query.d ?? '')

  if (!y || !m || !d) {
    throw createError({ statusCode: 400, statusMessage: 'y, m, d are required' })
  }

  const path = `chat/${y}/${m}/${d}.json`
  const bucket = getGcsBucket()

  try {
    const [contents] = await bucket.file(path).download()
    return JSON.parse(contents.toString('utf-8')) as ChatMessage[]
  } catch (e: any) {
    if (e?.code === 404) return []
    throw createError({ statusCode: 502, statusMessage: 'Failed to read messages' })
  }
})
