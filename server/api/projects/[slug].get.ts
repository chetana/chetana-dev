const API = 'https://api.chetana.dev'

type ProjectRaw = {
  id: number; slug: string; title_fr: string; title_en: string; title_km?: string
  description_fr: string; description_en: string; description_km?: string
  tags: string[]; github_url?: string; demo_url?: string; image_url?: string
  type?: string; featured: boolean; created_at: string
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, message: 'Slug is required' })

  const p = await $fetch<ProjectRaw>(`${API}/projects/${slug}`).catch((e) => {
    throw createError({ statusCode: e.statusCode ?? 500, message: e.data?.error ?? 'Not found' })
  })

  return {
    id: p.id, slug: p.slug,
    titleFr: p.title_fr, titleEn: p.title_en, titleKm: p.title_km,
    descriptionFr: p.description_fr, descriptionEn: p.description_en, descriptionKm: p.description_km,
    tags: p.tags ?? [],
    githubUrl: p.github_url, demoUrl: p.demo_url, imageUrl: p.image_url,
    type: p.type, featured: p.featured, createdAt: p.created_at,
  }
})
