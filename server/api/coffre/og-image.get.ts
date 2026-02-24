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

  // Paramètre optionnel ?w= pour adapter la taille à l'usage :
  // - og:image social : 1200px (défaut)
  // - thumbnail grille Flutter : 300px
  const wParam = parseInt(String(query.w ?? ''), 10)
  const width = (!isNaN(wParam) && wParam > 0 && wParam <= 2000) ? wParam : 1200

  // Transcode en JPEG — normalise WebP, HEIC, RAW, PNG, etc.
  // Évite le décodage full-res côté client (ex: Lumix 8 MB, 6000×4000px)
  // Pour les thumbnails grille (w <= 600), crop carré centré pour un rendu uniforme
  const isThumb = width <= 600
  const jpeg = await sharp(buffer)
    .resize(isThumb
      ? { width, height: width, fit: 'cover', position: 'centre', withoutEnlargement: true }
      : { width, withoutEnlargement: true }
    )
    .jpeg({ quality: width <= 400 ? 80 : 85 })
    .toBuffer()

  setHeader(event, 'Content-Type', 'image/jpeg')
  setHeader(event, 'Cache-Control', 'public, max-age=86400') // 24h — scrapers mettent en cache de toute façon
  setHeader(event, 'Content-Length', jpeg.length.toString())

  return jpeg
})
