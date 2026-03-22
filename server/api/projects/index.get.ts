const API = 'https://api.chetana.dev'

type ProjectRaw = {
  id: number; slug: string; title_fr: string; title_en: string; title_km?: string
  description_fr: string; description_en: string; description_km?: string
  tags: string[]; github_url?: string; demo_url?: string; image_url?: string
  type?: string; featured: boolean; created_at: string
}

function mapProject(p: ProjectRaw) {
  return {
    id: p.id, slug: p.slug,
    titleFr: p.title_fr, titleEn: p.title_en, titleKm: p.title_km,
    descriptionFr: p.description_fr, descriptionEn: p.description_en, descriptionKm: p.description_km,
    tags: p.tags ?? [],
    githubUrl: p.github_url, demoUrl: p.demo_url, imageUrl: p.image_url,
    type: p.type, featured: p.featured, createdAt: p.created_at,
  }
}

export default defineEventHandler(async () => {
  const raw = await $fetch<ProjectRaw[]>(`${API}/projects`)
  return raw.map(mapProject)
})
