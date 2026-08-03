import { geminiChatWithSearch, type ChatMessage } from '../../utils/vertex'

// Rate-limit anti-abus (en mémoire, par instance). Endpoint public appelant Gemini :
// on borne le débit par IP pour qu'un script ne puisse pas générer de coût en boucle.
const HITS = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_PER_MIN = 6
const MAX_PER_HOUR = 40

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const arr = (HITS.get(ip) ?? []).filter(t => now - t < 3_600_000) // garde 1h
  const lastMin = arr.filter(t => now - t < WINDOW_MS).length
  if (lastMin >= MAX_PER_MIN || arr.length >= MAX_PER_HOUR) {
    HITS.set(ip, arr)
    return true
  }
  arr.push(now)
  HITS.set(ip, arr)
  // Nettoyage opportuniste pour éviter de faire grossir la Map indéfiniment
  if (HITS.size > 2000) {
    HITS.forEach((v, k) => { if (!v.some(t => now - t < 3_600_000)) HITS.delete(k) })
  }
  return false
}

export default defineEventHandler(async (event) => {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  if (rateLimited(ip)) {
    throw createError({ statusCode: 429, statusMessage: 'Trop de requêtes, réessaie dans un instant.' })
  }

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

  // Plafonds de taille : borne le coût par appel (nb de messages + longueur de chaque message)
  const messages = body.messages
    .slice(-12)
    .map(m => ({ role: m.role, content: String(m.content ?? '').slice(0, 1500) }))
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

  // Endpoint public → pas de Google Search grounding (coût/requête) + modèle lite + sortie plafonnée
  const result = await geminiChatWithSearch(messages, systemInstruction, {
    enableSearch: false,
    maxOutputTokens: 700,
  })
  return result
})
