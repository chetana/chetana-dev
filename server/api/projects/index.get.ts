import { getDB } from '../../utils/db'
import { projects } from '../../db/schema'
import { desc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = getDB()
  return await db.select().from(projects).orderBy(desc(projects.createdAt))
})
