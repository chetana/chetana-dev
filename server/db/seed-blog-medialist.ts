import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { blogPosts } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const contentFr = `## Le Club Dorothée et la dette technique invisible

J'avais à peine cinq ans quand j'ai découvert Dragon Ball Z sur le Club Dorothée, un samedi matin sur TF1. Je ne comprenais pas encore très bien ce qui se passait dans les arcs narratifs — les sagas duraient des dizaines d'épisodes et je manquais souvent des semaines entières. Mais quelque chose dans ce format m'a accroché : la progression, la montée en puissance, le fait qu'on pouvait suivre quelque chose sur le long terme et voir qu'on avançait.

Trente ans plus tard, je suis Engineering Manager. Et il y a une certaine ironie à avoir passé ma vie professionnelle à construire des systèmes de suivi — roadmaps, OKRs, burn-down charts — sans jamais avoir construit un système de suivi pour ce qui m'a donné envie de construire des choses.

Alors j'ai construit la Médiathèque.

---

## Ce que j'avais vraiment envie d'apprendre

Ce projet n'est pas né d'un besoin fonctionnel urgent. J'aurais pu utiliser MyAnimeList, Letterboxd, RAWG — des outils qui existent et qui fonctionnent très bien. J'ai choisi de construire le mien parce que les problèmes techniques sous-jacents m'intéressaient.

En particulier, trois choses que je voulais vraiment traverser en pratique :

**L'orchestration multi-API.** Jikan pour les animés, RAWG pour les jeux, TMDB pour les films et séries — trois APIs avec des structures différentes, des identifiants différents (entier pour MAL, slug texte pour RAWG, entier encore pour TMDB), des conventions différentes. Comment construire une couche d'abstraction propre qui donne une expérience cohérente malgré ça ? C'est exactement le genre de problème qui ressemble à de la plomberie mais qui cache de vraies décisions d'architecture.

**Les statistiques pondérées.** Compter des entrées est trivial. Mais produire un profil de préférences qui révèle quelque chose de vrai sur ce qu'on apprécie — pas juste ce qu'on a consommé — c'est plus intéressant. Le \`love_score = count × avg_score\` est simple comme formule, mais il implique de stocker les bonnes données dès le départ (les genres dénormalisés dans un tableau PostgreSQL, les scores personnels nullable correctement gérés) et de faire les bons trade-offs dans les requêtes SQL.

**Rust en conditions réelles.** Je voulais mettre les mains dans Rust sur un vrai projet, pas sur des exercices Rustlings.

---

## La décision Rust : praticien ou théoricien

En tant qu'EM, je participe régulièrement à des discussions sur les choix de langage pour des nouveaux services : performance critique, sécurité mémoire, attractivité pour le recrutement, courbe d'apprentissage de l'équipe. Rust revient souvent.

Le problème, c'est que je discutais de Rust principalement comme quelqu'un qui l'a étudié — pas comme quelqu'un qui a eu à se battre avec le borrow checker à 23h sur du code qui semblait parfaitement logique mais ne compilait pas.

La différence est énorme. Quelqu'un qui a lu de la documentation sur Rust peut expliquer conceptuellement ce qu'est un lifetime. Quelqu'un qui a écrit \`Arc<Mutex<Pool>>\` dans un handler Axum parce qu'il a mis une heure à comprendre pourquoi ses références de connexion PostgreSQL n'avaient pas la bonne durée de vie — celui-là peut expliquer *pourquoi ça fait mal*, et dans quels contextes ce mal est justifié par les garanties obtenues.

C'est ce second type de crédibilité que je cherchais. Et c'est ce que j'ai obtenu.

---

## La courbe, honnêtement

Rust est difficile. Pas "difficile comme apprendre un nouveau framework" — difficile comme changer de paradigme mental sur la propriété de la mémoire.

Le compilateur refuse de compiler du code qui, dans n'importe quel autre langage, fonctionnerait parfaitement. Au début, c'est frustrant. Avec du recul, c'est exactement le point : le compilateur élimine à la compilation des bugs qui normalement explosent en production à 3h du matin. Ce qu'il refuse de compiler, c'est du code qui *aurait pu* créer une data race ou un use-after-free.

La section qui m'a pris le plus de temps : comprendre pourquoi je ne pouvais pas passer ma connexion PostgreSQL directement dans mes handlers de route. Il fallait encapsuler le pool dans un \`Arc\`, l'injecter via l'état Axum, et laisser chaque handler extraire sa connexion depuis l'état de la requête. Une fois compris, c'est évident et élégant. Avant de comprendre, c'est une série de messages d'erreur cryptiques.

J'ai réécrit mon handler principal trois fois. C'est le bon nombre.

---

## Les vrais problèmes intéressants

### La pagination des épisodes

Jikan renvoie les épisodes 100 par page. Pour un anime comme One Piece (1 100+ épisodes), ça fait au moins 11 appels pour avoir la liste complète. J'ai choisi de ne charger que la première page sur la fiche détail, avec un indicateur \`has_more\`. C'est une décision de produit autant que technique : charger 1 100 épisodes dans une liste côté client n'apporte rien à l'utilisateur qui veut juste savoir où il en est.

### Les arcs narratifs

Les APIs anime ne retournent pas les arcs — juste les épisodes numérotés. Les arcs, c'est de la connaissance éditoriale, pas de la métadonnée structurée. J'ai choisi de les hardcoder dans un fichier serveur (\`anime-arcs.ts\`), indexé par MAL ID. C'est de la dette technique assumée : maintenable manuellement, stable dans le temps (les arcs de Naruto ne vont pas changer), et infiniment plus fiable qu'un scraping de wiki.

En tant qu'EM, ce genre de décision me parle directement. La bonne dette technique, c'est de la dette *choisie* : on sait ce qu'on sacrifie, on sait pourquoi, et on sait dans quelles conditions ça deviendra un problème. La mauvaise dette, c'est de la dette *accumulée* sans conscience.

### Le love_score

La formule est simple : \`COUNT(*) × AVG(score)\`. Mais l'implémenter correctement impose de réfléchir à ce qu'on stocke. Les genres ne peuvent pas rester dans une relation séparée si on veut faire des agrégats efficaces — il faut les dénormaliser dans un \`TEXT[]\` PostgreSQL. Les scores NULL (entrées non notées) doivent être exclus du calcul de la moyenne, pas traités comme des zéros.

Ces détails semblent mineurs. Ils ont chacun nécessité une décision explicite et un ajustement du schéma.

---

## Ce que j'ai appris sur moi comme praticien

Je code beaucoup moins depuis que je suis EM. C'est inévitable — le calendrier ne ment pas. Ce projet m'a rappelé quelques vérités que je connaissais mais que je n'avais plus ressenties récemment.

**Le context switching coûte vraiment cher.** Coder seul sur un week-end m'a rappelé à quel point chaque interruption casse quelque chose. Ce que j'accepte parfois trop facilement pour mes équipes — "juste une réunion de 30 minutes au milieu de l'après-midi" — coûte bien plus que 30 minutes. Je le savais. Je le ressens différemment maintenant.

**Les edge cases sortent à l'usage, pas à la spec.** J'avais prévu un compteur d'épisodes. Je n'avais pas prévu qu'il faudrait qu'il couvre aussi les séries. C'est seulement en ajoutant de vraies entrées séries que j'ai vu que la requête SQL avait un \`WHERE media_type = 'anime'\` trop restrictif. Aucune spécification n'aurait capturé ça avant. C'est un argument pour itérer vite sur du réel, pas pour sur-spécifier en amont.

**Finir quelque chose a une valeur propre.** En management, beaucoup de choses restent toujours "en cours" — les conversations, les initiatives, les changements culturels. Un side project qui démarre et qui se déploie, c'est une boucle qui se ferme. C'est rare et ça fait du bien.

---

## Et maintenant

La médiathèque tourne. Les fiches se construisent. Les statistiques reflètent quelque chose de vrai sur trente ans d'animés regardés depuis un canapé, un samedi matin, devant le Club Dorothée.

Le prochain chantier technique sur lequel j'ai envie de mettre les mains : les modes d'édition d'image avancés (outpainting, inpainting) sur ImagiChet. Parce que les side projects ont cette propriété : ils génèrent leurs propres questions suivantes.`

