import { H3Event } from 'h3'
import { OAuth2Client } from 'google-auth-library'
import { getDB } from './db'
import { users } from '../db/schema'
import { eq } from 'drizzle-orm'

let _client: OAuth2Client | null = null

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

  const db = getDB()

  // Upsert user
  const existing = await db.select().from(users).where(eq(users.googleId, payload.sub))

  if (existing.length > 0) {
    // Update last login + refresh profile info
    await db.update(users)
      .set({
        lastLoginAt: new Date(),
        name: payload.name ?? existing[0].name,
        picture: payload.picture ?? existing[0].picture,
        email: payload.email,
      })
      .where(eq(users.id, existing[0].id))

    return { id: existing[0].id, email: payload.email, name: payload.name, picture: payload.picture }
  }

  // Check if user exists by email (e.g. migrated with placeholder googleId)
  const byEmail = await db.select().from(users).where(eq(users.email, payload.email))
  if (byEmail.length > 0) {
    // Link the real googleId
    await db.update(users)
      .set({
        googleId: payload.sub,
        lastLoginAt: new Date(),
        name: payload.name ?? byEmail[0].name,
        picture: payload.picture ?? byEmail[0].picture,
      })
      .where(eq(users.id, byEmail[0].id))

    return { id: byEmail[0].id, email: payload.email, name: payload.name, picture: payload.picture }
  }

  // Create new user
  const [newUser] = await db.insert(users).values({
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
    googleId: payload.sub,
  }).returning()

  return { id: newUser.id, email: payload.email, name: payload.name, picture: payload.picture }
}
