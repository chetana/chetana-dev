export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = (query.q as string)?.trim()
  const type = query.type as string

  if (!q || q.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Query too short' })
  }
  if (type !== 'anime' && type !== 'game') {
    throw createError({ statusCode: 400, statusMessage: 'type must be anime or game' })
  }

  const config = useRuntimeConfig()

  if (type === 'anime') {
    const res = await $fetch<any>(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&limit=12&sfw=false`
    )
    return (res.data ?? []).map((a: any) => ({
      id: a.mal_id,
      title: a.title,
      title_original: a.title_japanese ?? null,
      cover_url: a.images?.jpg?.image_url ?? null,
      year: a.year ?? a.aired?.prop?.from?.year ?? null,
      episodes: a.episodes ?? null,
      genres: (a.genres ?? []).map((g: any) => g.name),
      creator: a.studios?.[0]?.name ?? null,
    }))
  }

  // type === 'game'
  const res = await $fetch<any>(
    `https://api.rawg.io/api/games?key=${config.rawgApiKey}&search=${encodeURIComponent(q)}&page_size=12`
  )
  return (res.results ?? []).map((g: any) => ({
    id: g.id,
    title: g.name,
    title_original: null,
    cover_url: g.background_image ?? null,
    year: g.released ? new Date(g.released).getFullYear() : null,
    episodes: null,
    genres: (g.genres ?? []).map((gr: any) => gr.name),
    creator: null,
  }))
})
