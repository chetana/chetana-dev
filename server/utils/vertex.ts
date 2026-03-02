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

async function callGemini(prompt: string, maxTokens = 300): Promise<string> {
  const token = await getAccessToken()
  const project = process.env.VERTEX_PROJECT_ID ?? 'cykt-399216'
  const location = process.env.VERTEX_LOCATION ?? 'us-central1'
  const model = 'gemini-2.0-flash-001'

  const res = await fetch(
    `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`,
    {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: maxTokens },
      }),
    }
  )
  const data = await res.json() as any
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
  return raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
}

// Détecte si le texte contient des caractères khmers (U+1780–U+17FF)
export function isKhmer(text: string): boolean {
  return /[\u1780-\u17FF]/.test(text)
}

export interface Translations {
  fr: string
  en: string
  kh: string
}

// Détecte la langue du message, corrige-la, puis traduit dans les 2 autres langues
export async function geminiTranslateAll(text: string): Promise<Translations> {
  const prompt = `Tu es un assistant affectueux pour un couple franco-cambodgien.
Détecte la langue du message (français, anglais ou khmer).
Corrige les fautes dans cette langue, puis traduis dans les 2 autres langues.
Réponds UNIQUEMENT avec un JSON valide (sans markdown) :
{"fr":"version française correcte et affectueuse","en":"natural English translation","kh":"ការបកប្រែខ្មែរធម្មជាតិ"}
— Le champ de la langue détectée doit contenir le message corrigé (pas une retraduction).
Message : "${text}"`

  const raw = await callGemini(prompt, 300)
  return JSON.parse(raw) as Translations
}

export interface GeminiSuggestion {
  corrected: string  // texte corrigé dans la langue d'origine
  fr: string
  en: string
  kh: string
  question: string   // question de confirmation dans la langue d'origine
}

// Appelle Gemini Flash pour suggérer une correction + traductions avant envoi
export async function geminiSuggest(text: string, authorLang: 'fr' | 'kh'): Promise<GeminiSuggestion> {
  const prompt = authorLang === 'kh'
    ? `Tu es un assistant affectueux pour un couple franco-cambodgien. Lys écrit à Chet.
Détecte la langue du message. Corrige les fautes dans cette langue. Traduis dans les 2 autres langues.
Message : "${text}"
Réponds UNIQUEMENT avec un JSON valide (sans markdown) :
{"corrected":"message corrigé dans la langue détectée","fr":"traduction française douce","en":"natural English translation","kh":"version khmer corrigée","question":"question courte en khmer commençant par តើអ្នកចង់និយាយថា"}`
    : `Tu es un assistant affectueux pour un couple franco-cambodgien. Chet écrit à Lys.
Détecte la langue du message. Corrige les fautes dans cette langue. Traduis dans les 2 autres langues.
Message : "${text}"
Réponds UNIQUEMENT avec un JSON valide (sans markdown) :
{"corrected":"message corrigé dans la langue détectée","fr":"version française corrigée","en":"natural English translation","kh":"ការបកប្រែខ្មែរស្រស់ស្អាត","question":"question courte en français commençant par Tu voulais dire"}`

  const raw = await callGemini(prompt, 400)
  return JSON.parse(raw) as GeminiSuggestion
}
