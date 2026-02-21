import { getDB } from '../../utils/db'
import { healthEntries } from '../../db/schema'
import { asc } from 'drizzle-orm'

function getTodayDate(): string {
  return new Date().toISOString().slice(0, 10)
}

function getTodayTarget(dateStr: string): number {
  return dateStr >= '2026-02-17' ? 25 : 20
}

export default defineEventHandler(async () => {
  const db = getDB()
  const entries = await db.select().from(healthEntries).orderBy(asc(healthEntries.date))

  const today = getTodayDate()
  const todayEntry = entries.find(e => e.date === today)

  let totalPushups = 0
  let totalDays = 0
  let currentStreak = 0
  let longestStreak = 0
  let streak = 0

  // Calculate stats
  const validatedDates = new Set<string>()
  for (const entry of entries) {
    if (entry.validated) {
      totalPushups += entry.pushups
      totalDays++
      validatedDates.add(entry.date)
    }
  }

  // Calculate streaks by walking backwards from today
  const d = new Date(today)
  while (true) {
    const dateStr = d.toISOString().slice(0, 10)
    if (dateStr < '2026-01-01') break
    if (validatedDates.has(dateStr)) {
      streak++
    } else {
      break
    }
    d.setDate(d.getDate() - 1)
  }
  currentStreak = streak

  // Calculate longest streak by walking forward from start
  streak = 0
  const start = new Date('2026-01-01')
  const end = new Date(today)
  while (start <= end) {
    const dateStr = start.toISOString().slice(0, 10)
    if (validatedDates.has(dateStr)) {
      streak++
      if (streak > longestStreak) longestStreak = streak
    } else {
      streak = 0
    }
    start.setDate(start.getDate() + 1)
  }

  return {
    totalPushups,
    totalDays,
    currentStreak,
    longestStreak,
    todayValidated: todayEntry?.validated ?? false,
    todayTarget: getTodayTarget(today)
  }
})
