
export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const y = String(query.y ?? '')
  const m = String(query.m ?? '')
  const d = String(query.d ?? '')
  const f = String(query.f ?? '')

  if (!y || !m || !d || !f) {
    throw createError({ statusCode: 400, statusMessage: 'y, m, d, f are required' })
  }

  const path = `${y}/${m}/${d}/${f}`
  const flutterUrl = `https://chetlys.vercel.app/?tab=coffre&y=${encodeURIComponent(y)}&m=${encodeURIComponent(m)}&d=${encodeURIComponent(d)}&f=${encodeURIComponent(f)}`
  // En HTML, & dans les attributs doit être &amp; — les signed URLs GCS en contiennent beaucoup
  const flutterUrlHtml = flutterUrl.replace(/&/g, '&amp;')

  // Proxy JPEG — transcode tout format en JPEG pour compatibilité Facebook/Telegram
  // (Facebook Messenger n'accepte pas WebP en og:image, contrairement à WhatsApp)
  const ogImageUrl = `https://chetana.dev/api/coffre/og-image?path=${encodeURIComponent(path)}`
  const ogImageUrlHtml = ogImageUrl.replace(/&/g, '&amp;')

  const monthsFr = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
  const monthName = monthsFr[parseInt(m, 10) - 1] ?? m
  const title = `Chet & Lys — ${parseInt(d, 10)} ${monthName} ${y}`

  setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  setHeader(event, 'Cache-Control', 'public, max-age=3600')

  return `<!DOCTYPE html>
<html lang="fr"><head>
  <meta charset="utf-8">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Chet &amp; Lys">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="Un souvenir partagé · ការចងចាំរួម">
  <meta property="og:image" content="${ogImageUrlHtml}">
  <meta name="twitter:card" content="summary_large_image">
  <meta property="og:url" content="${flutterUrlHtml}">
  <meta http-equiv="refresh" content="0;url=${flutterUrlHtml}">
  <script>window.location.replace(${JSON.stringify(flutterUrl)});</script>
</head><body>
  <p><a href="${flutterUrlHtml}">Voir sur Chet &amp; Lys</a></p>
</body></html>`
})
