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

async function geminiRequest(parts: object[], maxTokens = 300): Promise<string> {
  const token = await getAccessToken()
  const project = process.env.VERTEX_PROJECT_ID ?? 'cykt-399216'
  const location = process.env.VERTEX_LOCATION ?? 'us-central1'
  const model = 'gemini-2.5-flash'

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
    console.error('[vertex] Gemini error', res.status, JSON.stringify(data))
    throw new Error(`Gemini ${res.status}: ${data?.error?.message ?? 'unknown'}`)
  }
  const raw: string = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
  return raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
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

Message : "${text}"

Réponds UNIQUEMENT avec un JSON valide (sans markdown) :
{"fr":"texte en français","en":"text in English","kh":"អត្ថបទជាភាសាខ្មែរ"}`

  const raw = await callGemini(prompt, 300)
  return JSON.parse(raw) as Translations
}

export interface GeminiSuggestion {
  corrected: string  // texte corrigé dans la langue d'origine
  fr: string
  en: string
  kh: string
  question: string   // question de confirmation dans la langue d'origine
  lesson?: string    // explication courte en khmer de la correction (pour Lys uniquement)
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

  const lessonHint = authorLang === 'kh'
    ? `,"lesson":"explication très courte en khmer (1 phrase max, mots simples et doux) de ce qui a été corrigé et pourquoi"`
    : `,"lesson":"explication très courte en français (1 phrase max) de ce qui a été corrigé et pourquoi"`

  const lessonRule = authorLang === 'kh'
    ? '- lesson : explique la règle en khmer simple pour aider Lys à apprendre (ex: "បានប្រើ X ព្រោះ...")'
    : '- lesson : explique la règle en français simple pour aider Chet à s\'améliorer (ex: "On dit X parce que...")'

  const prompt = `Tu es un assistant de traduction pour un couple : Chet (français) et Lys (cambodgienne).
${context}

${coupleContext(author)}

Rôle : détecter la langue réelle du message, corriger discrètement les fautes (orthographe, grammaire, mots manquants), puis traduire dans les 2 autres langues.

Règles :
- Corriger sans dénaturer le sens ni le ton du message
- Signaler la correction avec une question naturelle dans la langue de l'auteur
- Traductions : privilégier le sens et l'intention, pas le mot-à-mot
- Registre intime et tendre, adapté à un couple
- Si aucune faute n'est détectée, ne mets pas de champ "lesson" (omets-le du JSON)
${lessonRule}

Message : "${text}"

Réponds UNIQUEMENT avec un JSON valide (sans markdown) :
{"corrected":"message corrigé dans la langue détectée","fr":"texte en français","en":"text in English","kh":"អត្ថបទជាភាសាខ្មែរ","question":"${questionHint}"${lessonHint}}`

  const raw = await callGemini(prompt, 500)
  return JSON.parse(raw) as GeminiSuggestion
}

export interface TranscriptionResult {
  text: string  // transcription dans la langue d'origine
  fr: string
  en: string
  kh: string
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
