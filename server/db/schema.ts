import { pgTable, serial, text, varchar, boolean, timestamp, integer, jsonb, unique } from 'drizzle-orm/pg-core'

// Projects
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  titleFr: text('title_fr').notNull(),
  titleEn: text('title_en').notNull(),
  titleKm: text('title_km'),
  descriptionFr: text('description_fr').notNull(),
  descriptionEn: text('description_en').notNull(),
  descriptionKm: text('description_km'),
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
  titleKm: text('title_km'),
  contentFr: text('content_fr').notNull(),
  contentEn: text('content_en').notNull(),
  contentKm: text('content_km'),
  excerptFr: text('excerpt_fr').notNull(),
  excerptEn: text('excerpt_en').notNull(),
  excerptKm: text('excerpt_km'),
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
  roleKm: text('role_km'),
  dateStart: varchar('date_start', { length: 50 }).notNull(),
  dateEnd: varchar('date_end', { length: 50 }),
  location: varchar('location', { length: 255 }),
  bulletsFr: jsonb('bullets_fr').$type<string[]>().default([]),
  bulletsEn: jsonb('bullets_en').$type<string[]>().default([]),
  bulletsKm: jsonb('bullets_km').$type<string[]>(),
  sortOrder: integer('sort_order').default(0)
})

// Users (Google OAuth)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }),
  picture: text('picture'),
  googleId: varchar('google_id', { length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastLoginAt: timestamp('last_login_at').defaultNow().notNull()
})

// Health tracking
export const healthEntries = pgTable('health_entries', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  date: varchar('date', { length: 10 }).notNull(), // YYYY-MM-DD
  pushups: integer('pushups').notNull(),
  validated: boolean('validated').default(false),
  validatedAt: timestamp('validated_at'),
  createdAt: timestamp('created_at').defaultNow().notNull()
}, (table) => [
  unique('health_entries_user_date').on(table.userId, table.date)
])

// Push subscriptions
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: serial('id').primaryKey(),
  endpoint: text('endpoint').notNull().unique(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
})

// Skills
export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  category: varchar('category', { length: 100 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 20 }).default('purple'),
  sortOrder: integer('sort_order').default(0)
})
