import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { blogPosts } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const contentFr = `## Code-first vs Design-first : une décision d'architecture souvent négligée

Quand une équipe commence à exposer des APIs, elle choisit rarement explicitement entre deux approches. Elle fait ce qui est naturel : les développeurs écrivent le code, Spring Boot (ou NestJS, ou FastAPI) génère automatiquement le Swagger, et voilà — l'API est "documentée".

C'est le **code-first**. Et c'est le choix par défaut de 90% des équipes.

Le problème, c'est que cette approche place la structure interne du code au centre. Les noms de classes Java deviennent des noms de champs. L'organisation du code influence les endpoints. Le contrat API reflète l'implémentation, pas le besoin.

Le **design-first**, c'est l'inverse : le contrat API est écrit *avant* le code. C'est le contrat qui dicte l'implémentation, pas l'inverse.

Chez DJUST, on a fait ce choix il y a quelques années. Ce billet est un retour d'expérience sur ce que ça implique concrètement.

---

## Pourquoi design-first ?

### L'API comme produit

Nos APIs B2B sont consommées par des intégrateurs externes — des partenaires qui construisent des frontends sur notre plateforme, des connecteurs ERP, des outils métier. Pour eux, l'API est le produit. Pas notre code Java. Pas notre architecture interne.

Si notre API change de comportement entre deux versions parce qu'un développeur a refactoré une classe, le partenaire se retrouve à déboguer un problème qu'il n'a pas créé. C'est inacceptable dans un contexte B2B avec des SLAs contractuels.

Le design-first force à penser l'API du point de vue de l'utilisateur *avant* de coder. C'est une discipline.

### La collaboration interdisciplinaire

Chez DJUST, notre PM est capable d'écrire des contrats OpenAPI. Ce n'est pas courant — la plupart des PMs travaillent en prose (user stories, specs fonctionnelles). Le nôtre travaille en YAML.

Ça change fondamentalement la collaboration : le contrat devient le lieu de discussion entre le PM, le Back et le FOC. On ne discute plus de "est-ce que ce champ devrait être obligatoire ?" sur un Notion — on le voit directement dans le YAML, on peut l'ouvrir dans Swagger UI, on peut tester.

### Les guidelines LLM

Récemment, notre PM a poussé un cran plus loin : il a publié des guidelines d'écriture de contrat OpenAPI "à la sauce DJUST" dans Notion. L'objectif ? Les passer à un LLM pour générer des contrats standardisés automatiquement.

> *"On file ça à notre LLM préféré et il commence à en sortir des contrats mieux standardisés."*

C'est la prochaine frontière du design-first : l'IA comme outil de cohérence stylistique sur les contrats.

---

## Le workflow concret chez DJUST

Voici comment on travaille concrètement :

**1. Le PM écrit le contrat**

Le PM rédige le contrat OpenAPI en YAML, directement dans VSCode, et le pushe sur un repo Git dédié (\`djustlab/djust-api-contract\`). Pas de Notion, pas de document Word — du YAML versionné, reviewable, diffable.

**2. Le Back implémente**

Les développeurs Backend implémentent la feature en prenant le contrat comme référence. Spring Boot génère son propre OpenAPI à partir du code.

**3. La vérification**

C'est là où ça devenait flou avant. Maintenant, on a un outil de diff : on colle le YAML du PM à gauche, l'URL de l'api-docs du code à droite, et on voit immédiatement les écarts. Descriptions manquantes, types différents, champs renommés — tout apparaît.

**4. Le FOC valide**

En tant que premier consommateur des APIs, le FOC teste l'implémentation contre le contrat de référence et remonte les problèmes.

---

## Le cas particulier des APIs "cachées"

Il y a un cas de figure intéressant qui révèle quelque chose de fondamental dans l'approche design-first : **les APIs purement techniques**.

Lors d'une discussion sur un projet récent, on parlait d'une API qui n'allait être exposée que techniquement — pas de documentation publique, pas d'intégrateurs externes, une API utilisée en interne entre services.

La question posée : doit-on quand même appliquer le processus design-first pour cette API ?

Ma réponse :

> *"C'est une API qui ne sera exposée que techniquement et on la mettra en caché, donc les devs peuvent la designer comme ils veulent — faudra juste que la QA puisse la tester, donc faudra lui donner le contrat une fois terminé."*

C'est une nuance importante. Le design-first n'est pas un rituel dogmatique. C'est un outil au service d'un objectif : **garantir que les consommateurs de l'API peuvent travailler de manière autonome**.

Pour une API purement interne, les développeurs ont la liberté de conception — ils savent ce qu'ils font. Le seul contrat qu'ils doivent livrer, c'est pour permettre les tests QA. Ce n'est pas la même contrainte qu'une API publique.

Le principe sous-jacent : **la rigueur du processus est proportionnelle à la surface d'exposition**.

---

## Les défis du design-first

Le design-first n'est pas gratuit. Voici les difficultés réelles :

### La dérive du contrat

Sans outil de vérification, le contrat et le code divergent silencieusement. Le développeur fait un refactoring anodin, change un nom de champ, oublie de mettre à jour le YAML. Le contrat devient périmé sans que personne ne s'en rende compte immédiatement.

C'est le problème qu'on a résolu avec l'outil de diff OpenAPI — mais la vraie solution à long terme est l'intégration dans la CI/CD.

### Le PM doit savoir écrire du YAML

Notre PM est atypique. La plupart des PMs n'ont ni l'envie ni la compétence pour écrire des contrats OpenAPI. Si votre PM n'est pas technique, le design-first repose sur le Back — et on perd l'avantage de la collaboration interdisciplinaire.

Une solution partielle : les guidelines + LLM. Le PM décrit l'API en langage naturel, le LLM génère le YAML, le Back valide. C'est ce vers quoi on tend.

### La résistance au changement

"Ça prend plus de temps." C'est vrai — au départ. Écrire un contrat avant de coder demande un effort upfront. L'argument inverse : combien de temps perd-on à chaque fois qu'un breaking change casse l'intégration d'un partenaire ? Combien de temps de debug évite-t-on quand le contrat est clair dès le départ ?

Le design-first est un investissement, pas un coût.

---

## Ce qu'on a appris

Après quelques années de design-first chez DJUST :

**Le contrat comme langue commune.** Le YAML OpenAPI est devenu la référence partagée entre le PM, le Back, le FOC et les intégrateurs externes. Quand il y a un désaccord sur le comportement d'une API, on ouvre le contrat — pas une spec Confluence ambiguë.

**La documentation n'est pas optionnelle.** Avec le design-first, la documentation n'est plus un afterthought — elle *est* le contrat. Les descriptions des champs, les exemples, les codes d'erreur : tout ça est pensé avant l'implémentation.

**La qualité se mesure différemment.** On ne dit plus "l'API est terminée quand le code compile". On dit "l'API est terminée quand le contrat est respecté et documenté".

---

*Chetana YIN — Janvier 2026*
*Engineering Manager chez DJUST. OMS, Payments, Cart.*`