const contentEn = `## Club Dorothée and invisible technical debt

I was barely five when I discovered Dragon Ball Z on Club Dorothée, a Saturday morning on TF1. I didn't fully understand what was happening in the narrative arcs — the sagas lasted dozens of episodes and I often missed entire weeks. But something in that format hooked me: the progression, the power-ups, the idea that you could follow something over time and actually see that you were making progress.

Thirty years later, I'm an Engineering Manager. And there's a certain irony in having spent my professional life building tracking systems — roadmaps, OKRs, burn-down charts — without ever building a tracking system for the thing that made me want to build things in the first place.

So I built the Media Library.

---

## What I actually wanted to learn

This project wasn't born from an urgent functional need. I could have used MyAnimeList, Letterboxd, RAWG — tools that exist and work very well. I chose to build my own because the underlying technical problems genuinely interested me.

Three things in particular I wanted to go through in practice:

**Multi-API orchestration.** Jikan for anime, RAWG for games, TMDB for movies and series — three APIs with different structures, different identifiers (integer for MAL, text slug for RAWG, integer again for TMDB), different conventions. How do you build a clean abstraction layer that delivers a consistent experience despite all that? It's exactly the kind of problem that looks like plumbing but hides real architectural decisions.

**Weighted statistics.** Counting entries is trivial. But producing a preference profile that reveals something true about what you enjoy — not just what you've consumed — is more interesting. The \`love_score = count × avg_score\` is simple as a formula, but it implies storing the right data from the start (genres denormalised into a PostgreSQL array, personal scores with nullable correctly handled) and making the right trade-offs in the SQL queries.

**Rust in real conditions.** I wanted to get my hands dirty in Rust on a real project, not Rustlings exercises.

---

## The Rust decision: practitioner or theorist

As an EM, I regularly participate in discussions about language choices for new services: performance-critical paths, memory safety, recruitment attractiveness, team learning curve. Rust comes up often.

The problem is that I was discussing Rust mostly as someone who had studied it — not as someone who had fought with the borrow checker at 11pm on code that seemed perfectly logical but wouldn't compile.

The difference is enormous. Someone who has read Rust documentation can conceptually explain what a lifetime is. Someone who has written \`Arc<Mutex<Pool>>\` inside an Axum handler because it took them an hour to understand why their PostgreSQL connection references had the wrong lifetime — that person can explain *why it hurts*, and in which contexts that pain is justified by the guarantees obtained.

It's this second type of credibility I was looking for. And it's what I got.

---

## The curve, honestly

Rust is hard. Not "hard like learning a new framework" — hard like changing your mental model of memory ownership.

The compiler refuses to compile code that, in any other language, would work perfectly fine. At first, this is frustrating. In hindsight, it's exactly the point: the compiler eliminates at compile time the bugs that normally explode in production at 3am. What it refuses to compile is code that *could have* created a data race or a use-after-free.

The section that took me the longest: understanding why I couldn't pass my PostgreSQL connection directly into my route handlers. I had to wrap the pool in an \`Arc\`, inject it via Axum state, and let each handler extract its connection from the request state. Once understood, it's obvious and elegant. Before understanding, it's a series of cryptic error messages.

I rewrote my main handler three times. That's the right number.

---

## The genuinely interesting problems

### Episode pagination

Jikan returns episodes 100 per page. For an anime like One Piece (1,100+ episodes), that's at least 11 calls to get the full list. I chose to only load the first page on the detail view, with a \`has_more\` indicator. It's as much a product decision as a technical one: loading 1,100 episodes into a client-side list adds nothing for a user who just wants to know where they left off.

### Narrative arcs

Anime APIs don't return arcs — just numbered episodes. Arcs are editorial knowledge, not structured metadata. I chose to hardcode them in a server file (\`anime-arcs.ts\`), indexed by MAL ID. It's consciously chosen technical debt: manually maintainable, stable over time (Naruto's arcs aren't going to change), and infinitely more reliable than scraping a wiki.

As an EM, this type of decision speaks directly to me. Good technical debt is *chosen* debt: you know what you're sacrificing, you know why, and you know under what conditions it will become a problem. Bad debt is *accumulated* debt without awareness.

### The love_score

The formula is simple: \`COUNT(*) × AVG(score)\`. But implementing it correctly requires thinking carefully about what you store. Genres can't stay in a separate relation if you want efficient aggregates — you have to denormalise them into a PostgreSQL \`TEXT[]\`. NULL scores (unrated entries) must be excluded from the average calculation, not treated as zeroes.

These details seem minor. Each required an explicit decision and a schema adjustment.

---

## What I learned about myself as a practitioner

I code significantly less since becoming an EM. The calendar doesn't lie. This project reminded me of a few truths I knew but hadn't felt recently.

**Context switching is genuinely expensive.** Coding alone over a weekend reminded me how much each interruption breaks something. What I sometimes accept too easily for my teams — "just a 30-minute meeting in the middle of the afternoon" — costs far more than 30 minutes. I knew this. I feel it differently now.

**Edge cases emerge from actual use, not from specs.** I had planned an episode counter. I hadn't planned that it would also need to cover series. It was only when I added real series entries that I noticed the SQL query had an overly restrictive \`WHERE media_type = 'anime'\`. No specification would have caught this beforehand. It's an argument for iterating fast on real things, not over-specifying upfront.

**Finishing something has its own value.** In management, many things are always "in progress" — conversations, initiatives, cultural changes. A side project that starts and gets deployed is a loop that closes. It's rare and it feels good.

---

## What's next

The media library is running. Entries are being added. Statistics reflect something true about thirty years of anime watched from a couch, on Saturday mornings, in front of Club Dorothée.

The next technical area I want to get my hands into: advanced image editing modes (outpainting, inpainting) on ImagiChet. Because side projects have this property: they generate their own next questions.`

