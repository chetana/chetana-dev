import sharp from 'sharp'
import { signedGetUrl } from '../../utils/gcs'

// Proxy d'image pour og:image — transcode tout format (WebP, HEIC, etc.) en JPEG
// Nécessaire car Facebook Messenger n'accepte que JPEG/PNG/GIF pour og:image
// WhatsApp accepte WebP directement, mais Messenger et Telegram ne le supportent pas
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const path = String(query.path ?? '')

  if (!path) {
    throw createError({ statusCode: 400, statusMessage: 'path is required' })
  }

  // Génère une signed URL GCS fraîche pour ce fichier
  const gcsUrl = signedGetUrl(path)

  // Télécharge l'image depuis GCS
  const response = await fetch(gcsUrl)
  if (!response.ok) {
    throw createError({ statusCode: 502, statusMessage: 'Failed to fetch image from GCS' })
  }

  const buffer = Buffer.from(await response.arrayBuffer())

  // Transcode en JPEG, max 1200px de large (taille recommandée pour og:image)
  // Cela normalise WebP, HEIC, PNG, etc. en un JPEG universellement supporté
  const jpeg = await sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer()

  setHeader(event, 'Content-Type', 'image/jpeg')
  setHeader(event, 'Cache-Control', 'public, max-age=86400') // 24h — scrapers mettent en cache de toute façon
  setHeader(event, 'Content-Length', jpeg.length.toString())

  return jpeg
})
