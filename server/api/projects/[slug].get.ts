import { getDB } from '../../utils/db'
import { projects } from '../../db/schema'
import { eq } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug is required' })
  }

  const db = getDB()
  const result = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1)

  if (!result.length) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  return result[0]
})
