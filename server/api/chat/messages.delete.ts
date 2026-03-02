import { requireAuth } from '../../utils/auth'
import { getGcsBucket } from '../../utils/gcs'
import type { ChatMessage } from './messages.get'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const query = getQuery(event)
  const y = String(query.y ?? '')
  const m = String(query.m ?? '')
  const d = String(query.d ?? '')
  const id = String(query.id ?? '')

  if (!y || !m || !d || !id) {
    throw createError({ statusCode: 400, statusMessage: 'y, m, d, id are required' })
  }

  const path = `chat/${y}/${m}/${d}.json`
  const bucket = getGcsBucket()

  let messages: ChatMessage[] = []
  try {
    const [contents] = await bucket.file(path).download()
    messages = JSON.parse(contents.toString('utf-8'))
  } catch (e: any) {
    if (e?.code === 404) throw createError({ statusCode: 404, statusMessage: 'No messages for this day' })
    throw createError({ statusCode: 502, statusMessage: 'Failed to read messages' })
  }

  const target = messages.find(m => m.id === id)
  if (!target) throw createError({ statusCode: 404, statusMessage: 'Message not found' })

  // Seul l'auteur peut supprimer son message
  const authorName = user.name?.split(' ')[0] ?? ''
  if (target.author !== authorName) {
    throw createError({ statusCode: 403, statusMessage: 'Cannot delete another user\'s message' })
  }

  const updated = messages.filter(m => m.id !== id)
  await bucket.file(path).save(JSON.stringify(updated), { contentType: 'application/json' })

  return { ok: true }
})
