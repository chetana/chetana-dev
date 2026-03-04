import { requireAuth } from '../../utils/auth'
import { geminiTranscribeAndTranslate } from '../../utils/vertex'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const body = await readBody(event) as { audio: string; mimeType: string }

  if (!body?.audio || !body?.mimeType) {
    throw createError({ statusCode: 400, statusMessage: 'audio and mimeType are required' })
  }

  const result = await geminiTranscribeAndTranslate(body.audio, body.mimeType, user.name.split(' ')[0])
  return result
})
