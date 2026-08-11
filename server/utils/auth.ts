import { H3Event } from 'h3'
import { OAuth2Client } from 'google-auth-library'
import { getDB } from './db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

let _client: OAuth2Client | null = null

// Cache mémoire du mapping googleId → user (id stable). AVANT : chaque requête authentifiée
// faisait SELECT + UPDATE users (lastLoginAt=now()) → réveillait la Serverless SQL chetana-portfolio.
// APRÈS : cache-hit < 1h = ZÉRO accès DB ; lastLoginAt écrit au max 1×/h. Cache perdu au cold-start
// → 1 upsert au 1er accès. Table users = 2-3 lignes, pas d'éviction nécessaire.
const userCache = new Map<string, { id: number; name: string; picture: string; lastWriteMs: number }>()
const WRITE_THROTTLE_MS = 60 * 60 * 1000 // 1 h

function getAuthClient(): OAuth2Client {
  if (!_client) {
    const config = useRuntimeConfig()
    _client = new OAuth2Client(config.googleClientId)
  }
  return _client
}

export async function requireAuth(event: H3Event) {
  const authHeader = getHeader(event, 'authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw createError({ statusCode: 401, statusMessage: 'Missing authorization token' })
  }

  const idToken = authHeader.slice(7)
  const config = useRuntimeConfig()

  let payload
  try {
    const ticket = await getAuthClient().verifyIdToken({
      idToken,
      audience: config.googleClientId,
    })
    payload = ticket.getPayload()
  } catch {
    throw createError({ statusCode: 401, statusMessage: 'Invalid or expired token' })
  }

  if (!payload?.email || !payload?.sub) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid token payload' })
  }

  const googleId = payload.sub
  const now = Date.now()
  let cached = userCache.get(googleId)

  if (!cached) {
    // Cache-miss (cold-start ou 1er accès) : un seul upsert, puis on mémorise.
    const db = getDB()
    let row = (await db.select().from(users).where(eq(users.googleId, googleId)))[0]
    if (row) {
      await db.update(users)
        .set({
          lastLoginAt: new Date(),
          name: payload.name ?? row.name,
          picture: payload.picture ?? row.picture,
          email: payload.email,
        })
        .where(eq(users.id, row.id))
    } else {
      // Peut exister par email (migré avec un googleId placeholder) → on lie le vrai googleId.
      row = (await db.select().from(users).where(eq(users.email, payload.email)))[0]
      if (row) {
        await db.update(users)
          .set({
            googleId,
            lastLoginAt: new Date(),
            name: payload.name ?? row.name,
            picture: payload.picture ?? row.picture,
          })
          .where(eq(users.id, row.id))
      } else {
        const [newUser] = await db.insert(users).values({
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          googleId,
        }).returning()
        row = newUser
      }
    }
    cached = { id: row.id, name: row.name ?? '', picture: row.picture ?? '', lastWriteMs: now }
    userCache.set(googleId, cached)
  } else if (now - cached.lastWriteMs > WRITE_THROTTLE_MS) {
    // Cache-hit mais lastLoginAt périmé (>1h) : une seule écriture throttlée.
    cached.lastWriteMs = now
    const db = getDB()
    await db.update(users)
      .set({
        lastLoginAt: new Date(),
        name: payload.name ?? cached.name,
        picture: payload.picture ?? cached.picture,
        email: payload.email,
      })
      .where(eq(users.id, cached.id))
  }
  // Sinon (cache-hit, <1h) : AUCUN accès DB.

  return { id: cached.id, email: payload.email, name: payload.name, picture: payload.picture }
}
