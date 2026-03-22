const API = 'https://api.chetana.dev'

type Skill = { id: number; category: string; name: string; color: string | null; sort_order: number | null }

export default defineEventHandler(async () => {
  const allSkills = await $fetch<Skill[]>(`${API}/skills`)

  const grouped: Record<string, Skill[]> = {}
  for (const skill of allSkills) {
    if (!grouped[skill.category]) grouped[skill.category] = []
    grouped[skill.category].push(skill)
  }
  return grouped
})
