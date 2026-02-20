import { getDB } from '../utils/db'
import { experiences } from '../db/schema'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  try {
    const db = getDB()
    return await db.select().from(experiences).orderBy(asc(experiences.sortOrder))
  } catch (e: any) {
    console.error('experiences error:', e.message, e.stack)
    throw createError({ statusCode: 500, message: e.message })
  }
})
