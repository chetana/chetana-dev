import { requireAuth } from '../../utils/auth'
import { getGcsBucket } from '../../utils/gcs'
import { imagenGenerate, STYLES } from '../../utils/imagen'

interface GalleryEntry {
  id: string
  ts: string
  author: string
  prompt: string
  style: string
  aspectRatio: string
  path: string
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)

  const body = await readBody(event) as {
    prompt: string
    style?: string
    aspectRatio?: string
    negativePrompt?: string
  }

  if (!body?.prompt?.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'prompt is required' })
  }

  const style = body.style && STYLES[body.style] !== undefined ? body.style : ''
  const aspectRatio = ['1:1', '16:9', '9:16', '4:3', '3:4'].includes(body.aspectRatio ?? '')
    ? body.aspectRatio!
    : '1:1'

  const result = await imagenGenerate(body.prompt.trim(), {
    style,
    aspectRatio,
    negativePrompt: body.negativePrompt,
  })

  // Save image to GCS
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const imagePath = `imagenie/${y}/${m}/${d}/${id}.png`

  const bucket = getGcsBucket()
  const imageBuffer = Buffer.from(result.base64, 'base64')
  await bucket.file(imagePath).save(imageBuffer, { contentType: result.mimeType })

  // Update gallery.json
  const galleryPath = 'imagenie/gallery.json'
  let gallery: GalleryEntry[] = []
  try {
    const [contents] = await bucket.file(galleryPath).download()
    gallery = JSON.parse(contents.toString('utf-8'))
  } catch (e: any) {
    if (e?.code !== 404) throw e
  }

  const entry: GalleryEntry = {
    id,
    ts: now.toISOString(),
    author: user.name.split(' ')[0],
    prompt: body.prompt.trim(),
    style,
    aspectRatio,
    path: imagePath,
  }

  gallery.unshift(entry)
  await bucket.file(galleryPath).save(JSON.stringify(gallery), { contentType: 'application/json' })

  return { id, base64: result.base64, mimeType: result.mimeType, entry }
})