async function seedBlogMedialist() {
  console.log('📚  Seeding Médiathèque blog post...')

  await db.delete(blogPosts).where(eq(blogPosts.slug, 'medialist-rust-tracker'))
  console.log('🗑️  Cleared existing medialist blog post')

  await db.insert(blogPosts).values({
    slug: 'medialist-rust-tracker',
    titleFr: 'J\'ai construit un tracker multimédia en Rust pour garder les mains dans le cambouis',
    titleEn: 'I built a multimedia tracker in Rust to keep my hands dirty',
    contentFr,
    contentEn,
    excerptFr: 'Dragon Ball Z sur le Club Dorothée, cinq ans, un samedi matin. Trente ans plus tard, Engineering Manager — et l\'envie de construire quelque chose de complexe juste pour voir si je suis encore capable de le faire.',
    excerptEn: 'Dragon Ball Z on Club Dorothée, five years old, a Saturday morning. Thirty years later, Engineering Manager — and the urge to build something complex just to see if I\'m still capable of doing it.',
    tags: ['Rust', 'Side Project', 'Engineering Manager', 'Anime', 'Architecture', 'PostgreSQL'],
    published: true,
    createdAt: new Date('2026-03-08'),
    updatedAt: new Date('2026-03-08'),
  })

  console.log('✅ Médiathèque blog post seeded!')
  console.log('🎉 Done!')
}

seedBlogMedialist().catch(console.error)
