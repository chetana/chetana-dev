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