const contentEn = `## Code-first vs Design-first: An Often-Overlooked Architecture Decision

When a team starts exposing APIs, they rarely explicitly choose between two approaches. They do what's natural: developers write the code, Spring Boot (or NestJS, or FastAPI) automatically generates the Swagger, and there you go — the API is "documented."

That's **code-first**. And it's the default choice of 90% of teams.

The problem is that this approach places the internal code structure at the center. Java class names become field names. Code organization influences endpoints. The API contract reflects the implementation, not the need.

**Design-first** is the opposite: the API contract is written *before* the code. The contract dictates the implementation, not the reverse.

At DJUST, we made this choice a few years ago. This post is an honest experience report on what it means in practice.

---

## Why Design-First?

### The API as Product

Our B2B APIs are consumed by external integrators — partners who build frontends on our platform, ERP connectors, business tools. For them, the API is the product. Not our Java code. Not our internal architecture.

If our API changes behavior between two versions because a developer refactored a class, the partner ends up debugging a problem they didn't create. That's unacceptable in a B2B context with contractual SLAs.

Design-first forces you to think about the API from the user's perspective *before* coding. It's a discipline.

### Interdisciplinary Collaboration

At DJUST, our PM can write OpenAPI contracts. That's not common — most PMs work in prose (user stories, functional specs). Ours works in YAML.

This fundamentally changes collaboration: the contract becomes the discussion space between PM, Backend, and FOC. We no longer debate "should this field be mandatory?" on a Notion page — we see it directly in the YAML, open it in Swagger UI, test it.

### LLM Guidelines

Recently, our PM pushed it a step further: he published "DJUST-style" OpenAPI writing guidelines in Notion. The goal? Feed them to an LLM to automatically generate standardized contracts.

> *"We feed it to our favorite LLM and it's starting to produce better standardized contracts."*

This is design-first's next frontier: AI as a stylistic consistency tool for contracts.

---

## The Concrete Workflow at DJUST

Here's how we work in practice:

**1. The PM writes the contract**

The PM drafts the OpenAPI contract in YAML, directly in VSCode, and pushes it to a dedicated Git repo (\`djustlab/djust-api-contract\`). No Notion, no Word document — versioned YAML, reviewable, diffable.

**2. The Backend implements**

Backend developers implement the feature using the contract as reference. Spring Boot generates its own OpenAPI from the code.

**3. Verification**

This used to be the fuzzy part. Now we have a diff tool: we paste the PM's YAML on the left, the api-docs URL of the code on the right, and immediately see the gaps. Missing descriptions, different types, renamed fields — everything appears.

**4. FOC validation**

As the first API consumer, the FOC tests the implementation against the reference contract and reports issues.

---

## The Special Case of "Hidden" APIs

There's an interesting edge case that reveals something fundamental about design-first: **purely technical APIs**.

During a discussion on a recent project, we were talking about an API that would only be technically exposed — no public documentation, no external integrators, an API used internally between services.

The question: should we still apply the design-first process for this API?

My answer:

> *"It's an API that will only be technically exposed and we'll keep it hidden, so the devs can design it however they want — they just need to give the contract once it's done so the QA can test it."*

This is an important nuance. Design-first isn't a dogmatic ritual. It's a tool serving an objective: **ensuring API consumers can work autonomously**.

For a purely internal API, developers have design freedom — they know what they're doing. The only contract they need to deliver is for QA testing. That's not the same constraint as a public API.

The underlying principle: **process rigor is proportional to exposure surface**.

---

## The Challenges of Design-First

Design-first isn't free. Here are the real difficulties:

### Contract Drift

Without a verification tool, contract and code diverge silently. A developer does a routine refactoring, renames a field, forgets to update the YAML. The contract becomes stale without anyone noticing immediately.

That's the problem we solved with the OpenAPI diff tool — but the real long-term solution is CI/CD integration.

### The PM Must Know How to Write YAML

Our PM is atypical. Most PMs neither want nor know how to write OpenAPI contracts. If your PM isn't technical, design-first falls on the Backend — and we lose the interdisciplinary collaboration advantage.

A partial solution: guidelines + LLM. The PM describes the API in natural language, the LLM generates the YAML, the Backend validates. That's where we're heading.

### Resistance to Change

"It takes more time." True — initially. Writing a contract before coding requires upfront effort. The counter-argument: how much time do we lose every time a breaking change breaks a partner's integration? How much debugging do we avoid when the contract is clear from the start?

Design-first is an investment, not a cost.

---

## What We've Learned

After a few years of design-first at DJUST:

**The contract as common language.** The OpenAPI YAML has become the shared reference between PM, Backend, FOC, and external integrators. When there's disagreement about API behavior, we open the contract — not an ambiguous Confluence spec.

**Documentation isn't optional.** With design-first, documentation isn't an afterthought — it *is* the contract. Field descriptions, examples, error codes: all thought through before implementation.

**Quality is measured differently.** We no longer say "the API is done when the code compiles." We say "the API is done when the contract is respected and documented."

---

*Chetana YIN — January 2026*
*Engineering Manager at DJUST. OMS, Payments, Cart.*`

