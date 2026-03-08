import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { blogPosts } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const contentFr = `## Un carnet de bord qui n'existait pas

Je me souviens du premier anime que j'ai regardé en boucle jusqu'à ne plus pouvoir m'arrêter. *Dragon Ball Z* sur RTL9, un mercredi après-midi. Je devais avoir huit ans. Je ne savais pas que ça allait structurer une partie entière de mon rapport à la narration, au rythme, à l'intensité des histoires.

Vingt ans plus tard, je vis à Paris. La personne que j'aime est à Phnom Penh. Six heures de décalage horaire, 9 000 km. Et on partage encore des animés, des jeux, des films — mais cette fois à travers un écran et des messages vocaux du matin.

À un moment, on a voulu se souvenir de tout ça. Pas juste "on a regardé ça ensemble" — mais quand, dans quel état d'esprit, avec quelle note. Ce genre de mémoire culturelle collective qui ressemble à un journal de bord de couple. Il n'existait aucun outil qui correspondait exactement à ce besoin. Alors j'ai construit le mien.

---

## Le premier prototype, en deux heures

Le vendredi soir, j'ouvre un terminal. Pas pour le travail — pour voir ce que ça donne. Je crée un repo, je lance \`npx nuxi init\`, et je commence à écrire un endpoint qui appelle l'API de MyAnimeList.

En deux heures, j'ai une page qui liste des animés avec leurs jaquettes. Pas beau. Pas propre. Mais ça fonctionne. Et surtout, ça me donne envie de continuer.

C'est ce que j'aime dans les side projects : le feedback loop immédiat. Pas de réunion de planification, pas de comité d'architecture, pas de ticket Jira. Une idée → un test → quelque chose qui s'affiche. La vitesse de l'itération solo est enivrante quand on passe ses journées à manager plusieurs équipes en parallèle.

---

## La décision Rust : mettre les mains dedans

À un moment, j'ai voulu séparer proprement le backend de stockage du reste. Nuxt pour l'orchestration et l'UI, mais une API dédiée pour les données persistantes — quelque chose de stable, de typé, de minimal.

J'aurais pu faire ça en Node. En Go. En Python FastAPI. J'ai choisi **Rust**.

Pas parce que c'était le bon outil pour ce besoin spécifique. C'était clairement surdimensionné pour un tracker personnel. J'ai choisi Rust parce qu'en tant qu'Engineering Manager, je recommandais parfois Rust à mes équipes pour des cas d'usage précis — sécurité mémoire, performance critique, workloads embarqués — sans l'avoir jamais pratiqué moi-même sur un vrai projet de bout en bout.

Il y a une limite à ce qu'on peut décider correctement sans avoir soi-même traversé les frictions du terrain. Le borrow checker de Rust est légendaire. J'avais lu des dizaines d'articles dessus. Mais lire, c'est différent de se retrouver à 23h à fixer un message d'erreur \`cannot borrow *x as mutable because it is also borrowed as immutable\` en se demandant pourquoi ce code parfaitement logique ne compile pas.

Ce projet m'a donné cette expérience. Et cette expérience a changé la qualité de mes discussions techniques sur Rust avec mes équipes. Je peux maintenant parler de la courbe d'apprentissage avec des exemples concrets. Je peux expliquer pourquoi Axum est élégant mais pourquoi \`sqlx\` demande du temps à apprivoiser. Je peux défendre ou challenger un choix Rust avec l'autorité du praticien, pas du manager qui a juste lu la doc.

Un Engineering Manager qui ne code plus finit par perdre quelque chose d'important : la capacité à sentir ce qui est réellement difficile pour ses équipes, et ce qui ne l'est pas. Les side projects, c'est ma façon de ne pas perdre ce sens-là.

---

## La courbe d'apprentissage, honnêtement

Rust est humiliant au début. Ce n'est pas une hyperbole.

Le compilateur est strict d'une façon que j'avais rarement rencontrée. Chaque variable a exactement un propriétaire. Chaque référence a une durée de vie explicite ou inférée. Si deux parties de votre code veulent modifier la même donnée en même temps, le compilateur refuse — à la compilation, pas au runtime.

Ce qui m'a frappé, c'est que ces règles ne sont pas arbitraires. Elles éliminent une classe entière de bugs — les data races, les use-after-free, les null pointer dereferences — qui font exploser les programmes en production depuis cinquante ans. Le compilateur est agressif parce qu'il garantit quelque chose de fort.

Mais la courbe est réelle. J'ai réécrit mon handler de route principale trois fois avant de comprendre pourquoi mes références de connexion PostgreSQL ne vivaient pas assez longtemps. Le \`Arc<Mutex<T>>\` pour partager l'état entre requêtes. Les traits \`Send\` et \`Sync\` sur les types async. Rien de tout ça n'est évident au premier passage.

Résultat : \`chetaku-rs\` tourne sur Google Cloud Run, démarre en sous-seconde, consomme environ 15 Mo de RAM, et n'a pas eu un seul crash depuis son déploiement. Aucune exception runtime. Aucun crash silencieux. Juste un binaire qui fait ce qu'il dit qu'il fait.

---

## Ce que la médiathèque révèle

Une fois que les données existaient dans la base — 47 animés, 23 jeux, des films, des séries — j'ai voulu des statistiques. Pas juste "combien d'animés", mais quelque chose qui ressemble à un profil.

J'ai écrit une requête SQL qui calcule un \`love_score\` pour chaque genre : le nombre d'entrées dans ce genre, multiplié par la note moyenne personnelle. Ça donne un score qui balance fréquence et appréciation. Un genre vu 30 fois avec une note moyenne de 6 est moins "aimé" qu'un genre vu 12 fois avec une note de 9.5.

Le résultat m'a surpris. Les genres qui émergent en tête ne sont pas forcément ceux auxquels j'aurais pensé spontanément. Les données ont une façon de révéler des préférences qu'on n'articule pas consciemment.

C'est pour ça que ce projet a une valeur au-delà du technique. Ce n'est pas un tracker. C'est un miroir de ce qu'on consomme et de ce qu'on en pense vraiment.

---

## Les détails qui comptent

Quelques choix d'implémentation qui méritent d'être mentionnés :

**Les arcs narratifs** sont codés à la main côté serveur. Pour chaque anime, un objet \`ANIME_ARCS\` indexé par l'ID MyAnimeList définit les arcs et les épisodes correspondants. C'est du travail manuel — mais les données sont stables. Un arc de *One Piece* ne va pas changer. Et l'alternative (scraper un wiki à chaque appel) est fragile et lente.

**Le cast** n'est jamais stocké en base. TMDB est appelé à la demande, sur la page de détail uniquement. Ça évite de stocker des données qui changent rarement et qui ne sont pas critiques — et ça maintient \`chetaku-rs\` dans son rôle : stocker *ce que j'ai vu et ressenti*, pas *toutes les métadonnées publiques* sur chaque œuvre.

**La suppression** n'est accessible qu'à moi. Mais elle est publiquement visible comme bouton côté UI quand je suis connecté. Ce genre de "soft security" — l'action est protégée mais pas cachée — est une décision UI délibérée. La transparence sur ce qui existe compte, même pour un outil personnel.

---

## Ce que ça m'a appris sur le fait de manager des équipes techniques

J'ai passé environ trois week-ends sur ce projet, de l'idée au déploiement. En journée, je gère des équipes qui font ce genre de travail à plein temps — architecture, APIs, bases de données, CI/CD.

Construire ce projet m'a rappelé quelques vérités utiles pour ce rôle :

**Le coût de switching est réel.** Quand on code seul, chaque interruption — une notification, un message — coûte 15 minutes de concentration retrouvée. C'est pour ça que mes équipes ont des blocs de temps protégés dans leur calendrier. Je le savais. Je le ressens mieux maintenant.

**Les edge cases émergent à l'usage.** J'avais prévu que le compteur d'épisodes ne prendrait en compte que les animés. C'est seulement en ajoutant des séries dans la base que j'ai réalisé que la requête SQL était trop restrictive. Aucun test unitaire n'aurait attrapé ça avant qu'on utilise vraiment le système. C'est un argument pour itérer vite et observer, pas pour itérer lentement et sur-spécifier.

**La dette technique choisie n'est pas la même que la dette subie.** Les arcs narratifs hardcodés sont de la dette — mais c'est de la dette choisie, documentée, et cohérente avec les contraintes. La différence entre les deux, c'est la conscience et l'intention. Ce que j'essaie d'inculquer à mes équipes aussi.

---

## La suite

La médiathèque est vivante. On y ajoute des entrées régulièrement. Les stats évoluent. Le profil de genres change à mesure qu'on explore de nouvelles choses.

La prochaine étape technique que j'envisage : ajouter les modes **OUTPAINT** et **INPAINTING** à ImagiChet (la génération d'images) — parce que les side projects ont une façon de générer leurs propres idées suivantes.

Mais surtout, ce projet m'a redonné quelque chose que le management a tendance à éroder lentement : le plaisir de construire quelque chose qui fonctionne, de A à Z, seul, dans le silence d'un week-end.`

