import { getDB } from '../../utils/db'
import { pushSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { endpoint } = body

  if (!endpoint) {
    throw createError({ statusCode: 400, statusMessage: 'Missing endpoint' })
  }

  const db = getDB()
  await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint))

  return { ok: true }
})
