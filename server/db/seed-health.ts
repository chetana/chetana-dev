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

Début janvier 2026, je me suis lancé un défi simple : **faire des pompes tous les jours**. Pas un programme de musculation complexe — juste une habitude quotidienne, mesurable, avec un objectif clair. Et comme je suis développeur, j'ai naturellement construit un écosystème complet pour ça.

## Le concept : gamification à la Duolingo

L'inspiration vient directement de Duolingo et de sa mécanique de **streak** (série de jours consécutifs). Le principe est psychologiquement puissant : une fois qu'on a 30 jours de streak, on ne veut surtout pas casser la chaîne.

## L'application web (portfolio)

Le tracker est d'abord né comme un composant intégré au portfolio :
- **Un stepper quotidien** : +5 / -5 pompes pour ajuster rapidement
- **Un calendrier visuel** : chaque jour validé est coché, les jours manqués sont marqués
- **Un compteur de streak** : le nombre de jours consécutifs sans interruption
- **Des statistiques** : total, moyenne, progression mensuelle

## L'application Android native

Pour rendre la validation encore plus simple au quotidien, j'ai développé une **application Android native en Kotlin** :
- **Architecture MVVM** avec ViewModel, LiveData et Room pour le cache local
- **Retrofit 2** pour la synchronisation avec le backend
- **Widget home screen** : un widget qui affiche le streak et le statut du jour directement sur l'écran d'accueil — impossible de l'ignorer en allumant le téléphone
- **WorkManager** : synchronisation en arrière-plan toutes les 30 minutes
- **Swipe to refresh** : pull-to-refresh pour forcer la synchronisation
- **Light mode** : design épuré avec le même style beige/or que le portfolio

## Authentification Google OAuth

L'application a évolué d'un outil purement personnel vers un système **multi-utilisateur** avec authentification :
- **Google Sign-In** via Credential Manager sur Android
- **Vérification stateless** des Google ID Tokens côté backend (compatible serverless Vercel)
- **Upsert automatique** des utilisateurs à la première connexion
- **Données scopées** : chaque utilisateur ne voit que ses propres données
- Pas de sessions, pas de cookies — juste un token dans le header \`Authorization: Bearer\`

## Progression

- **Janvier 2026** : objectif de 20 pompes/jour — phase d'installation de l'habitude
- **Février 2026** : passage à 25 pompes/jour — le corps s'adapte, on monte la barre
- L'objectif augmentera progressivement au fil des mois

## Stack technique

- **Backend** : Nuxt 3 / Nitro, Drizzle ORM, PostgreSQL Neon serverless, déployé sur Vercel
- **Auth** : Google OAuth 2.0 (google-auth-library)
- **Android** : Kotlin, MVVM, Retrofit 2, Room 2.6, Credential Manager, WorkManager
- **Web** : composant Vue avec stepper interactif et calendrier responsive`,
    descriptionEn: `## The Idea

Early January 2026, I set myself a simple challenge: **do pushups every day**. Not a complex workout program — just a daily, measurable habit with a clear goal. And since I'm a developer, I naturally built a complete ecosystem for it.

## The Concept: Duolingo-Style Gamification

The inspiration comes directly from Duolingo and its **streak** mechanics (consecutive day series). The principle is psychologically powerful: once you have a 30-day streak, you really don't want to break the chain.

## The Web App (Portfolio)

The tracker was first born as a component integrated into the portfolio:
- **A daily stepper**: +5 / -5 pushups for quick adjustment
- **A visual calendar**: each validated day is checked, missed days are marked
- **A streak counter**: consecutive days without interruption
- **Statistics**: total, average, monthly progression

## The Native Android App

To make daily validation even simpler, I built a **native Android app in Kotlin**:
- **MVVM architecture** with ViewModel, LiveData and Room for local caching
- **Retrofit 2** for backend synchronization
- **Home screen widget**: a widget that displays the streak and today's status right on the home screen — impossible to ignore when unlocking the phone
- **WorkManager**: background sync every 30 minutes
- **Swipe to refresh**: pull-to-refresh to force sync
- **Light mode**: clean design matching the portfolio's beige/gold style

## Google OAuth Authentication

The app evolved from a purely personal tool into a **multi-user system** with authentication:
- **Google Sign-In** via Credential Manager on Android
- **Stateless verification** of Google ID Tokens on the backend (Vercel serverless compatible)
- **Automatic upsert** of users on first login
- **Scoped data**: each user only sees their own data
- No sessions, no cookies — just a token in the \`Authorization: Bearer\` header

## Progression

- **January 2026**: target of 20 pushups/day — habit installation phase
- **February 2026**: up to 25 pushups/day — the body adapts, we raise the bar
- The target will gradually increase over the months

## Tech Stack

- **Backend**: Nuxt 3 / Nitro, Drizzle ORM, PostgreSQL Neon serverless, deployed on Vercel
- **Auth**: Google OAuth 2.0 (google-auth-library)
- **Android**: Kotlin, MVVM, Retrofit 2, Room 2.6, Credential Manager, WorkManager
- **Web**: Vue component with interactive stepper and responsive calendar`,
    tags: ['Vue', 'Nuxt', 'Kotlin', 'Android', 'OAuth', 'Health', 'Gamification'],
    demoUrl: 'https://chetana.dev/projects/health',
    githubUrl: 'https://github.com/chetana/dailypushup',
    type: 'project',
    featured: true
  })
  console.log('✅ Inserted chet-health-strong project')

  console.log('🎉 Health seed complete!')
}

seedHealth().catch(console.error)
