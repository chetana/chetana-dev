const API = 'https://api.chetana.dev'

type BlogFullRaw = {
  id: number; slug: string; title_fr: string; title_en: string; title_km?: string
  content_fr: string; content_en: string; content_km?: string
  excerpt_fr: string; excerpt_en: string; excerpt_km?: string
  tags: string[]; published: boolean; created_at: string; updated_at: string
}

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug')
  if (!slug) throw createError({ statusCode: 400, message: 'Slug is required' })

  const p = await $fetch<BlogFullRaw>(`${API}/blog/${slug}`).catch((e) => {
    throw createError({ statusCode: e.statusCode ?? 500, message: e.data?.error ?? 'Not found' })
  })

  return {
    id: p.id, slug: p.slug,
    titleFr: p.title_fr, titleEn: p.title_en, titleKm: p.title_km,
    contentFr: p.content_fr, contentEn: p.content_en, contentKm: p.content_km,
    excerptFr: p.excerpt_fr, excerptEn: p.excerpt_en, excerptKm: p.excerpt_km,
    tags: p.tags ?? [], published: p.published,
    createdAt: p.created_at, updatedAt: p.updated_at,
  }
})
