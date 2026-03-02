import { createSign } from 'crypto'

// Génère un access token OAuth2 depuis le service account GCS existant
async function getAccessToken(): Promise<string> {
  const raw = process.env.GCS_SERVICE_ACCOUNT_JSON!.trim()
  const creds = JSON.parse(raw)
  creds.private_key = (creds.private_key as string).replace(/\\n/g, '\n').trim() + '\n'

  const now = Math.floor(Date.now() / 1000)
  const header = Buffer.from(JSON.stringify({ alg: 'RS256', typ: 'JWT' })).toString('base64url')
  const payload = Buffer.from(JSON.stringify({
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/cloud-platform',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })).toString('base64url')

  const unsigned = `${header}.${payload}`
  const signature = createSign('RSA-SHA256').update(unsigned).sign(creds.private_key, 'base64url')
  const jwt = `${unsigned}.${signature}`

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  })

  const data = await res.json() as { access_token: string }
  return data.access_token
}

export interface GeminiSuggestion {
  corrected: string    // texte corrigé dans la langue d'origine
  translation: string  // traduction dans l'autre langue
  question: string     // question de confirmation dans la langue d'origine
}

// Appelle Gemini Flash pour suggérer une correction + traduction avant envoi
export async function geminiSuggest(text: string, authorLang: 'fr' | 'kh'): Promise<GeminiSuggestion> {
  const token = await getAccessToken()
  const project = process.env.VERTEX_PROJECT_ID ?? 'cykt-399216'
  const location = process.env.VERTEX_LOCATION ?? 'us-central1'
  const model = 'gemini-2.0-flash-001'

  const prompt = authorLang === 'kh'
    ? `Tu es un assistant affectueux pour un couple. Lys est cambodgienne, elle écrit en khmer à Chet qui est français.
Message de Lys : "${text}"
Réponds UNIQUEMENT avec un JSON valide (sans markdown, sans \`\`\`) :
{"corrected":"message khmer corrigé naturellement","translation":"traduction française douce et naturelle","question":"question courte en khmer commençant par តើអ្នកចង់និយាយថា"}`
    : `Tu es un assistant affectueux pour un couple. Chet est français, il écrit en français à Lys qui est cambodgienne.
Message de Chet : "${text}"
Réponds UNIQUEMENT avec un JSON valide (sans markdown, sans \`\`\`) :
{"corrected":"message français corrigé","translation":"ប្រែសម្រួលជាភាសាខ្មែរ ស្រស់ស្អាត","question":"question courte en français commençant par Tu voulais dire"}`

  const res = await fetch(
    `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 300 },
      }),
    }
  )

  const data = await res.json() as any
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'

  // Nettoie les éventuels blocs markdown que Gemini ajouterait quand même
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned) as GeminiSuggestion
}
