import webpush from 'web-push'
import { getDB } from '../../utils/db'
import { healthEntries, pushSubscriptions } from '../../db/schema'
import { eq } from 'drizzle-orm'

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function getMessage(hour: number): { title: string; body: string } {
  if (hour < 9) {
    return { title: '🌅 Pompes du matin', body: 'Commence la journée du bon pied ! Tes pompes t\'attendent.' }
  } else if (hour < 14) {
    return { title: '💪 Pause pompes', body: 'Une petite pause pour tes pompes ? Allez, on y va !' }
  } else if (hour < 18) {
    return { title: '⚡ C\'est l\'heure', body: 'L\'après-midi avance... toujours pas de pompes aujourd\'hui !' }
  } else {
    return { title: '🌙 Dernière chance', body: 'La journée se termine bientôt. Ne casse pas ta streak !' }
  }
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Verify cron secret (Vercel sends it as Authorization header)
  const authHeader = getHeader(event, 'authorization')
  if (authHeader !== `Bearer ${config.cronSecret}`) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  // Check if today is already validated
  const db = getDB()
  const today = getTodayDate()
  const entries = await db.select().from(healthEntries).where(eq(healthEntries.date, today))
  const todayEntry = entries[0]

  if (todayEntry?.validated) {
    return { sent: 0, reason: 'already_validated' }
  }

  // Get all subscriptions
  const subs = await db.select().from(pushSubscriptions)
  if (subs.length === 0) {
    return { sent: 0, reason: 'no_subscriptions' }
  }

  // Configure VAPID
  webpush.setVapidDetails(
    'mailto:contact@chetana.dev',
    config.public.vapidPublicKey,
    config.vapidPrivateKey
  )

  // Get time-appropriate message (Paris time = UTC+1 winter, UTC+2 summer)
  const parisHour = new Date().toLocaleString('en-US', { timeZone: 'Europe/Paris', hour: 'numeric', hour12: false })
  const hour = parseInt(parisHour, 10)
  const message = getMessage(hour)

  let sent = 0
  const deadEndpoints: string[] = []

  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: { p256dh: sub.p256dh, auth: sub.auth }
        },
        JSON.stringify(message)
      )
      sent++
    } catch (err: any) {
      if (err.statusCode === 410 || err.statusCode === 404) {
        deadEndpoints.push(sub.endpoint)
      }
    }
  }

  // Clean up dead subscriptions
  for (const endpoint of deadEndpoints) {
    await db.delete(pushSubscriptions).where(eq(pushSubscriptions.endpoint, endpoint))
  }

  return { sent, cleaned: deadEndpoints.length }
})
