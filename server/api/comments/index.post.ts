import { getDB } from '../../utils/db'
import { comments } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Basic validation
  if (!body.postId || !body.authorName || !body.content) {
    throw createError({ statusCode: 400, message: 'postId, authorName and content are required' })
  }

  if (body.authorName.length > 100) {
    throw createError({ statusCode: 400, message: 'Author name too long (max 100 chars)' })
  }

  if (body.content.length > 2000) {
    throw createError({ statusCode: 400, message: 'Comment too long (max 2000 chars)' })
  }

  // Basic anti-spam: reject if content has too many links
  const linkCount = (body.content.match(/https?:\/\//g) || []).length
  if (linkCount > 2) {
    throw createError({ statusCode: 400, message: 'Too many links in comment' })
  }

  const db = getDB()
  const result = await db.insert(comments).values({
    postId: Number(body.postId),
    authorName: body.authorName.trim(),
    content: body.content.trim(),
    approved: false
  }).returning()

  return { success: true, comment: result[0] }
})
