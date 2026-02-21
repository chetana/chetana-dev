import { getDB } from '../../utils/db'
import { healthEntries } from '../../db/schema'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = getDB()
  return await db.select().from(healthEntries).orderBy(asc(healthEntries.date))
})
