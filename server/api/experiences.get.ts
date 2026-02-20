import { getDB } from '../utils/db'
import { experiences } from '../db/schema'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = getDB()
  return await db.select().from(experiences).orderBy(asc(experiences.sortOrder))
})
