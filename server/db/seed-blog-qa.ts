import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { blogPosts } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const contentFr = `## QA en 2026 : un poste en sursis ou plus indispensable que jamais ?

En 2026, dans l'écosystème startup, le QA est souvent le premier poste qu'on supprime quand les temps sont durs. "Les devs peuvent tester eux-mêmes." "L'IA va automatiser tout ça." "On n'a pas le budget."

J'entends ces phrases régulièrement. Et pourtant, dans mon équipe chez DJUST, la QA est devenue le pilier silencieux sans lequel plus personne ne veut travailler. Voici l'histoire.

---

## Le contexte : une startup B2B sous pression

DJUST est une plateforme e-commerce B2B SaaS. En tant qu'Engineering Manager, je gère l'équipe OMS (Order Management System) — commandes, paiements, panier, intégrations fournisseurs. C'est le cœur transactionnel, là où chaque bug a un impact business direct.

Comme beaucoup de startups, DJUST a connu des phases de croissance et de contraction. Les signatures clients sont complexes, le marché B2B est exigeant, et chaque décision de recrutement ou de réduction d'effectif se ressent immédiatement.

---

## Acte 1 : De 0 à 3 QA — la montée en puissance

Au début, il n'y avait qu'**une seule QA manuelle**. Les tests étaient artisanaux, les régressions fréquentes, et chaque release était un moment de stress. On testait "à la main", on croisait les doigts, on déployait le jeudi en espérant que le vendredi se passe bien.

Puis l'équipe QA a grandi à **3 personnes**. C'est à ce moment qu'elle est arrivée — une développeuse C# avec **10 ans d'expérience** qui avait décidé de changer de voie pour devenir QA. Un profil atypique qui allait tout changer.

---

## Acte 2 : Le profil atypique qui change la donne

Quand une développeuse senior avec une décennie de code derrière elle arrive en QA, ça se voit immédiatement. Elle ne se contente pas de cliquer sur des boutons et de remplir des fiches de bug. Elle comprend le code, elle anticipe les cas limites, elle pense en systèmes.

Dès son arrivée, elle a poussé pour **structurer la QA** :

- **Tests E2E automatisés** adaptés à nos développeurs — pas des tests Selenium fragiles écrits dans un coin, mais des tests pensés avec et pour l'équipe dev
- **Spécifications en amont** — elle s'est naturellement rapprochée de notre Product Manager pour valider les specs *avant* le lancement des développements
- **Critères d'acceptance rigoureux** — chaque ticket est passé au crible avant même qu'un dev n'ouvre son IDE
- **Processus de validation structuré** — fini le "ça a l'air de marcher", place à des scénarios de test reproductibles

Son background de développeuse C# lui donnait un avantage énorme : elle parlait le même langage que les devs, comprenait les contraintes techniques, et savait exactement où les bugs allaient se cacher.

---

## Acte 3 : La réduction — et le choix que j'ai dû faire

Le contexte startup a rattrappé l'équipe. Signatures difficiles, complexité du marché B2B, nécessité de réduire les coûts.

La première QA est partie d'elle-même — elle avait envie de changer de voie et est devenue **Product Manager**. Une belle évolution.

Le deuxième QA a été **licencié** dans le cadre d'une réduction d'effectif. Les temps étaient durs, il fallait faire des choix.

Et puis il y a eu la question : est-ce qu'on garde la troisième ?

**Je l'ai défendue.** Pas par sentimentalisme — par conviction. J'ai expliqué à la direction son apport global à la boîte : la stabilité de nos releases, la réduction des bugs en production, le temps gagné par les développeurs qui ne passaient plus leurs journées à debugger des régressions, et surtout son rôle critique auprès du Product Manager.

Elle est restée. La dernière QA de la boîte.

---

## Acte 4 : Le pilier silencieux

Aujourd'hui, son rôle est **angulaire**. C'est le mot exact.

Notre **Product Manager** ne peut plus travailler sans elle. Avant chaque sprint, elle est là en amont : elle challenge les specs, identifie les incohérences, pose les questions que personne n'a pensé à poser. Quand le PM présente une feature aux devs, les specifications ont déjà été passées au crible. Résultat : moins d'allers-retours, moins d'ambiguïté, des développements plus fluides.

Nos **Project Managers**, ceux qui sont face aux clients — Franprix, Eiffage, VEJA — ont vu l'evolution. Ils ont vécu l'avant et l'apres. La stabilité de la plateforme s'est améliorée de manière visible. Ils ne veulent pas perdre ça. Quand on parle de QA, leur réponse est unanime : "On ne peut pas revenir en arrière."

Les **développeurs** eux-mêmes, qui au début voyaient la QA comme un frein ("encore un bug a corriger avant la release..."), ont compris que c'était un filet de sécurité qui les rendait plus rapides, pas plus lents.

---

## Acte 5 : L'inquiétude face a 2026

Mais elle s'inquiète. Et je la comprends.

**Première inquiétude : l'IA.** Quand on voit Claude Code écrire des tests unitaires en quelques secondes, quand les outils d'IA génèrent des scénarios de test automatiquement, la question se pose naturellement : "Est-ce que l'IA va me remplacer ?"

**Deuxième inquiétude : la solitude.** Elle est la dernière QA de la boîte. Pas de pair avec qui échanger, pas de communauté QA interne, pas de mentor. C'est un poste isolé dans une entreprise qui a tendance à voir la QA comme un coût plutôt qu'un investissement.

**Troisième inquiétude : l'incompréhension.** Dans une startup tech, le prestige va aux développeurs, aux architectes, aux devops. Le QA est souvent le "mal nécessaire" qu'on tolère. Certains collègues ne comprennent pas pourquoi ce poste existe encore en 2026.

---

## Ma réponse : l'IA ne remplace pas la rigueur humaine

Voici ce que je lui ai dit, et ce que je crois profondément :

**L'IA est un multiplicateur, pas un remplaçant.** Claude Code peut générer des tests, oui. Mais il ne peut pas :
- Comprendre le contexte métier d'un client qui commande 10 000 palettes de café via une API B2B
- Anticiper qu'un flux de paiement Adyen va se comporter différemment en production qu'en sandbox
- Sentir qu'une spec est incomplète parce qu'elle connaît l'historique des 50 dernières features
- Challenger un Product Manager sur la cohérence d'un parcours utilisateur

**Avec l'IA et elle, on peut aller plus loin.** Maintenant qu'elle vient de passer **senior**, c'est le moment d'élever les exigences. L'IA automatise les tâches répétitives — les tests de régression, la génération de cas de test, la détection de patterns. Ça la libère pour ce que seule elle sait faire : la réflexion stratégique sur la qualité.

Notre vision pour 2026 :
- **L'IA génère les tests**, elle les revoit et les enrichit
- **L'IA détecte les régressions**, elle analyse les causes profondes
- **L'IA couvre la quantité**, elle assure la pertinence
- **Les exigences qualité montent**, parce qu'on a les moyens de les imposer

---

## Ce que j'ai appris en tant qu'Engineering Manager

Défendre un poste QA dans une startup qui réduit ses effectifs, c'est un acte de management. Pas un acte technique.

Ça demande de :
1. **Quantifier l'apport** — pas en "nombre de bugs trouvés" (métrique absurde), mais en stabilité des releases, temps gagné par les devs, confiance des project managers face aux clients
2. **Expliquer le coût de l'absence** — combien coûte un bug en production chez un client B2B qui passe 2M de commandes par an ?
3. **Projeter l'avenir** — montrer que le QA + IA est plus puissant que le QA seul ou l'IA seule
4. **Encourager malgré l'adversité** — parce qu'être le dernier à un poste dans une boîte, c'est dur. C'est solitaire. Et ça demande une vraie force de caractère.

Elle a cette force. Et elle le prouve chaque jour.

---

## Conclusion : QA en 2026, plus que jamais

Non, le QA ne disparaît pas en 2026. Il se **transforme**.

Le QA manuel pur, celui qui clique et remplit des fiches — oui, celui-là est en danger. Mais le QA qui comprend le code, qui structure les processus, qui travaille en amont avec le product, qui impose une rigueur que les développeurs seuls ne peuvent pas maintenir — celui-là est **irremplaçable**.

Et quand en plus ce QA a 10 ans de développement C# derrière lui, qu'il parle le langage des devs, qu'il sait écrire des tests E2E qui tiennent la route, et qu'il a la résilience de tenir bon quand tout le monde autour dit que son métier va disparaître...

Ce n'est pas un poste à supprimer. C'est un poste à protéger.

*Chetana YIN — Février 2026*`

