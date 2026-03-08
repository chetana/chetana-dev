export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const q = (query.q as string)?.trim()
  const type = query.type as string

  if (!q || q.length < 2) {
    throw createError({ statusCode: 400, statusMessage: 'Query too short' })
  }
  if (!['anime', 'game', 'movie', 'series'].includes(type)) {
    throw createError({ statusCode: 400, statusMessage: 'type must be anime, game, movie or series' })
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

  if (type === 'game') {
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
  }

  if (type === 'movie') {
    const res = await $fetch<any>(
      `https://api.themoviedb.org/3/search/movie?api_key=${config.tmdbApiKey}&query=${encodeURIComponent(q)}&page=1`
    )
    return (res.results ?? []).slice(0, 12).map((m: any) => ({
      id: m.id,
      title: m.title,
      title_original: m.original_title !== m.title ? m.original_title : null,
      cover_url: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
      year: m.release_date ? new Date(m.release_date).getFullYear() : null,
      episodes: null,
      genres: [],
      creator: null,
    }))
  }

  // type === 'series'
  const res = await $fetch<any>(
    `https://api.themoviedb.org/3/search/tv?api_key=${config.tmdbApiKey}&query=${encodeURIComponent(q)}&page=1`
  )
  return (res.results ?? []).slice(0, 12).map((s: any) => ({
    id: s.id,
    title: s.name,
    title_original: s.original_name !== s.name ? s.original_name : null,
    cover_url: s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
    year: s.first_air_date ? new Date(s.first_air_date).getFullYear() : null,
    episodes: null,
    genres: [],
    creator: null,
  }))
})
