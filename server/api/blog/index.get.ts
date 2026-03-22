const API = 'https://api.chetana.dev'

type BlogRaw = {
  id: number; slug: string; title_fr: string; title_en: string; title_km?: string
  excerpt_fr: string; excerpt_en: string; excerpt_km?: string
  tags: string[]; published: boolean; created_at: string; updated_at: string
}

function mapBlog(p: BlogRaw) {
  return {
    id: p.id, slug: p.slug,
    titleFr: p.title_fr, titleEn: p.title_en, titleKm: p.title_km,
    excerptFr: p.excerpt_fr, excerptEn: p.excerpt_en, excerptKm: p.excerpt_km,
    tags: p.tags ?? [], published: p.published,
    createdAt: p.created_at, updatedAt: p.updated_at,
  }
}

export default defineEventHandler(async () => {
  const raw = await $fetch<BlogRaw[]>(`${API}/blog`)
  return raw.map(mapBlog)
})
