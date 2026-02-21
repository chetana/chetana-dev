import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { healthEntries, projects } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seedHealth() {
  console.log('💪 Seeding health entries...')

  const start = new Date('2026-01-01')
  const end = new Date('2026-02-21')
  const entries: { date: string; pushups: number; validated: boolean; validatedAt: Date }[] = []

  const d = new Date(start)
  while (d <= end) {
    const dateStr = d.toISOString().slice(0, 10)
    const pushups = dateStr >= '2026-02-17' ? 25 : 20
    entries.push({
      date: dateStr,
      pushups,
      validated: true,
      validatedAt: new Date(d.getTime() + 8 * 60 * 60 * 1000) // 8am each day
    })
    d.setDate(d.getDate() + 1)
  }

  // Insert health entries (ignore conflicts)
  for (const entry of entries) {
    try {
      await db.insert(healthEntries).values(entry)
    } catch {
      // Skip if already exists (unique constraint on date)
    }
  }
  console.log(`✅ Inserted ${entries.length} health entries (Jan 1 - Feb 21, 2026)`)

  // Insert project entry if not exists
  const existing = await db.select().from(projects).where(eq(projects.slug, 'chet-health-strong'))
  if (existing.length === 0) {
    await db.insert(projects).values({
      slug: 'chet-health-strong',
      titleFr: 'Suivi pompes quotidien',
      titleEn: 'Daily Pushup Tracker',
      descriptionFr: 'Application de suivi quotidien de pompes style Duolingo avec streak, calendrier et validation. 20 pompes/jour depuis janvier 2026, 25/jour depuis février.',
      descriptionEn: 'Duolingo-style daily pushup tracker with streak, calendar and validation. 20 pushups/day since January 2026, 25/day since February.',
      tags: ['Vue', 'Nuxt', 'Health', 'Gamification'],
      demoUrl: 'https://chetana.dev/projects/health',
      type: 'project',
      featured: true
    })
    console.log('✅ Inserted chet-health-strong project')
  }

  console.log('🎉 Health seed complete!')
}

seedHealth().catch(console.error)
