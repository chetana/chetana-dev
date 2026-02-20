import { getDB } from '../../utils/db'
import { blogPosts, projects } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { defineSitemapEventHandler } from '#imports'

export default defineSitemapEventHandler(async () => {
  const db = getDB()

  const posts = await db.select({
    slug: blogPosts.slug,
    updatedAt: blogPosts.updatedAt,
    createdAt: blogPosts.createdAt
  })
    .from(blogPosts)
    .where(eq(blogPosts.published, true))

  const allProjects = await db.select({
    slug: projects.slug,
    createdAt: projects.createdAt
  })
    .from(projects)

  return [
    ...posts.map(post => ({
      loc: `/blog/${post.slug}`,
      lastmod: post.updatedAt || post.createdAt
    })),
    ...allProjects.map(project => ({
      loc: `/projects/${project.slug}`,
      lastmod: project.createdAt
    }))
  ]
})
