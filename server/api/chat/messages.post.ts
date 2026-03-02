import { requireAuth } from '../../utils/auth'
import { getGcsBucket } from '../../utils/gcs'
import { geminiTranslateAll } from '../../utils/vertex'
import type { ChatMessage } from './messages.get'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const query = getQuery(event)
  const y = String(query.y ?? '')
  const m = String(query.m ?? '')
  const d = String(query.d ?? '')

  if (!y || !m || !d) {
    throw createError({ statusCode: 400, statusMessage: 'y, m, d are required' })
  }

  const body = await readBody(event) as { author: string; text: string; fr?: string; en?: string; kh?: string }

  if (!body?.author || !body?.text) {
    throw createError({ statusCode: 400, statusMessage: 'author and text are required' })
  }

  // Traduit toujours en 3 langues — utilise les valeurs fournies si déjà disponibles
  let fr = body.fr ?? ''
  let en = body.en ?? ''
  let kh = body.kh ?? ''

  if ((!fr || !en || !kh) && body.text.trim().length >= 2) {
    const translations = await geminiTranslateAll(body.text).catch(() => ({ fr: '', en: '', kh: '' }))
    if (!fr) fr = translations.fr
    if (!en) en = translations.en
    if (!kh) kh = translations.kh
  }

  const newMessage: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    author: body.author,
    text: body.text,
    fr,
    en,
    kh,
    ts: new Date().toISOString(),
  }

  const path = `chat/${y}/${m}/${d}.json`
  const bucket = getGcsBucket()

  let messages: ChatMessage[] = []
  try {
    const [contents] = await bucket.file(path).download()
    messages = JSON.parse(contents.toString('utf-8'))
  } catch (e: any) {
    if (e?.code !== 404) {
      throw createError({ statusCode: 502, statusMessage: 'Failed to read messages' })
    }
  }

  messages.push(newMessage)
  await bucket.file(path).save(JSON.stringify(messages), { contentType: 'application/json' })

  return newMessage
})
