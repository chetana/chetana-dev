import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { skills } from './schema'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seedNewSkills() {
  console.log('🛠️  Adding new skills...')

  await db.insert(skills).values([
    { category: 'Frontend & Mobile', name: 'SvelteKit / Svelte 5', color: 'purple', sortOrder: 5 },
    { category: 'AI-Augmented Dev', name: 'Vertex AI / Gemini', color: 'purple', sortOrder: 6 },
  ])

  console.log('✅ Added: SvelteKit / Svelte 5, Vertex AI / Gemini')
  console.log('🎉 Done!')
}

seedNewSkills().catch(console.error)
