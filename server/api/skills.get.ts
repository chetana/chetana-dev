import { getDB } from '../utils/db'
import { skills } from '../db/schema'
import { asc } from 'drizzle-orm'

export default defineEventHandler(async () => {
  const db = getDB()
  const allSkills = await db.select().from(skills).orderBy(asc(skills.sortOrder))

  // Group by category
  const grouped: Record<string, typeof allSkills> = {}
  for (const skill of allSkills) {
    if (!grouped[skill.category]) grouped[skill.category] = []
    grouped[skill.category].push(skill)
  }

  return grouped
})