const contentEn = `## A logbook that didn't exist

I remember the first anime I watched on loop until I couldn't stop. *Dragon Ball Z* on RTL9, a Wednesday afternoon. I must have been eight years old. I didn't know it would shape a significant part of how I relate to storytelling, pacing, and narrative intensity.

Twenty years later, I live in Paris. The person I love is in Phnom Penh. Six hours of time difference, 9,000 km. We still share anime, games, movies — but this time through a screen and morning voice messages.

At some point, we wanted to remember all of it. Not just "we watched this together" — but when, in what frame of mind, with what rating. The kind of shared cultural memory that looks like a couple's logbook. No tool existed that matched exactly this need. So I built my own.

---

## The first prototype, in two hours

Friday evening, I open a terminal. Not for work — just to see what happens. I create a repo, run \`npx nuxi init\`, and start writing an endpoint that calls the MyAnimeList API.

Two hours later, I have a page listing anime with cover art. Not pretty. Not clean. But working. And most importantly, it makes me want to keep going.

That's what I love about side projects: the immediate feedback loop. No planning meetings, no architecture committee, no Jira ticket. An idea → a test → something on screen. The iteration speed of solo work is intoxicating when your days are spent managing multiple teams in parallel.

---

## The Rust decision: getting hands-on

At some point, I wanted to cleanly separate the storage backend from the rest. Nuxt for orchestration and UI, but a dedicated API for persistent data — something stable, typed, minimal.

I could have done it in Node. In Go. In Python FastAPI. I chose **Rust**.

Not because it was the right tool for this specific need. It was clearly oversized for a personal tracker. I chose Rust because as an Engineering Manager, I sometimes recommended Rust to my teams for specific use cases — memory safety, performance-critical paths, embedded workloads — without having ever actually shipped a real end-to-end project in it myself.

There's a limit to how well you can make decisions without having personally gone through the friction on the ground. Rust's borrow checker is legendary. I'd read dozens of articles about it. But reading is different from finding yourself at 11pm staring at a \`cannot borrow *x as mutable because it is also borrowed as immutable\` error, wondering why perfectly logical code won't compile.

This project gave me that experience. And that experience changed the quality of my technical conversations about Rust with my teams. I can now talk about the learning curve with concrete examples. I can explain why Axum is elegant but why \`sqlx\` takes time to get comfortable with. I can defend or challenge a Rust architectural choice with the authority of a practitioner, not a manager who just read the docs.

An Engineering Manager who stops coding eventually loses something important: the ability to feel what is genuinely difficult for their teams, and what isn't. Side projects are my way of not losing that sense.

---

## The learning curve, honestly

Rust is humbling at first. That's not hyperbole.

The compiler is strict in a way I had rarely encountered. Every variable has exactly one owner. Every reference has an explicit or inferred lifetime. If two parts of your code want to modify the same data simultaneously, the compiler refuses — at compile time, not at runtime.

What struck me is that these rules aren't arbitrary. They eliminate an entire class of bugs — data races, use-after-free, null pointer dereferences — that have been crashing programs in production for fifty years. The compiler is aggressive because it guarantees something strong.

But the curve is real. I rewrote my main route handler three times before understanding why my PostgreSQL connection references didn't live long enough. The \`Arc<Mutex<T>>\` for sharing state between requests. The \`Send\` and \`Sync\` traits on async types. None of it is obvious on first pass.

Result: \`chetaku-rs\` runs on Google Cloud Run, starts in under a second, uses around 15 MB of RAM, and hasn't had a single crash since deployment. No runtime exceptions. No silent failures. Just a binary that does what it says it does.

---

## What the media library reveals

Once the data existed in the database — 47 anime, 23 games, movies, series — I wanted statistics. Not just "how many anime", but something that looks like a profile.

I wrote a SQL query that calculates a \`love_score\` for each genre: the number of entries in that genre, multiplied by the personal average rating. It produces a score that balances frequency and appreciation. A genre watched 30 times with an average score of 6 is less "loved" than one watched 12 times with an average of 9.5.

The result surprised me. The genres that emerge at the top aren't necessarily the ones I would have named spontaneously. Data has a way of surfacing preferences you don't consciously articulate.

That's why this project has value beyond the technical. It's not a tracker. It's a mirror of what we consume and what we genuinely think about it.

---

## The details that matter

A few implementation choices worth mentioning:

**Narrative arcs** are hardcoded server-side. For each anime, an \`ANIME_ARCS\` object indexed by MyAnimeList ID defines the arcs and corresponding episodes. It's manual work — but the data is stable. A *One Piece* arc isn't going to change. And the alternative (scraping a wiki on every request) is fragile and slow.

**Cast data** is never stored in the database. TMDB is called on demand, on the detail page only. This avoids storing data that rarely changes and isn't critical — and keeps \`chetaku-rs\` in its role: storing *what I've seen and felt*, not *all public metadata* about every work.

**Deletion** is only accessible to me. But it's publicly visible as a UI button when I'm logged in. This kind of "soft security" — the action is protected but not hidden — is a deliberate UI decision. Transparency about what exists matters, even for a personal tool.

---

## What this taught me about managing technical teams

I spent about three weekends on this project, from idea to deployment. During the day, I manage teams doing this kind of work full-time — architecture, APIs, databases, CI/CD.

Building this project reminded me of a few useful truths for that role:

**Context switching cost is real.** When coding alone, every interruption — a notification, a message — costs 15 minutes of recovered focus. That's why my teams have protected time blocks in their calendars. I knew this. I feel it more viscerally now.

**Edge cases emerge from actual use.** I had assumed the episode counter would only cover anime. It was only when I added series to the database that I noticed the SQL query was too restrictive. No unit test would have caught this before the system was actually used. That's an argument for iterating fast and observing, not iterating slowly and over-specifying.

**Chosen technical debt is not the same as accumulated debt.** Hardcoded narrative arcs are debt — but it's chosen, documented, and coherent with the constraints. The difference between the two is awareness and intention. What I try to instil in my teams as well.

---

## What's next

The media library is alive. We add entries regularly. Stats evolve. The genre profile shifts as we explore new things.

The next technical step I'm considering: adding **OUTPAINT** and **INPAINTING** modes to ImagiChet (the image generation tool) — because side projects have a way of generating their own next ideas.

But more than anything, this project gave back something that management tends to slowly erode: the pleasure of building something that works, from A to Z, alone, in the silence of a weekend.`

