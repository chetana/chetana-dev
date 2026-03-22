const API = 'https://api.chetana.dev'

type ExperienceRaw = {
  id: number; company: string; role_fr: string; role_en: string; role_km?: string
  date_start: string; date_end: string | null; location: string | null
  bullets_fr: string[]; bullets_en: string[]; bullets_km?: string[]; sort_order: number | null
}

export default defineEventHandler(async () => {
  const raw = await $fetch<ExperienceRaw[]>(`${API}/experiences`)
  return raw.map(e => ({
    id: e.id,
    company: e.company,
    roleFr: e.role_fr,
    roleEn: e.role_en,
    roleKm: e.role_km,
    dateStart: e.date_start,
    dateEnd: e.date_end,
    location: e.location,
    bulletsFr: e.bullets_fr ?? [],
    bulletsEn: e.bullets_en ?? [],
    bulletsKm: e.bullets_km,
    sortOrder: e.sort_order,
  }))
})
