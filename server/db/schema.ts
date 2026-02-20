import { pgTable, serial, text, varchar, boolean, timestamp, integer, jsonb } from 'drizzle-orm/pg-core'

// Projects
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  titleFr: text('title_fr').notNull(),
  titleEn: text('title_en').notNull(),
  descriptionFr: text('description_fr').notNull(),
  descriptionEn: text('description_en').notNull(),
  tags: jsonb('tags').$type<string[]>().default([]),
  githubUrl: text('github_url'),
  demoUrl: text('demo_url'),
  imageUrl: text('image_url'),
  type: varchar('type', { length: 50 }).default('project'),
  featured: boolean('featured').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Blog posts
export const blogPosts = pgTable('blog_posts', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  titleFr: text('title_fr').notNull(),
  titleEn: text('title_en').notNull(),
  contentFr: text('content_fr').notNull(),
  contentEn: text('content_en').notNull(),
  excerptFr: text('excerpt_fr').notNull(),
  excerptEn: text('excerpt_en').notNull(),
  tags: jsonb('tags').$type<string[]>().default([]),
  published: boolean('published').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull()
})

// Comments
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').notNull().references(() => blogPosts.id),
  authorName: varchar('author_name', { length: 100 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  approved: boolean('approved').default(false)
})

// Contact messages
export const messages = pgTable('messages', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  read: boolean('read').default(false)
})

// CV Experiences
export const experiences = pgTable('experiences', {
  id: serial('id').primaryKey(),
  company: varchar('company', { length: 255 }).notNull(),
  roleFr: text('role_fr').notNull(),
  roleEn: text('role_en').notNull(),
  dateStart: varchar('date_start', { length: 50 }).notNull(),
  dateEnd: varchar('date_end', { length: 50 }),
  location: varchar('location', { length: 255 }),
  bulletsFr: jsonb('bullets_fr').$type<string[]>().default([]),
  bulletsEn: jsonb('bullets_en').$type<string[]>().default([]),
  sortOrder: integer('sort_order').default(0)
})

// Skills
export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  category: varchar('category', { length: 100 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 20 }).default('purple'),
  sortOrder: integer('sort_order').default(0)
})
