import { requireAuth } from '../../utils/auth'
import { geminiSuggest } from '../../utils/vertex'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const body = await readBody(event) as { text: string }

  if (!body?.text) {
    throw createError({ statusCode: 400, statusMessage: 'text is required' })
  }

  if (body.text.trim().length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'text too short' })
  }

  // Détermine la langue de l'auteur depuis le token Google (pas le client)
  // Chet/Chetana/Chétana → 'fr', tout autre → 'kh'
  const firstName = user.name.split(' ')[0]
  const normalized = firstName.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  const authorLang: 'fr' | 'kh' = /^(chet|chetana)$/i.test(normalized) ? 'fr' : 'kh'

  try {
    const suggestion = await geminiSuggest(body.text, authorLang)
    return suggestion
  } catch (e) {
    throw createError({ statusCode: 502, statusMessage: 'Gemini suggestion failed' })
  }
})
