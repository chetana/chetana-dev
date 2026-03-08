import { ANIME_ARCS } from '../../utils/anime-arcs'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const type = query.type as string
  const externalId = query.externalId as string

  if (!type || !externalId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing type or externalId' })
  }

  // ── Fetch stored entry from chetaku-rs ──────────────────────────────────────
  let entry: any
  try {
    entry = await $fetch(`${config.chetakuApiUrl}/media/${type}/${externalId}`)
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Entry not found' })
  }

  // ── Anime ───────────────────────────────────────────────────────────────────
  if (type === 'anime') {
    const malId = Number(externalId)

    const [detailsRes, episodesRes] = await Promise.allSettled([
      $fetch<any>(`https://api.jikan.moe/v4/anime/${malId}`),
      $fetch<any>(`https://api.jikan.moe/v4/anime/${malId}/episodes?page=1`),
    ])

    const details = detailsRes.status === 'fulfilled' ? detailsRes.value?.data ?? null : null
    const episodesRaw = episodesRes.status === 'fulfilled' ? episodesRes.value?.data ?? [] : []
    const episodesHasMore = episodesRes.status === 'fulfilled'
      ? episodesRes.value?.pagination?.has_next_page ?? false
      : false

    return {
      entry,
      type: 'anime',
      synopsis: details?.synopsis ?? null,
      trailer_youtube_id: details?.trailer?.youtube_id ?? null,
      mal_score: details?.score ?? null,
      rank: details?.rank ?? null,
      members: details?.members ?? null,
      studios: (details?.studios ?? []).map((s: any) => s.name),
      episodes_list: episodesRaw.map((ep: any) => ({
        number: ep.mal_id,
        title: ep.title ?? ep.title_romanji ?? null,
        filler: ep.filler ?? false,
        recap: ep.recap ?? false,
      })),
      episodes_has_more: episodesHasMore,
      arcs: ANIME_ARCS[malId] ?? null,
    }
  }

  // ── Movie ───────────────────────────────────────────────────────────────────
  if (type === 'movie') {
    const [movieRes, creditsRes] = await Promise.allSettled([
      $fetch<any>(`https://api.themoviedb.org/3/movie/${externalId}?api_key=${config.tmdbApiKey}&language=fr-FR`),
      $fetch<any>(`https://api.themoviedb.org/3/movie/${externalId}/credits?api_key=${config.tmdbApiKey}`),
    ])
    const movie = movieRes.status === 'fulfilled' ? movieRes.value : null
    const credits = creditsRes.status === 'fulfilled' ? creditsRes.value : null
    const director = credits?.crew?.find((c: any) => c.job === 'Director')?.name ?? null
    return {
      entry,
      type: 'movie',
      overview: movie?.overview ?? null,
      tmdb_score: movie?.vote_average ? Math.round(movie.vote_average * 10) / 10 : null,
      director,
      tagline: movie?.tagline ?? null,
      runtime: movie?.runtime ?? null,
    }
  }

  // ── Series ───────────────────────────────────────────────────────────────────
  if (type === 'series') {
    const tv = await $fetch<any>(`https://api.themoviedb.org/3/tv/${externalId}?api_key=${config.tmdbApiKey}&language=fr-FR`).catch(() => null)

    // Fetch episodes for each real season (exclude season 0 = specials, max 15)
    const seasons: any[] = (tv?.seasons ?? []).filter((s: any) => s.season_number > 0).slice(0, 15)
    const seasonResults = await Promise.allSettled(
      seasons.map((s: any) =>
        $fetch<any>(`https://api.themoviedb.org/3/tv/${externalId}/season/${s.season_number}?api_key=${config.tmdbApiKey}&language=fr-FR`)
      )
    )
    const seasons_list = seasons.map((s: any, i: number) => ({
      season_number: s.season_number,
      name: s.name,
      episode_count: s.episode_count,
      episodes: seasonResults[i].status === 'fulfilled'
        ? (seasonResults[i].value?.episodes ?? []).map((e: any) => ({
            number: e.episode_number,
            title: e.name ?? null,
          }))
        : [],
    }))

    return {
      entry,
      type: 'series',
      overview: tv?.overview ?? null,
      tmdb_score: tv?.vote_average ? Math.round(tv.vote_average * 10) / 10 : null,
      creator: tv?.created_by?.[0]?.name ?? null,
      tagline: tv?.tagline ?? null,
      number_of_seasons: tv?.number_of_seasons ?? null,
      number_of_episodes: tv?.number_of_episodes ?? null,
      seasons_list,
    }
  }

  // ── Game ────────────────────────────────────────────────────────────────────
  const [gameRes, screenshotsRes] = await Promise.allSettled([
    $fetch<any>(`https://api.rawg.io/api/games/${externalId}?key=${config.rawgApiKey}`),
    $fetch<any>(`https://api.rawg.io/api/games/${externalId}/screenshots?key=${config.rawgApiKey}`),
  ])

  const game = gameRes.status === 'fulfilled' ? gameRes.value : null
  const screenshots = screenshotsRes.status === 'fulfilled'
    ? (screenshotsRes.value?.results ?? []).map((s: any) => s.image)
    : []

  return {
    entry,
    type: 'game',
    description: game?.description_raw ?? null,
    metacritic: game?.metacritic ?? null,
    website: game?.website ?? null,
    developers: (game?.developers ?? []).map((d: any) => d.name),
    publishers: (game?.publishers ?? []).map((p: any) => p.name),
    screenshots,
  }
})
