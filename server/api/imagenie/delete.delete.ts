import { requireAuth } from '../../utils/auth'
import { getGcsBucket } from '../../utils/gcs'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const body = await readBody(event) as { id: string }

  if (!body?.id) {
    throw createError({ statusCode: 400, statusMessage: 'id is required' })
  }

  const bucket = getGcsBucket()
  const galleryPath = 'imagenie/gallery.json'

  let gallery: { id: string; path: string }[] = []
  try {
    const [contents] = await bucket.file(galleryPath).download()
    gallery = JSON.parse(contents.toString('utf-8'))
  } catch (e: any) {
    if (e?.code !== 404) throw e
  }

  const entry = gallery.find(e => e.id === body.id)
  if (!entry) {
    throw createError({ statusCode: 404, statusMessage: 'Entry not found' })
  }

  // Delete image file
  try {
    await bucket.file(entry.path).delete()
  } catch {
    // File may already be gone — continue
  }

  // Update gallery
  const updated = gallery.filter(e => e.id !== body.id)
  await bucket.file(galleryPath).save(JSON.stringify(updated), { contentType: 'application/json' })

  return { deleted: body.id }
})
