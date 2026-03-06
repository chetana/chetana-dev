import { getAccessToken } from './vertex'

const STYLES: Record<string, string> = {
  '': '',
  'Aquarelle': ', watercolor painting, soft wet brushstrokes, delicate pastel colors',
  'Cinématique': ', cinematic photography, dramatic lighting, 35mm film, shallow depth of field',
  'Manga': ', manga illustration, clean line art, black and white, Japanese anime style',
  'Illustration': ', digital illustration, vibrant colors, flat design, editorial art style',
  'Photo réaliste': ', hyperrealistic photography, 8K resolution, sharp details, professional camera',
}

export { STYLES }

export interface ImagenOptions {
  aspectRatio?: string
  style?: string
  negativePrompt?: string
}

export interface ImagenResult {
  base64: string
  mimeType: string
}

export const BG_PRESETS: Array<{ label: string; prompt: string }> = [
  { label: 'Aucun', prompt: '' },
  { label: 'Plage', prompt: 'tropical beach at golden hour, turquoise water, palm trees' },
  { label: 'Forêt', prompt: 'lush green forest, soft sunlight through trees, moss ground' },
  { label: 'Ville nuit', prompt: 'city at night, bokeh lights, rain reflections on pavement' },
  { label: 'Studio', prompt: 'professional photo studio, white seamless background, soft lighting' },
  { label: 'Montagne', prompt: 'mountain landscape, dramatic clouds, snow peaks, golden hour' },
]

export async function imagenBgSwap(subjectBase64: string, backgroundPrompt: string): Promise<ImagenResult> {
  const token = await getAccessToken()
  const project = process.env.VERTEX_PROJECT_ID ?? 'cykt-399216'
  const location = process.env.VERTEX_LOCATION ?? 'us-central1'
  const model = 'imagen-3.0-capability-001'

  const body = {
    instances: [{
      prompt: backgroundPrompt || 'a clean neutral background',
      referenceImages: [{
        referenceType: 'REFERENCE_TYPE_RAW',
        referenceId: 1,
        referenceImage: { bytesBase64Encoded: subjectBase64 },
      }],
    }],
    parameters: {
      editConfig: { editMode: 'EDIT_MODE_BGSWAP' },
      sampleCount: 1,
    },
  }

  const res = await fetch(
    `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:predict`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  const data = await res.json() as any
  if (!res.ok) {
    console.error('[imagen-bgswap] error', res.status, JSON.stringify(data))
    throw new Error(`Imagen BGSWAP ${res.status}: ${data?.error?.message ?? 'unknown'}`)
  }

  const prediction = data?.predictions?.[0]
  if (!prediction?.bytesBase64Encoded) {
    throw new Error('Imagen BGSWAP: no image in response')
  }

  return {
    base64: prediction.bytesBase64Encoded,
    mimeType: prediction.mimeType ?? 'image/png',
  }
}

export async function imagenGenerate(prompt: string, options: ImagenOptions = {}): Promise<ImagenResult> {
  const token = await getAccessToken()
  const project = process.env.VERTEX_PROJECT_ID ?? 'cykt-399216'
  const location = process.env.VERTEX_LOCATION ?? 'us-central1'
  const model = 'imagen-3.0-fast-generate-001'

  const styleSuffix = STYLES[options.style ?? ''] ?? ''
  const enrichedPrompt = prompt + styleSuffix

  const body: Record<string, unknown> = {
    instances: [{ prompt: enrichedPrompt }],
    parameters: {
      sampleCount: 1,
      aspectRatio: options.aspectRatio ?? '1:1',
      addWatermark: false,
    },
  }

  if (options.negativePrompt?.trim()) {
    (body.parameters as Record<string, unknown>).negativePrompt = options.negativePrompt.trim()
  }

  const res = await fetch(
    `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:predict`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }
  )

  const data = await res.json() as any
  if (!res.ok) {
    console.error('[imagen] error', res.status, JSON.stringify(data))
    throw new Error(`Imagen ${res.status}: ${data?.error?.message ?? 'unknown'}`)
  }

  const prediction = data?.predictions?.[0]
  if (!prediction?.bytesBase64Encoded) {
    throw new Error('Imagen: no image in response')
  }

  return {
    base64: prediction.bytesBase64Encoded,
    mimeType: prediction.mimeType ?? 'image/png',
  }
}
