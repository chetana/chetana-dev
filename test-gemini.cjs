#!/usr/bin/env node
/**
 * Test Gemini 3.1 Flash Lite vs 2.5 Flash
 * Usage : node test-gemini.cjs
 */
const { createSign } = require('crypto')
require('dotenv').config({ path: '.env.local' })

const PROJECT = process.env.VERTEX_PROJECT_ID ?? 'cykt-399216'
const LOCATION = process.env.VERTEX_LOCATION ?? 'us-central1'
const MODELS = ['gemini-3.1-flash-lite', 'gemini-2.5-flash']

// ─── Auth ────────────────────────────────────────────────────────────────────

async function getAccessToken() {
  const creds = JSON.parse(process.env.GCS_SERVICE_ACCOUNT_JSON.trim())
  creds.private_key = creds.private_key.replace(/\\n/g, '\n').trim() + '\n'

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
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }),
  })
  const data = await res.json()
  return data.access_token
}

// ─── Call Gemini ─────────────────────────────────────────────────────────────

async function callModel(token, model, prompt, maxTokens = 300) {
  const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}/locations/${LOCATION}/publishers/google/models/${model}:generateContent`
  const start = Date.now()
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.2, maxOutputTokens: maxTokens, thinkingConfig: { thinkingBudget: 0 } },
    }),
  })
  const elapsed = Date.now() - start
  const data = await res.json()

  if (!res.ok) {
    return { ok: false, status: res.status, error: data?.error?.message, elapsed }
  }
  const raw = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? ''
  const text = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return { ok: true, status: res.status, text, elapsed }
}

// ─── Tests ───────────────────────────────────────────────────────────────────

const TESTS = [
  {
    name: '🇫🇷  Correction FR + traductions (faute orthographe)',
    prompt: `Détecte la langue, corrige les fautes et traduis en 3 langues.
Message : "je t'aime beaucoups ma chéri"
Réponds UNIQUEMENT avec un JSON valide (sans markdown) :
{"corrected":"...","fr":"...","en":"...","kh":"...","lang":"fr","question":"Tu voulais dire...","lessons":[{"original":"beaucoups","corrected":"beaucoup","explanation":"..."},{"original":"ma chéri","corrected":"ma chérie","explanation":"..."}]}`,
    maxTokens: 400,
  },
  {
    name: '🇰🇭  Correction KH + traductions (faute khmer)',
    prompt: `Détecte la langue, corrige les fautes et traduis en 3 langues.
Message : "ខ្ញំ នឹក អ្នក"
Réponds UNIQUEMENT avec un JSON valide (sans markdown) :
{"corrected":"...","fr":"...","en":"...","kh":"...","lang":"kh","question":"...","lessons":[{"original":"ខ្ញំ","corrected":"ខ្ញុំ","explanation":"..."}]}`,
    maxTokens: 400,
  },
  {
    name: '🌐  Traduction simple EN → FR/KH (pas de faute)',
    prompt: `Détecte la langue et traduis en 3 langues.
Message : "I miss you so much today"
Réponds UNIQUEMENT avec un JSON valide (sans markdown) :
{"fr":"...","en":"...","kh":"...","lang":"en"}`,
    maxTokens: 200,
  },
]

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log('🔑 Récupération du token...')
  const token = await getAccessToken()
  console.log('✅ Token OK\n')

  for (const test of TESTS) {
    console.log(`━━━ ${test.name} ━━━`)

    for (const model of MODELS) {
      const result = await callModel(token, model, test.prompt, test.maxTokens)
      const icon = result.ok ? '✅' : '❌'
      const timing = `${result.elapsed}ms`

      if (result.ok) {
        try {
          const parsed = JSON.parse(result.text)
          console.log(`${icon} ${model.padEnd(26)} [${timing}]`)
          console.log(`   fr  : ${parsed.fr ?? '—'}`)
          console.log(`   en  : ${parsed.en ?? '—'}`)
          console.log(`   kh  : ${parsed.kh ?? '—'}`)
          if (parsed.corrected) console.log(`   ✏️   : ${parsed.corrected}`)
          if (parsed.lessons?.length) {
            console.log(`   📚  : ${parsed.lessons.map(l => `${l.original} → ${l.corrected}`).join(', ')}`)
          }
        } catch {
          console.log(`${icon} ${model.padEnd(26)} [${timing}] JSON invalide :`, result.text)
        }
      } else {
        console.log(`${icon} ${model.padEnd(26)} [${timing}] HTTP ${result.status}: ${result.error}`)
      }
    }
    console.log()
  }

  console.log('─────────────────────────────────────────')
  console.log('Si gemini-3.1-flash-lite répond correctement sur les 3 tests,')
  console.log('le fallback dans vertex.ts est déjà en place pour la prod.')
}

run().catch(console.error)
