const ALLOWED_ORIGINS = [
  'https://chetlys.vercel.app',
  'http://localhost',
  'http://localhost:3000',
]

export default defineEventHandler((event) => {
  const path = event.path ?? ''
  if (!path.startsWith('/api/coffre')) return

  const origin = getHeader(event, 'origin') ?? ''
  const allow = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]

  setHeader(event, 'Access-Control-Allow-Origin', allow)
  setHeader(event, 'Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  setHeader(event, 'Access-Control-Allow-Headers', 'Authorization, Content-Type')
  setHeader(event, 'Access-Control-Max-Age', '86400')

  // Répondre immédiatement aux preflight OPTIONS
  if (getMethod(event) === 'OPTIONS') {
    event.node.res.statusCode = 204
    event.node.res.end()
  }
})