const contentKm = `## Code-first ទល់ Design-first

ក្រុម developers ភាគច្រើនប្រើ code-first៖ code → auto-generated Swagger ។ ល្ងង់ ប៉ុន្តែ contract API ឆ្លុះ implementation មិនមែន need ។

Design-first = contract YAML ត្រូវបានសរសេរ *មុន* code ។ DJUST ប្រើ approach នេះ ។

---

## Workflow ជាក់ស្តែង

1. PM សរសេរ OpenAPI contract (YAML) ក្នុង VSCode → push Git repo
2. Back developers implement ដោយ reference contract
3. Diff tool verify ថា code ≈ contract (ឧបករណ៍ custom បង្កើតក្នុង ១ ថ្ងៃ)
4. FOC validate ជាអ្នកប្រើ API ដំបូង

---

## APIs "cachées" — Freedom Total

APIs ខាងក្នុងតែ (technical only) ? Developers អាចdesign ដោយ freedom — contract ត្រូវ deliver បន្ទាប់ for QA tests ។ ការ rigorous proportional ទៅ exposure surface ។

---

## ការរៀន

- Contract = lingua franca : PM + Back + FOC + integrators
- Documentation = contract (not afterthought)
- Done = contract respected, not just compiles
- LLM + PM guidelines = prochaine étape standardisation

---

*Chetana YIN — មករា ២០២៦*
*Engineering Manager នៅ DJUST*`

async function seedBlogDesignFirst() {
  console.log('📐 Seeding blog article: API Design-First...')

  await db.delete(blogPosts).where(eq(blogPosts.slug, 'api-design-first-philosophie'))

  await db.insert(blogPosts).values({
    slug: 'api-design-first-philosophie',
    titleFr: "API Design-First : quand le contrat précède le code",
    titleEn: "API Design-First: When the Contract Comes Before the Code",
    titleKm: "API Design-First ៖ contract មុន code",
    contentFr,
    contentEn,
    contentKm,
    excerptFr: "Chez DJUST, notre PM écrit les contrats OpenAPI en YAML avant que les devs codent. Retour d'expérience sur le design-first : workflow concret, cas des APIs cachées où les devs ont liberté totale, et les défis réels de cette approche.",
    excerptEn: "At DJUST, our PM writes OpenAPI contracts in YAML before devs code. Experience report on design-first: concrete workflow, hidden APIs where devs have total freedom, and the real challenges of this approach.",
    excerptKm: "នៅ DJUST PM សរសេរ OpenAPI contracts YAML មុន code ។ Retour d'expérience on design-first workflow challenges and LLM as next step ។",
    tags: ['API', 'Design-First', 'Architecture', 'OpenAPI', 'Engineering'],
    published: true
  })

  console.log('✅ Design-First article seeded!')
}

seedBlogDesignFirst().catch(console.error)
