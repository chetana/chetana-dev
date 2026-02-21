import { getDB } from '../../utils/db'
import { requireAuth } from '../../utils/auth'
import { healthEntries } from '../../db/schema'
import { eq, and } from 'drizzle-orm'

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function getTodayTarget(dateStr: string): number {
  return dateStr >= '2026-02-17' ? 25 : 20
}

export default defineEventHandler(async (event) => {
  const user = await requireAuth(event)
  const db = getDB()
  const today = getTodayDate()
  const target = getTodayTarget(today)

  // Allow client to override pushup count
  const body = await readBody(event).catch(() => ({}))
  const pushups = typeof body?.pushups === 'number' && Number.isInteger(body.pushups) && body.pushups >= 1 && body.pushups <= 200
    ? body.pushups
    : target

  // Check if entry exists for today for this user
  const existing = await db.select().from(healthEntries)
    .where(and(eq(healthEntries.userId, user.id), eq(healthEntries.date, today)))

  if (existing.length > 0) {
    if (existing[0].validated) {
      return { success: true, alreadyValidated: true, date: today, pushups: existing[0].pushups }
    }
    // Update existing entry
    await db.update(healthEntries)
      .set({ validated: true, validatedAt: new Date(), pushups: pushups })
      .where(and(eq(healthEntries.userId, user.id), eq(healthEntries.date, today)))
  } else {
    // Create new entry
    await db.insert(healthEntries).values({
      userId: user.id,
      date: today,
      pushups: pushups,
      validated: true,
      validatedAt: new Date()
    })
  }

  return { success: true, alreadyValidated: false, date: today, pushups: pushups }
})
