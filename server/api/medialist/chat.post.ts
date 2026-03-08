import { geminiChatWithSearch, type ChatMessage } from '../../utils/vertex'

export default defineEventHandler(async (event) => {
  const body = await readBody(event) as {
    messages: ChatMessage[]
    mediaContext: {
      title: string
      type: 'anime' | 'game'
      year: number | null
      genres: string[]
      synopsis: string | null
      status: string
      score: number | null
      episodes_watched?: number | null
      episodes_total?: number | null
      mal_score?: number | null
      metacritic?: number | null
      platform?: string | null
      studios?: string[] | null
      developers?: string[] | null
    }
  }

  if (!body.messages?.length || !body.mediaContext) {
    throw createError({ statusCode: 400, statusMessage: 'Missing fields' })
  }

  const messages = body.messages.slice(-20) // cap historique
  const ctx = body.mediaContext

  const lines = [
    `- Titre : ${ctx.title}`,
    `- Type : ${ctx.type === 'anime' ? 'Animé japonais' : 'Jeu vidéo'}`,
    ctx.year ? `- Année : ${ctx.year}` : null,
    ctx.genres?.length ? `- Genres : ${ctx.genres.join(', ')}` : null,
    ctx.synopsis ? `- Synopsis : ${ctx.synopsis.slice(0, 600)}` : null,
    ctx.status ? `- Statut de visionnage/jeu : ${ctx.status}` : null,
    ctx.score ? `- Score personnel de l'utilisateur : ${ctx.score}/10` : null,
    ctx.episodes_watched != null && ctx.episodes_total
      ? `- Épisodes vus : ${ctx.episodes_watched}/${ctx.episodes_total}` : null,
    ctx.mal_score ? `- Score MyAnimeList : ${ctx.mal_score}/10` : null,
    ctx.metacritic ? `- Score Metacritic : ${ctx.metacritic}/100` : null,
    ctx.platform ? `- Plateforme jouée : ${ctx.platform}` : null,
    ctx.studios?.length ? `- Studio(s) : ${ctx.studios.join(', ')}` : null,
    ctx.developers?.length ? `- Développeur(s) : ${ctx.developers.join(', ')}` : null,
  ].filter(Boolean).join('\n')

  const systemInstruction = `Tu es un assistant passionné de culture pop, expert en animés japonais et jeux vidéo. Tu réponds en français, de façon concise mais enthousiaste et précise.

L'utilisateur consulte actuellement la fiche de ce média :
${lines}

Aide-le à mieux découvrir ce média : personnages, arcs, lore, easter eggs, comparaisons avec d'autres œuvres, conseils de visionnage/lecture/jeu. Si une information est incertaine, indique-le clairement plutôt que d'inventer.`

  const result = await geminiChatWithSearch(messages, systemInstruction)
  return result
})
