import { createSign } from 'crypto'

// Génère un access token OAuth2 depuis le service account GCS existant
export async function getAccessToken(): Promise<string> {
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

const GEMINI_MODELS = ['gemini-3.1-flash-lite', 'gemini-2.5-flash'] as const

async function geminiRequest(parts: object[], maxTokens = 300): Promise<string> {
  const token = await getAccessToken()
  const project = process.env.VERTEX_PROJECT_ID ?? 'cykt-399216'
  const location = process.env.VERTEX_LOCATION ?? 'us-central1'

  let lastError: Error | null = null
  for (const model of GEMINI_MODELS) {
    const res = await fetch(
      `https://${location}-aiplatform.googleapis.com/v1/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: { temperature: 0.2, maxOutputTokens: maxTokens, thinkingConfig: { thinkingBudget: 0 } },
        }),
      }
    )
    const data = await res.json() as any
    if (!res.ok) {
      console.warn(`[vertex] ${model} failed (${res.status}): ${data?.error?.message ?? 'unknown'}`)
      lastError = new Error(`Gemini ${res.status}: ${data?.error?.message ?? 'unknown'}`)
      continue
    }
    if (model !== GEMINI_MODELS[0]) {
      console.warn(`[vertex] fallback used: ${model}`)
    }
    const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
    return raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  }
  throw lastError ?? new Error('All Gemini models failed')
}

async function callGemini(prompt: string, maxTokens = 300): Promise<string> {
  return geminiRequest([{ text: prompt }], maxTokens)
}

// Détecte si le texte contient des caractères khmers (U+1780–U+17FF)
export function isKhmer(text: string): boolean {
  return /[\u1780-\u17FF]/.test(text)
}

// Contexte commun injecté dans tous les prompts du couple
function coupleContext(author?: string): string {
  const normalized = author?.normalize('NFD').replace(/[\u0300-\u036f]/g, '') ?? ''
  const isChet = author ? /^(chet|chetana)$/i.test(normalized) : null
  const authorLine = isChet === true
    ? "Ce message est écrit par CHET (homme)."
    : isChet === false
      ? "Ce message est écrit par LYS (femme)."
      : "" // auteur inconnu : contexte général sans préciser qui écrit

  return `CONTEXTE DU COUPLE (respecter impérativement) :
- Chet (aussi appelé "Chetana") est un HOMME français. Accord MASCULIN obligatoire pour ses messages (ex : "je suis heureux", jamais "heureuse").
- Lys (aussi appelée "Vornsok") est une femme cambodgienne.
- Pronoms khmer : quand Chet écrit → il se dit "bang" (បង), appelle Lys "oun" (អូន). Quand Lys écrit → elle se dit "oun" (អូន), appelle Chet "bang" (បង).
${authorLine}`.trim()
}

export interface Translations {
  fr: string
  en: string
  kh: string
  lang?: string // langue détectée du message original : 'fr', 'en' ou 'kh'
}

// Détecte la langue du message, corrige-la, puis traduit dans les 2 autres langues
export async function geminiTranslateAll(text: string, author?: string): Promise<Translations> {
  const prompt = `Tu es un assistant de traduction pour un couple : Chet (français) et Lys (cambodgienne). Ils s'écrivent des messages affectueux en français, khmer ou anglais.

${coupleContext(author)}

Rôle : détecter la langue du message, corriger discrètement les fautes, puis traduire dans les 2 autres langues.

Règles de traduction :
- Privilégier le sens et l'intention, jamais le mot-à-mot
- Garder le registre naturel du message (tendre, intime, quotidien)
- Adapter au contexte culturel (couple franco-cambodgien)
- Le champ de la langue d'origine contient le texte corrigé, pas une retraduction
- "lang" : code de la langue détectée du message original ("fr", "en" ou "kh")

Message : "${text}"

Réponds UNIQUEMENT avec un JSON valide (sans markdown) :
{"fr":"texte en français","en":"text in English","kh":"អត្ថបទជាភាសាខ្មែរ","lang":"code_langue"}`

  const raw = await callGemini(prompt, 300)
  return JSON.parse(raw) as Translations
}

export interface LessonItem {
  original: string      // mot/fragment original avec la faute
  corrected: string     // version corrigée
  explanation: string   // explication courte dans la langue natale de l'auteur
}

export interface GeminiSuggestion {
  corrected: string  // texte corrigé dans la langue d'origine
  fr: string
  en: string
  kh: string
  lang: string       // langue détectée du message original : 'fr', 'en' ou 'kh'
  question: string   // question de confirmation dans la langue d'origine
  lessons?: LessonItem[]  // une entrée par faute corrigée — absent si aucune faute
}

// Appelle Gemini Flash pour suggérer une correction + traductions avant envoi
export async function geminiSuggest(text: string, authorLang: 'fr' | 'kh'): Promise<GeminiSuggestion> {
  const author = authorLang === 'fr' ? 'Chet' : 'Lys'
  const context = authorLang === 'kh'
    ? `Lys (femme cambodgienne) écrit à Chet (français). Elle écrit probablement en khmer, parfois en français ou anglais appris.`
    : `Chet (homme français) écrit à Lys (cambodgienne). Il écrit probablement en français, parfois en anglais ou khmer appris.`

  const questionHint = authorLang === 'kh'
    ? `question courte en khmer, commençant par "តើអ្នកចង់និយាយថា"`
    : `question courte en français, commençant par "Tu voulais dire"`

  const lessonsHint = authorLang === 'kh'
    ? `,"lessons":[{"original":"ពាក្យដើម","corrected":"ពាក្យដែលបានកែ","explanation":"ការពន្យល់ខ្លីជាភាសាខ្មែរ"}]`
    : `,"lessons":[{"original":"mot original","corrected":"mot corrigé","explanation":"explication courte en français"}]`

  const lessonsRule = authorLang === 'kh'
    ? '- lessons : tableau avec une entrée par faute (original, corrected, explanation en khmer simple) — omis si aucune faute'
    : '- lessons : tableau avec une entrée par faute (original, corrected, explanation en français simple) — omis si aucune faute'

  const prompt = `Tu es un assistant de traduction pour un couple : Chet (français) et Lys (cambodgienne).
${context}

${coupleContext(author)}

Rôle : détecter la langue réelle du message, corriger discrètement les fautes (orthographe, grammaire, mots manquants), puis traduire dans les 2 autres langues.

Règles :
- Corriger sans dénaturer le sens ni le ton du message
- Signaler la correction avec une question naturelle dans la langue de l'auteur
- Traductions : privilégier le sens et l'intention, pas le mot-à-mot
- Registre intime et tendre, adapté à un couple
- Si aucune faute n'est détectée, ne mets pas de champ "lessons" (omets-le du JSON)
- "lang" : code de la langue détectée du message original ("fr", "en" ou "kh")
${lessonsRule}

Message : "${text}"

Réponds UNIQUEMENT avec un JSON valide (sans markdown) :
{"corrected":"message corrigé dans la langue détectée","fr":"texte en français","en":"text in English","kh":"អត្ថបទជាភាសាខ្មែរ","lang":"code_langue","question":"${questionHint}"${lessonsHint}}`

  const raw = await callGemini(prompt, 500)
  return JSON.parse(raw) as GeminiSuggestion
}

export interface TranscriptionResult {
  text: string  // transcription dans la langue d'origine
  fr: string
  en: string
  kh: string
}

// ── Chat multi-tour avec Google Search grounding ──────────────────────────────
export interface ChatMessage {
  role: 'user' | 'model'
  content: string
}

export interface ChatResult {
  reply: string
  sources?: Array<{ title: string; url: string }>
}

export async function geminiChatWithSearch(
  messages: ChatMessage[],
  systemInstruction: string,
): Promise<ChatResult> {
  const token = await getAccessToken()
  const project = process.env.VERTEX_PROJECT_ID ?? 'cykt-399216'
  const location = process.env.VERTEX_LOCATION ?? 'us-central1'
  const model = 'gemini-2.5-flash'

  const contents = messages.map(m => ({ role: m.role, parts: [{ text: m.content }] }))

  const makeBody = (withSearch: boolean) => ({
    systemInstruction: { parts: [{ text: systemInstruction }] },
    contents,
    ...(withSearch ? { tools: [{ googleSearch: {} }] } : {}),
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  })

  const endpoint = `https://${location}-aiplatform.googleapis.com/v1beta/projects/${project}/locations/${location}/publishers/google/models/${model}:generateContent`

  for (const withSearch of [true, false]) {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(makeBody(withSearch)),
    })
    const data = await res.json() as any

    if (!res.ok) {
      if (withSearch) {
        console.warn(`[geminiChat] search failed (${res.status}), retrying without`)
        continue
      }
      throw new Error(`Gemini ${res.status}: ${data?.error?.message}`)
    }

    const parts: any[] = data?.candidates?.[0]?.content?.parts ?? []
    const reply = parts.filter(p => !p.thought).map(p => p.text ?? '').join('').trim()

    if (!reply && withSearch) {
      console.warn('[geminiChat] empty reply with search, retrying without')
      continue
    }

    const chunks: any[] = data?.candidates?.[0]?.groundingMetadata?.groundingChunks ?? []
    const sources = chunks
      .filter(c => c.web?.title && c.web?.uri)
      .map(c => ({ title: c.web.title as string, url: c.web.uri as string }))

    return { reply: reply || '…', sources: sources.length ? sources : undefined }
  }

  throw new Error('Chat failed after all attempts')
}

// Transcrit un message audio et traduit en 3 langues en un seul appel Gemini
export async function geminiTranscribeAndTranslate(audioBase64: string, mimeType: string, author?: string): Promise<TranscriptionResult> {
  const prompt = `Transcris EXACTEMENT ce qui est dit dans ce message vocal, mot pour mot, sans rien ajouter ni inventer.
Si le message est court (ex: "bonjour", "hello", "ok"), la transcription doit contenir uniquement ces mots.
Ne complète pas, ne reformule pas, ne corrige pas.
Détecte la langue (français, anglais ou khmer).
Traduis ensuite dans les 2 autres langues (traduction courte et fidèle au message d'origine).

${coupleContext(author)}

Réponds UNIQUEMENT avec un JSON valide (sans markdown) :
{"text":"transcription exacte","fr":"texte en français","en":"text in English","kh":"អត្ថបទជាភាសាខ្មែរ"}`

  const raw = await geminiRequest(
    [{ inlineData: { mimeType, data: audioBase64 } }, { text: prompt }],
    500
  )
  return JSON.parse(raw) as TranscriptionResult
}
