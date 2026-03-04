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

  const body = await readBody(event) as { author: string; text?: string; fr?: string; en?: string; kh?: string; lang?: string; lessons?: { original: string; corrected: string; explanation: string }[]; image?: string; source?: 'audio' }

  if (!body?.author || (!body?.text && !body?.image)) {
    throw createError({ statusCode: 400, statusMessage: 'author and text or image are required' })
  }

  const text = body.text ?? ''

  // Traduit seulement si du texte est présent
  let fr = body.fr ?? ''
  let en = body.en ?? ''
  let kh = body.kh ?? ''
  let lang = body.lang ?? ''

  if (text.trim().length >= 2 && (!fr || !en || !kh)) {
    const translations = await geminiTranslateAll(text, body.author).catch(() => ({ fr: '', en: '', kh: '', lang: '' }))
    if (!fr) fr = translations.fr
    if (!en) en = translations.en
    if (!kh) kh = translations.kh
    if (!lang) lang = translations.lang ?? ''
  }

  const newMessage: ChatMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    author: body.author,
    text,
    fr,
    en,
    kh,
    ...(lang ? { lang } : {}),
    ts: new Date().toISOString(),
    ...(body.image ? { image: body.image } : {}),
    ...(body.source ? { source: body.source } : {}),
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

  // Sauvegarde les leçons individuelles si présentes
  if (body.lessons && body.lessons.length > 0) {
    try {
      const lessonsPath = 'chat/lessons.json'
      let stored: object[] = []
      try {
        const [lc] = await bucket.file(lessonsPath).download()
        stored = JSON.parse(lc.toString('utf-8'))
      } catch {}
      const now = Date.now()
      const entries = body.lessons.map((l, i) => ({
        id: `${now + i}-${Math.random().toString(36).slice(2, 7)}`,
        ts: newMessage.ts,
        author: body.author,
        original: l.original,
        corrected: l.corrected,
        lesson: l.explanation,
        lang: lang || 'fr',
      }))
      stored.unshift(...entries)
      await bucket.file(lessonsPath).save(JSON.stringify(stored), { contentType: 'application/json' })
    } catch {}
  }

  return newMessage
})
