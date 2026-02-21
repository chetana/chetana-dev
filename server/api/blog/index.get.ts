import { getDB } from '../../utils/db'
import { blogPosts } from '../../db/schema'
import { desc, eq } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = getDB()
  return await db.select({
    id: blogPosts.id,
    slug: blogPosts.slug,
    titleFr: blogPosts.titleFr,
    titleEn: blogPosts.titleEn,
    titleKm: blogPosts.titleKm,
    excerptFr: blogPosts.excerptFr,
    excerptEn: blogPosts.excerptEn,
    excerptKm: blogPosts.excerptKm,
    tags: blogPosts.tags,
    createdAt: blogPosts.createdAt
  })
    .from(blogPosts)
    .where(eq(blogPosts.published, true))
    .orderBy(desc(blogPosts.createdAt))
})
