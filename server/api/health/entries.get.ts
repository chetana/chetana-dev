import { getDB } from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import { healthEntries } from '../../db/schema'
import { asc, eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = getDB()
  return await db.select().from(healthEntries)
    .where(eq(healthEntries.userId, user.id))
    .orderBy(asc(healthEntries.date))
})
