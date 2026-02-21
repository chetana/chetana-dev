import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { users, healthEntries } from './schema'
import { eq, isNull } from 'drizzle-orm'
import * as schema from './schema'

const dbUrl = process.env.DATABASE_URL
if (!dbUrl) {
  console.error('DATABASE_URL is required')
  process.exit(1)
}

const sql = neon(dbUrl)
const db = drizzle(sql, { schema })

async function migrate() {
  console.log('Creating default user for existing health entries...')

  // Upsert the default user
  const existing = await db.select().from(users).where(eq(users.email, 'chetana.yin@gmail.com'))

  let userId: number
  if (existing.length > 0) {
    userId = existing[0].id
    console.log(`User already exists with id=${userId}`)
  } else {
    const [newUser] = await db.insert(users).values({
      email: 'chetana.yin@gmail.com',
      name: 'Chetana YIN',
      googleId: 'placeholder-migrate',
    }).returning()
    userId = newUser.id
    console.log(`Created user with id=${userId}`)
  }

  // Update all health entries that have no userId
  // Since we just added the column, we need raw SQL for NULL check on new column
  const updated = await sql`UPDATE health_entries SET user_id = ${userId} WHERE user_id IS NULL`
  console.log(`Updated health entries:`, updated)

  console.log('Migration complete!')
}

migrate().catch(console.error)
