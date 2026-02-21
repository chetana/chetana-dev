import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { healthEntries, projects } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seedHealth() {
  console.log('💪 Seeding health entries...')

  // Clear existing data to avoid duplicates on re-run
  await db.delete(healthEntries)
  await db.delete(projects).where(eq(projects.slug, 'chet-health-strong'))
  console.log('🗑️  Cleared existing health data')

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

  await db.insert(healthEntries).values(entries)
  console.log(`✅ Inserted ${entries.length} health entries (Jan 1 - Feb 21, 2026)`)

  await db.insert(projects).values({
    slug: 'chet-health-strong',
    titleFr: 'Suivi pompes quotidien',
    titleEn: 'Daily Pushup Tracker',
    titleKm: 'តាមដានកិច្ចការរាំងដៃប្រចាំថ្ងៃ',
    descriptionFr: `## L'idée

Début janvier 2026, je me suis lancé un défi simple : **faire des pompes tous les jours**. Pas un programme de musculation complexe — juste une habitude quotidienne, mesurable, avec un objectif clair. Et comme je suis développeur, j'ai naturellement construit une app pour ça.

## Le concept : gamification à la Duolingo

L'inspiration vient directement de Duolingo et de sa mécanique de **streak** (série de jours consécutifs). Le principe est psychologiquement puissant : une fois qu'on a 30 jours de streak, on ne veut surtout pas casser la chaîne.

L'application propose :
- **Un stepper quotidien** : +5 / -5 pompes pour ajuster rapidement
- **Un calendrier visuel** : chaque jour validé est coché, les jours manqués restent vides
- **Un compteur de streak** : le nombre de jours consécutifs sans interruption
- **Des statistiques** : total, moyenne, progression mensuelle

## Progression

- **Janvier 2026** : objectif de 20 pompes/jour — phase d'installation de l'habitude
- **Février 2026** : passage à 25 pompes/jour — le corps s'adapte, on monte la barre
- L'objectif augmentera progressivement au fil des mois

## Stack technique

Le tracker est intégré directement dans le portfolio :
- **Frontend** : composant Vue avec stepper interactif et calendrier responsive
- **Backend** : API Nitro avec validation (pas de double validation par jour)
- **Base de données** : table \`health_entries\` dans Neon PostgreSQL
- **Pas d'authentification** : c'est un outil personnel, pas un SaaS

## Pourquoi le rendre public ?

Parce que la transparence crée de l'engagement. Quand le tracker est visible sur mon portfolio, j'ai une motivation supplémentaire pour ne pas tricher. C'est aussi une démonstration concrète que le code n'est pas qu'un métier — c'est un outil pour améliorer sa vie quotidienne.`,
    descriptionEn: `## The Idea

Early January 2026, I set myself a simple challenge: **do pushups every day**. Not a complex workout program — just a daily, measurable habit with a clear goal. And since I'm a developer, I naturally built an app for it.

## The Concept: Duolingo-Style Gamification

The inspiration comes directly from Duolingo and its **streak** mechanics (consecutive day series). The principle is psychologically powerful: once you have a 30-day streak, you really don't want to break the chain.

The application offers:
- **A daily stepper**: +5 / -5 pushups for quick adjustment
- **A visual calendar**: each validated day is checked, missed days remain empty
- **A streak counter**: consecutive days without interruption
- **Statistics**: total, average, monthly progression

## Progression

- **January 2026**: target of 20 pushups/day — habit installation phase
- **February 2026**: up to 25 pushups/day — the body adapts, we raise the bar
- The target will gradually increase over the months

## Tech Stack

The tracker is integrated directly into the portfolio:
- **Frontend**: Vue component with interactive stepper and responsive calendar
- **Backend**: Nitro API with validation (no double validation per day)
- **Database**: \`health_entries\` table in Neon PostgreSQL
- **No authentication**: it's a personal tool, not a SaaS

## Why Make It Public?

Because transparency creates commitment. When the tracker is visible on my portfolio, I have extra motivation not to cheat. It's also a concrete demonstration that code isn't just a job — it's a tool to improve your daily life.`,
    tags: ['Vue', 'Nuxt', 'Health', 'Gamification'],
    demoUrl: 'https://chetana.dev/projects/health',
    type: 'project',
    featured: true
  })
  console.log('✅ Inserted chet-health-strong project')

  console.log('🎉 Health seed complete!')
}

seedHealth().catch(console.error)
