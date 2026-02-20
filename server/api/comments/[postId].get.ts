import { getDB } from '../../utils/db'
import { comments } from '../../db/schema'
import { eq, and, desc } from 'drizzle-orm'

export default defineEventHandler(async (event) => {
  const postId = getRouterParam(event, 'postId')
  if (!postId || isNaN(Number(postId))) {
    throw createError({ statusCode: 400, message: 'Valid postId is required' })
  }

  const db = getDB()
  return await db.select()
    .from(comments)
    .where(and(eq(comments.postId, Number(postId)), eq(comments.approved, true)))
    .orderBy(desc(comments.createdAt))
})
