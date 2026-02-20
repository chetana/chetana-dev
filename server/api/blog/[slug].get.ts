import { getDB } from '../../utils/db'
import { blogPosts } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) {
    throw createError({ statusCode: 400, message: 'Slug is required' })
  }

  const db = getDB()
  const result = await db.select()
    .from(blogPosts)
    .where(and(eq(blogPosts.slug, slug), eq(blogPosts.published, true)))
    .limit(1)

  if (!result.length) {
    throw createError({ statusCode: 404, message: 'Post not found' })
  }

  return result[0]
})
