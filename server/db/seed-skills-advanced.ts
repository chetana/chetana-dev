import { getDB } from '../utils/db'
import { skills } from './schema'

const advancedSkills = [
  { category: 'Frontend Advanced', name: 'Web Push API', color: 'blue', sortOrder: 1 },
  { category: 'Frontend Advanced', name: 'Service Workers', color: 'blue', sortOrder: 2 },
  { category: 'Frontend Advanced', name: 'Internationalization (i18n)', color: 'blue', sortOrder: 3 },
  { category: 'Frontend Advanced', name: 'PWA (Progressive Web Apps)', color: 'blue', sortOrder: 4 },
  { category: 'Frontend Advanced', name: 'Workbox Caching', color: 'blue', sortOrder: 5 },

  { category: 'Backend Advanced', name: 'REST API Design', color: 'green', sortOrder: 1 },
  { category: 'Backend Advanced', name: 'Web Push Protocol (VAPID)', color: 'green', sortOrder: 2 },
  { category: 'Backend Advanced', name: 'Event Handler Pattern', color: 'green', sortOrder: 3 },
  { category: 'Backend Advanced', name: 'Server-Side Rendering (SSR)', color: 'green', sortOrder: 4 },

  { category: 'Architecture', name: 'Full-Stack TypeScript', color: 'purple', sortOrder: 1 },
  { category: 'Architecture', name: 'Database Schema Design', color: 'purple', sortOrder: 2 },
  { category: 'Architecture', name: 'SEO (Schema.org, JSON-LD)', color: 'purple', sortOrder: 3 },
  { category: 'Architecture', name: 'Bilingual Content Management', color: 'purple', sortOrder: 4 },

  { category: 'DevOps', name: 'Serverless (Vercel)', color: 'orange', sortOrder: 1 },
  { category: 'DevOps', name: 'Neon PostgreSQL', color: 'orange', sortOrder: 2 },
  { category: 'DevOps', name: 'CI/CD (GitHub → Vercel)', color: 'orange', sortOrder: 3 },
  { category: 'DevOps', name: 'Environment Management', color: 'orange', sortOrder: 4 },
  { category: 'DevOps', name: 'Database Migrations', color: 'orange', sortOrder: 5 }
]

export default async function seedAdvancedSkills() {
  const db = getDB()

  console.log('🎯 Seeding advanced skills...')

  for (const skill of advancedSkills) {
    const existing = await db.select().from(skills)
      .where((s) => {
        return s.category === skill.category && s.name === skill.name
      })

    if (existing.length === 0) {
      await db.insert(skills).values(skill)
      console.log(`✅ Added: ${skill.category} → ${skill.name}`)
    } else {
      console.log(`⏭️  Skipped: ${skill.category} → ${skill.name} (already exists)`)
    }
  }

  console.log('✨ Seeding complete!')
}

seedAdvancedSkills().catch(console.error)
