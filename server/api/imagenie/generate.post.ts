import { requireAuth } from '../../utils/auth'
import { getGcsBucket } from '../../utils/gcs'
import { imagenGenerate, imagenBgSwap, imagenInpaint, STYLES, type InpaintMode } from '../../utils/imagen'

interface GalleryEntry {
  id: string
  ts: string
  author: string
  prompt: string
  style: string
  aspectRatio: string
  path: string
  mode?: 'generate' | 'bgswap' | 'outpaint' | 'inpaint'
}

export default defineEventHandler(async (event) => {
  throw createError({ statusCode: 503, message: 'Imagenie is currently disabled' })
  const user = await requireAuth(event)

  const body = await readBody(event) as {
    mode?: 'generate' | 'bgswap' | 'outpaint' | 'inpaint'
    // generate fields
    prompt?: string
    style?: string
    aspectRatio?: string
    negativePrompt?: string
    // bgswap fields
    subjectBase64?: string
    backgroundPrompt?: string
    // outpaint / inpaint fields
    imageBase64?: string
    maskBase64?: string
    inpaintPrompt?: string
    inpaintMode?: InpaintMode
  }

  const mode = body?.mode ?? 'generate'

  let result: { base64: string; mimeType: string }
  let prompt: string
  let style = ''
  let aspectRatio = '1:1'

  if (mode === 'bgswap') {
    if (!body?.subjectBase64?.trim()) throw createError({ statusCode: 400, statusMessage: 'subjectBase64 is required' })
    if (!body?.backgroundPrompt?.trim()) throw createError({ statusCode: 400, statusMessage: 'backgroundPrompt is required' })
    prompt = body.backgroundPrompt.trim()
    try {
      result = await imagenBgSwap(body.subjectBase64.trim(), prompt)
    } catch (err: any) {
      console.error('[imagenie/generate] imagenBgSwap failed:', err?.message)
      throw createError({ statusCode: 502, statusMessage: err?.message ?? 'Imagen BGSWAP failed' })
    }

  } else if (mode === 'outpaint' || mode === 'inpaint') {
    if (!body?.imageBase64?.trim()) throw createError({ statusCode: 400, statusMessage: 'imageBase64 is required' })
    if (!body?.maskBase64?.trim()) throw createError({ statusCode: 400, statusMessage: 'maskBase64 is required' })

    const validModes: InpaintMode[] = ['EDIT_MODE_OUTPAINT', 'EDIT_MODE_INPAINT_INSERTION', 'EDIT_MODE_INPAINT_REMOVAL']
    const apiMode: InpaintMode = body.inpaintMode && validModes.includes(body.inpaintMode)
      ? body.inpaintMode
      : mode === 'outpaint' ? 'EDIT_MODE_OUTPAINT' : 'EDIT_MODE_INPAINT_INSERTION'

    prompt = body.inpaintPrompt?.trim() || ''
    try {
      result = await imagenInpaint(body.imageBase64.trim(), body.maskBase64.trim(), prompt, apiMode)
    } catch (err: any) {
      console.error(`[imagenie/generate] imagenInpaint(${apiMode}) failed:`, err?.message)
      throw createError({ statusCode: 502, statusMessage: err?.message ?? 'Imagen inpaint failed' })
    }

  } else {
    if (!body?.prompt?.trim()) throw createError({ statusCode: 400, statusMessage: 'prompt is required' })
    style = body.style && STYLES[body.style] !== undefined ? body.style : ''
    aspectRatio = ['1:1', '16:9', '9:16', '4:3', '3:4'].includes(body.aspectRatio ?? '') ? body.aspectRatio! : '1:1'
    prompt = body.prompt.trim()
    try {
      result = await imagenGenerate(prompt, { style, aspectRatio, negativePrompt: body.negativePrompt })
    } catch (err: any) {
      console.error('[imagenie/generate] imagenGenerate failed:', err?.message)
      throw createError({ statusCode: 502, statusMessage: err?.message ?? 'Imagen generation failed' })
    }
  }

  // Save to GCS
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
  const imagePath = `imagenie/${y}/${m}/${d}/${id}.png`

  const bucket = getGcsBucket()
  await bucket.file(imagePath).save(Buffer.from(result.base64, 'base64'), { contentType: result.mimeType })

  const galleryPath = 'imagenie/gallery.json'
  let gallery: GalleryEntry[] = []
  try {
    const [contents] = await bucket.file(galleryPath).download()
    gallery = JSON.parse(contents.toString('utf-8'))
  } catch (e: any) {
    if (e?.code !== 404) throw e
  }

  const entry: GalleryEntry = { id, ts: now.toISOString(), author: user.name.split(' ')[0], prompt, style, aspectRatio, path: imagePath, mode }
  gallery.unshift(entry)
  await bucket.file(galleryPath).save(JSON.stringify(gallery), { contentType: 'application/json' })

  return { id, base64: result.base64, mimeType: result.mimeType, entry }
})
