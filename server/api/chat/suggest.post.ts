import { requireAuth } from '../../utils/auth'
import { geminiSuggest } from '../../utils/vertex'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event) as { text: string; lang: 'fr' | 'kh' }

  if (!body?.text || !body?.lang) {
    throw createError({ statusCode: 400, statusMessage: 'text and lang are required' })
  }

  if (body.text.trim().length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'text too short' })
  }

  try {
    const suggestion = await geminiSuggest(body.text, body.lang)
    return suggestion
  } catch (e) {
    throw createError({ statusCode: 502, statusMessage: 'Gemini suggestion failed' })
  }
})