const contentEn = `## QA in 2026: A Dying Role or More Essential Than Ever?

In 2026, within the startup ecosystem, QA is often the first position cut when times get tough. "Devs can test themselves." "AI will automate all of that." "We don't have the budget."

I hear these sentences regularly. And yet, in my team at DJUST, QA has become the silent pillar without which no one wants to work anymore. Here's the story.

---

## The Context: A B2B Startup Under Pressure

DJUST is a B2B SaaS e-commerce platform. As Engineering Manager, I lead the OMS (Order Management System) team — orders, payments, cart, supplier integrations. It's the transactional core, where every bug has a direct business impact.

Like many startups, DJUST has gone through phases of growth and contraction. Client signings are complex, the B2B market is demanding, and every hiring or reduction decision is felt immediately.

---

## Act 1: From 0 to 3 QAs — The Rise

In the beginning, there was only **one manual QA**. Testing was artisanal, regressions were frequent, and every release was a stressful moment. We tested by hand, crossed our fingers, deployed on Thursday hoping Friday would go smoothly.

Then the QA team grew to **3 people**. That's when she arrived — a C# developer with **10 years of experience** who had decided to change paths and become a QA. An atypical profile that would change everything.

---

## Act 2: The Atypical Profile That Changed Everything

When a senior developer with a decade of coding behind her joins QA, it shows immediately. She doesn't just click buttons and fill bug reports. She understands code, anticipates edge cases, thinks in systems.

From the start, she pushed to **structure QA**:

- **Automated E2E tests** adapted to our developers — not fragile Selenium tests written in a corner, but tests designed with and for the dev team
- **Upstream specifications** — she naturally gravitated toward our Product Manager to validate specs *before* development began
- **Rigorous acceptance criteria** — every ticket gets scrutinized before a dev even opens their IDE
- **Structured validation process** — no more "looks like it works," replaced by reproducible test scenarios

Her C# developer background gave her a huge advantage: she spoke the same language as the devs, understood technical constraints, and knew exactly where bugs would hide.

---

## Act 3: The Reduction — And the Choice I Had to Make

The startup reality caught up with the team. Difficult signings, B2B market complexity, need to cut costs.

The first QA left on her own — she wanted a change and became a **Product Manager**. A great evolution.

The second QA was **laid off** as part of a workforce reduction. Times were tough, choices had to be made.

And then came the question: do we keep the third?

**I defended her.** Not out of sentimentality — out of conviction. I explained to leadership her global contribution to the company: the stability of our releases, the reduction of production bugs, the time saved by developers who no longer spent their days debugging regressions, and especially her critical role alongside the Product Manager.

She stayed. The last QA in the company.

---

## Act 4: The Silent Pillar

Today, her role is **pivotal**. That's the exact word.

Our **Product Manager** can't work without her anymore. Before every sprint, she's there upstream: challenging specs, identifying inconsistencies, asking questions nobody thought to ask. When the PM presents a feature to devs, the specifications have already been scrutinized. Result: fewer back-and-forths, less ambiguity, smoother development.

Our **Project Managers**, the ones facing clients — Franprix, Eiffage, VEJA — have seen the evolution. They lived through the before and after. Platform stability improved visibly. They don't want to lose that. When QA comes up, their answer is unanimous: "We can't go back."

The **developers** themselves, who initially saw QA as a brake ("another bug to fix before release..."), understood it was a safety net that made them faster, not slower.

---

## Act 5: The 2026 Anxiety

But she's worried. And I understand.

**First worry: AI.** When you see Claude Code writing unit tests in seconds, when AI tools generate test scenarios automatically, the question naturally arises: "Will AI replace me?"

**Second worry: solitude.** She's the last QA in the company. No peer to exchange with, no internal QA community, no mentor. It's an isolated position in a company that tends to see QA as a cost rather than an investment.

**Third worry: misunderstanding.** In a tech startup, prestige goes to developers, architects, devops. QA is often the "necessary evil" that's tolerated. Some colleagues don't understand why this position still exists in 2026.

---

## My Answer: AI Doesn't Replace Human Rigor

Here's what I told her, and what I deeply believe:

**AI is a multiplier, not a replacement.** Claude Code can generate tests, yes. But it can't:
- Understand the business context of a client ordering 10,000 pallets of coffee through a B2B API
- Anticipate that an Adyen payment flow will behave differently in production than in sandbox
- Sense that a spec is incomplete because she knows the history of the last 50 features
- Challenge a Product Manager on the consistency of a user journey

**With AI and her, we can go further.** Now that she's just been promoted to **senior**, it's time to raise the bar. AI automates repetitive tasks — regression tests, test case generation, pattern detection. It frees her for what only she can do: strategic thinking about quality.

Our vision for 2026:
- **AI generates tests**, she reviews and enriches them
- **AI detects regressions**, she analyzes root causes
- **AI covers quantity**, she ensures relevance
- **Quality standards rise**, because we now have the means to enforce them

---

## What I Learned as an Engineering Manager

Defending a QA position in a startup that's reducing headcount is an act of management. Not a technical act.

It requires:
1. **Quantifying the contribution** — not in "number of bugs found" (an absurd metric), but in release stability, time saved by devs, project manager confidence when facing clients
2. **Explaining the cost of absence** — how much does a production bug cost for a B2B client placing 2M in orders per year?
3. **Projecting the future** — showing that QA + AI is more powerful than QA alone or AI alone
4. **Encouraging despite adversity** — because being the last person in a role at a company is hard. It's lonely. And it takes real strength of character.

She has that strength. And she proves it every day.

---

## Conclusion: QA in 2026, More Than Ever

No, QA isn't disappearing in 2026. It's **transforming**.

Pure manual QA, the one that clicks and fills reports — yes, that one is in danger. But the QA who understands code, structures processes, works upstream with product, and enforces a rigor that developers alone can't maintain — that one is **irreplaceable**.

And when that QA also has 10 years of C# development behind her, speaks the developers' language, can write E2E tests that hold up, and has the resilience to stand firm when everyone around says her job is about to disappear...

That's not a position to cut. That's a position to protect.

*Chetana YIN — February 2026*`

async function seedBlogQA() {
  console.log('🧪 Seeding blog article: QA en 2026...')

  await db.delete(blogPosts).where(eq(blogPosts.slug, 'qa-en-2026'))

  await db.insert(blogPosts).values({
    slug: 'qa-en-2026',
    titleFr: "QA en 2026 : dernier rempart ou poste en sursis ?",
    titleEn: "QA in 2026: Last Line of Defense or a Role on Borrowed Time?",
    contentFr,
    contentEn,
    excerptFr: "Dans une startup qui réduit ses effectifs, j'ai défendu le poste QA. Retour sur le parcours d'une ex-dev C# devenue la dernière QA de la boîte — et pourquoi avec l'IA, son rôle n'a jamais été aussi crucial.",
    excerptEn: "In a startup cutting headcount, I defended the QA role. The story of a former C# developer who became the last QA standing — and why with AI, her rôle has never been more crucial.",
    tags: ['QA', 'Management', 'AI', 'Startup', 'Engineering'],
    published: true
  })

  console.log('Done seeding QA blog article!')
}

seedBlogQA().catch(console.error)
