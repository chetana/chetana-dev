
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

  // URL app — on redirige vers /coffre (SvelteKit) pas l'ancienne URL Flutter
  const appUrl = `https://chetlys.vercel.app/coffre?y=${encodeURIComponent(y)}&m=${encodeURIComponent(m)}&d=${encodeURIComponent(d)}&f=${encodeURIComponent(f)}`
  const appUrlHtml = appUrl.replace(/&/g, '&amp;')

  // Image pleine résolution (1200px) via proxy public — valable ~1h côté cache CDN
  const imgUrl = `https://chetana.dev/api/coffre/og-image?path=${encodeURIComponent(path)}&w=1200`
  const imgUrlHtml = imgUrl.replace(/&/g, '&amp;')

  setHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  // Pas de cache navigateur — l'image proxy a son propre cache 24h
  setHeader(event, 'Cache-Control', 'no-store')

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${title}</title>
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Chet &amp; Lys">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="Un souvenir partagé · ការចងចាំរួម">
  <meta property="og:image" content="${ogImageUrlHtml}">
  <meta name="twitter:card" content="summary_large_image">
  <meta property="og:url" content="${appUrlHtml}">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { height: 100%; background: #0F0F1A; color: #E8E8F0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    .page { display: flex; flex-direction: column; height: 100dvh; }
    .photo { flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; background: #000; }
    .photo img { max-width: 100%; max-height: 100%; object-fit: contain; display: block; }
    .footer { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; padding-bottom: max(12px, env(safe-area-inset-bottom)); background: #1E1E30; border-top: 1px solid rgba(232,164,184,0.3); flex-shrink: 0; }
    .meta { display: flex; flex-direction: column; gap: 2px; }
    .meta-title { font-size: 14px; font-weight: 600; color: #E8A4B8; }
    .meta-date { font-size: 12px; color: #9090A0; }
    .btn { display: flex; align-items: center; gap: 8px; background: #1E1E30; border: 1px solid rgba(232,164,184,0.3); border-radius: 20px; padding: 10px 16px; font-size: 13px; color: #E8E8F0; text-decoration: none; white-space: nowrap; cursor: pointer; }
    .btn:hover { border-color: #E8A4B8; }
    .btn svg { flex-shrink: 0; }
  </style>
</head>
<body>
  <div class="page">
    <div class="photo">
      <img src="${imgUrlHtml}" alt="${title}" />
    </div>
    <div class="footer">
      <div class="meta">
        <span class="meta-title">Chet &amp; Lys</span>
        <span class="meta-date">${parseInt(d, 10)} ${monthName} ${y}</span>
      </div>
      <a class="btn" href="${appUrlHtml}">
        <svg width="16" height="16" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Ouvrir le coffre · ប្រអប់
      </a>
    </div>
  </div>
</body>
</html>`
})
