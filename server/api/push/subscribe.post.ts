import { getDB } from '../../utils/db'
import { pushSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { endpoint, keys } = body

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid subscription' })
  }

  const db = getDB()

  // Upsert: delete existing then insert
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint))
  await db.insert(pushSubscriptions).values({
    endpoint,
    p256dh: keys.p256dh,
    auth: keys.auth
  })

  return { ok: true }
})
