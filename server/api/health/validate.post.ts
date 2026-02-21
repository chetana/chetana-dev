import { getDB } from '../../utils/db'
import { healthEntries } from '../../db/schema'
import { eq } from 'drizzle-orm'

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function getTodayTarget(dateStr: string): number {
  return dateStr >= '2026-02-17' ? 25 : 20
}

export default defineEventHandler(async () => {
  const db = getDB()
  const today = getTodayDate()
  const target = getTodayTarget(today)

  // Check if entry exists for today
  const existing = await db.select().from(healthEntries).where(eq(healthEntries.date, today))

  if (existing.length > 0) {
    if (existing[0].validated) {
      return { success: true, alreadyValidated: true, date: today, pushups: existing[0].pushups }
    }
    // Update existing entry
    await db.update(healthEntries)
      .set({ validated: true, validatedAt: new Date(), pushups: target })
      .where(eq(healthEntries.date, today))
  } else {
    // Create new entry
    await db.insert(healthEntries).values({
      date: today,
      pushups: target,
      validated: true,
      validatedAt: new Date()
    })
  }

  return { success: true, alreadyValidated: false, date: today, pushups: target }
})
