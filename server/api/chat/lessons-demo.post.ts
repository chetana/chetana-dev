import { requireAuth } from '../../utils/auth'
import { getGcsBucket } from '../../utils/gcs'

interface LessonItem {
  original: string
  corrected: string
  explanation: string
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const body = await readBody(event) as {
    lessons: LessonItem[]
    lang: string
  }

  if (!body?.lessons?.length) {
    throw createError({ statusCode: 400, statusMessage: 'lessons are required' })
  }

  const bucket = getGcsBucket()
  const path = 'chat/lessons-demo.json'

  let stored: object[] = []
  try {
    const [contents] = await bucket.file(path).download()
    stored = JSON.parse(contents.toString('utf-8'))
  } catch (e: any) {
    if (e?.code !== 404) {
      throw createError({ statusCode: 502, statusMessage: 'Failed to read demo lessons' })
    }
  }

  const now = Date.now()
  const author = user.name.split(' ')[0]
  const ts = new Date().toISOString()

  const entries = body.lessons.map((l, i) => ({
    id: `${now + i}-${Math.random().toString(36).slice(2, 7)}`,
    ts,
    author,
    original: l.original,
    corrected: l.corrected,
    lesson: l.explanation,
    lang: body.lang || 'fr',
  }))

  stored.unshift(...entries)
  await bucket.file(path).save(JSON.stringify(stored), { contentType: 'application/json' })

  return { saved: entries.length }
})
