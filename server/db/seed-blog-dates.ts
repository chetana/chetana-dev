import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { blogPosts } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

// Vendredis soir 20h, du plus récent au plus ancien
// daily-pushup-tracker : 52 jours depuis le 1er jan = 21 fév → publié le vendredi 27 fév
const dates: { slug: string; date: string }[] = [
  { slug: 'stripe-adyen-oms-integration',                    date: '2026-03-06' },
  { slug: 'daily-pushup-tracker-52-jours',                   date: '2026-02-27' }, // après j+52 (21 fév)
  { slug: 'back-foc-collaboration-sdk',                      date: '2026-02-20' },
  { slug: 'api-design-first-philosophie',                    date: '2026-02-13' },
  { slug: 'openapi-contract-diff-outil',                     date: '2026-02-06' },
  { slug: 'qa-en-2026',                                      date: '2026-01-30' },
  { slug: 'aws-gcp-migration-startup-b2b',                   date: '2026-01-23' },
  { slug: 'coffre-photo-pwa-flutter-optimisation-memoire',   date: '2026-01-16' },
  { slug: 'java-backend-developer-evolution-2026',           date: '2026-01-09' },
  { slug: 'dark-theme-light-theme-transition',               date: '2026-01-02' },
  { slug: 'claude-code-equipe-engineering',                  date: '2025-12-26' },
  { slug: 'nuxt4-neon-drizzle-portfolio',                    date: '2025-12-19' },
]

async function seedBlogDates() {
  console.log('📅 Updating blog post dates (every Friday at 20:00)...')

  for (const { slug, date } of dates) {
    const ts = new Date(`${date}T20:00:00+01:00`) // heure de Paris
    await db.update(blogPosts)
      .set({ createdAt: ts, updatedAt: ts })
      .where(eq(blogPosts.slug, slug))
    console.log(`  ✓ ${slug} → ${date} 20:00`)
  }

  console.log('✅ Blog dates updated!')
}

seedBlogDates().catch(console.error)