async function seedBlogMedialist() {
  console.log('📚  Seeding Médiathèque blog post...')

  await db.delete(blogPosts).where(eq(blogPosts.slug, 'medialist-rust-tracker'))
  console.log('🗑️  Cleared existing medialist blog post')

  await db.insert(blogPosts).values({
    slug: 'medialist-rust-tracker',
    titleFr: 'J\'ai construit un tracker multimédia en Rust pour me souvenir de tout ce qu\'on a regardé ensemble',
    titleEn: 'I built a multimedia tracker in Rust to remember everything we watched together',
    contentFr,
    contentEn,
    excerptFr: 'Dragon Ball Z sur RTL9, un mercredi après-midi. La distance Paris–Phnom Penh. Un tracker en Rust écrit un vendredi soir. Le récit d\'un Engineering Manager qui reprend les mains dans le cambouis — et ce que ça lui a appris.',
    excerptEn: 'Dragon Ball Z on RTL9, a Wednesday afternoon. The Paris–Phnom Penh distance. A Rust tracker written on a Friday evening. The story of an Engineering Manager getting hands-on again — and what it taught him.',
    tags: ['Rust', 'Side Project', 'Engineering Manager', 'Anime', 'Architecture', 'PostgreSQL'],
    published: true,
    createdAt: new Date('2026-03-08'),
    updatedAt: new Date('2026-03-08'),
  })

  console.log('✅ Médiathèque blog post seeded!')
  console.log('🎉 Done!')
}

seedBlogMedialist().catch(console.error)
