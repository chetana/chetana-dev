import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { blogPosts } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const contentFr = `## Le problème : un contrat qui dérive en silence

Chez DJUST, on pratique le design-first pour nos APIs. Concrètement : notre Product Manager écrit les contrats OpenAPI (en YAML, dans un repo Git dédié) *avant* que les développeurs commencent à coder. L'idée est noble — le contrat est la loi, le code s'y conforme.

Le problème ? On n'avait aucun moyen de vérifier que le code respectait effectivement le contrat.

Le développeur implémentait sa feature. Il générait son OpenAPI automatiquement via Spring Boot. Et le contrat de référence et le contrat généré divergeaient — parfois sur des détails (une description manquante, un champ renommé), parfois sur des choses plus sérieuses (un type de retour différent, un paramètre optionnel devenu obligatoire). Et personne ne s'en rendait compte immédiatement.

Ce n'est pas théorique. Un breaking change est passé en production fin 2024, touchant les pages de devis du BO et du FOC, parce que personne n'avait fait le diff entre l'ancienne et la nouvelle version du contrat. Notre PM l'a signalé dans #dev-teamleads : *"Je ne peux plus faire les diffs à chaque version"*. Et il avait raison — ce n'est pas viable à la main.

---

## Les tentatives précédentes

Ma première approche : un jar CLI. On compile, on lance, on passe les deux fichiers en arguments, on obtient un rapport. Fonctionnel mais pas pratique du tout — il fallait que chaque développeur installe Java, compile le projet, connaisse les arguments.

Notre QA senior n'allait pas se battre avec un jar à compiler à chaque fois. Et surtout, le vrai use case c'est de comparer rapidement un contrat écrit par le PM avec ce que génère le code — idéalement depuis un navigateur, sans friction.

Il fallait quelque chose d'accessible.

---

## La construction : un jour, Vaadin, et beaucoup de plaisir

Fin janvier 2026, entre deux réunions et le lendemain matin, j'ai construit l'outil. Pas en React. Pas en Vue. En **Vaadin**.

Oui, Vaadin. Le framework Java que j'utilisais en banque. L'ancien truc "application logiciel à l'ancienne". J'avais le choix — React, Vue, Nuxt — et j'ai quand même pris Vaadin. Pourquoi ?

Parce que l'outil est destiné à des développeurs Java. Parce que je voulais un repo simple à déployer sur Google Cloud Run sans pipeline frontend complexe. Et parce que pour un outil interne avec cette ergonomie-là — deux zones de texte, un bouton, un rapport — Vaadin fait exactement le job.

Le code source est sur GitHub : [github.com/chetana/openapi-contract-diff](https://github.com/chetana/openapi-contract-diff)

---

## Ce que fait l'outil

L'interface est volontairement simple :

1. **À gauche** : collez le YAML de votre contrat Design-First (le contrat de référence écrit par le PM)
2. **À droite** : collez soit le JSON/YAML généré par votre code, soit directement l'URL de votre endpoint api-docs (ex: \`https://localhost:8080/v3/api-docs\`)
3. **Comparez** : l'outil isole les breaking changes techniques et les écarts de documentation

Ce que ça apporte concrètement :
- **Les diffs de texte sont visibles** — on voit exactement quelle description a changé ou est manquante
- **Le tracking des descriptions dans les schémas imbriqués** — souvent oubliés, mais essentiels pour nos partenaires intégrateurs
- **L'identification par \`operationId\`** — l'outil n'est pas perturbé par un changement d'URL, il compare les opérations sémantiquement

Ce dernier point est important. Si on renomme une route (\`/v1/orders\` → \`/v2/orders\`), l'outil comprend quand même que c'est la même opération et compare les contrats correctement — à condition que l'\`operationId\` soit stable.

---

## La réception dans l'équipe

L'annonce dans #oms-team a eu un écho immédiat. Un collègue back a voulu tester avec les events dès le lendemain. Notre PM a exprimé son impatience de l'essayer. Notre QA senior a été touchée que j'aie pensé à elle en faisant l'interface web plutôt que le jar CLI *("merci de penser à moi ^^")*.

C'est ça qui était satisfaisant — pas l'outil en lui-même, mais le fait qu'il répondait à un vrai besoin ressenti par plusieurs personnes.

Depuis, l'outil tourne sur Google Cloud Run. L'URL est partagée en interne. L'idée est de le migrer sur GitLab si son usage se confirme sur toute l'entreprise.

---

## Les leçons

### 1. Le problème de dérive silencieuse est structurel dans le design-first

Si vous faites du design-first sans outil de vérification, votre contrat et votre code vont diverger. C'est inévitable. Les développeurs ne vont pas manuellement comparer les YAMLs à chaque PR — c'est trop fastidieux. Il faut automatiser cette vérification, idéalement dans la CI/CD.

L'outil web est une première étape. L'étape suivante, c'est de l'intégrer dans notre pipeline GitLab pour qu'il bloque automatiquement une merge request dont le code ne respecte pas le contrat.

### 2. L'outil simple > la solution parfaite

Vaadin n'est pas le choix le plus sexy. Mais l'outil était prêt en un jour et il fonctionne. Si j'avais attendu de construire une belle interface React avec tests E2E et pipeline CI/CD complet, j'aurais probablement mis deux semaines et l'équipe aurait continué à comparer les YAMLs à la main.

Done is better than perfect — surtout pour un outil interne.

### 3. Le \`operationId\` est sous-estimé

On ne met pas assez de soin dans les \`operationId\` de nos contrats OpenAPI. Mais pour qu'un diff soit pertinent — que ce soit avec cet outil ou avec n'importe quel autre — il faut que les opérations soient identifiables de manière stable. Un \`operationId\` bien nommé est un contrat en soi.

---

## Et maintenant ?

L'outil est là, il tourne, il est utilisé. La prochaine évolution naturelle est l'intégration dans la CI/CD : à chaque PR qui touche un module exposant une API, une vérification automatique contre le contrat de référence.

Ce sera le vrai moment où le design-first devient vérifiable — pas juste une intention, mais une contrainte technique.

---

*Chetana YIN — Février 2026*
*Engineering Manager chez DJUST. Code source : [github.com/chetana/openapi-contract-diff](https://github.com/chetana/openapi-contract-diff)*`

const contentEn = `## The Problem: A Contract That Drifts in Silence

At DJUST, we practice design-first for our APIs. Concretely: our Product Manager writes the OpenAPI contracts (in YAML, in a dedicated Git repo) *before* developers start coding. The idea is noble — the contract is law, the code conforms to it.

The problem? We had no way to verify that the code actually respected the contract.

The developer would implement the feature, auto-generate the OpenAPI via Spring Boot, and the reference contract and generated contract would diverge — sometimes on details (a missing description, a renamed field), sometimes on more serious things (a different return type, an optional parameter becoming mandatory). And no one would notice right away.

This isn't theoretical. A breaking change made it to production in late 2024, affecting BO and FOC quote pages, because nobody had diffed the old and new contract versions. Our PM flagged it in #dev-teamleads: *"I can't manually diff every version anymore."* And he was right — it's not viable by hand.

---

## Previous Attempts

My first approach: a CLI jar. Compile, run, pass two files as arguments, get a report. Functional but completely impractical — every developer would need to install Java, compile the project, know the arguments.

Our senior QA wasn't going to fight with a jar to compile every time. And the real use case is to quickly compare a contract written by the PM with what the code generates — ideally from a browser, without friction.

Something more accessible was needed.

---

## The Build: One Day, Vaadin, and a Lot of Fun

In late January 2026, between two meetings and the next morning, I built the tool. Not in React. Not in Vue. In **Vaadin**.

Yes, Vaadin. The Java framework I used in banking. The old "enterprise application" thing. I had the choice — React, Vue, Nuxt — and I still picked Vaadin. Why?

Because the tool is aimed at Java developers. Because I wanted a simple repo to deploy on Google Cloud Run without a complex frontend pipeline. And because for an internal tool with this ergonomics — two text areas, a button, a report — Vaadin does exactly the job.

The source code is on GitHub: [github.com/chetana/openapi-contract-diff](https://github.com/chetana/openapi-contract-diff)

---

## What the Tool Does

The interface is deliberately simple:

1. **Left side**: paste your Design-First contract YAML (the reference contract written by the PM)
2. **Right side**: paste either the JSON/YAML generated by your code, or directly the URL of your api-docs endpoint (e.g., \`https://localhost:8080/v3/api-docs\`)
3. **Compare**: the tool isolates technical breaking changes and documentation gaps

What it brings concretely:
- **Text diffs are visible** — you see exactly which description changed or is missing
- **Tracking descriptions in nested schemas** — often forgotten, but essential for our partner integrators
- **Identification by \`operationId\`** — the tool isn't confused by a URL change, it compares operations semantically

That last point is important. If you rename a route (\`/v1/orders\` → \`/v2/orders\`), the tool still understands it's the same operation and compares contracts correctly — provided the \`operationId\` is stable.

---

## Team Reception

The announcement in #oms-team got an immediate response. A backend colleague wanted to test it with events the next day. Our PM expressed his eagerness to try it. Our senior QA was touched that I'd thought of her when building the web interface rather than the CLI jar *("thanks for thinking of me ^^")*.

That's what was satisfying — not the tool itself, but the fact that it addressed a real pain felt by multiple people.

Since then, the tool runs on Google Cloud Run. The URL is shared internally. The plan is to migrate it to GitLab if usage confirms it across the company.

---

## Lessons Learned

### 1. Silent Contract Drift Is Structural in Design-First

If you do design-first without a verification tool, your contract and code will diverge. It's inevitable. Developers won't manually compare YAMLs on every PR — it's too tedious. You need to automate this check, ideally in CI/CD.

The web tool is a first step. The next step is integrating it into our GitLab pipeline to automatically block a merge request whose code doesn't respect the contract.

### 2. Simple Tool > Perfect Solution

Vaadin isn't the sexiest choice. But the tool was ready in a day and it works. If I'd waited to build a beautiful React interface with E2E tests and a complete CI/CD pipeline, I'd have probably taken two weeks and the team would have kept comparing YAMLs by hand.

Done is better than perfect — especially for an internal tool.

### 3. \`operationId\` Is Underestimated

We don't put enough care into \`operationId\` in our OpenAPI contracts. But for a diff to be meaningful — whether with this tool or any other — operations need to be stably identifiable. A well-named \`operationId\` is a contract in itself.

---

## What's Next?

The tool is there, it runs, it's used. The natural next evolution is CI/CD integration: on every PR touching a module exposing an API, an automatic check against the reference contract.

That will be the real moment where design-first becomes verifiable — not just an intention, but a technical constraint.

---

*Chetana YIN — February 2026*
*Engineering Manager at DJUST. Source code: [github.com/chetana/openapi-contract-diff](https://github.com/chetana/openapi-contract-diff)*`

const contentKm = `## បញ្ហា៖ កិច្ចសន្យា API ដែលបែកចេញដោយស្ងៀមស្ងាត់

នៅ DJUST យើងប្រើ design-first សម្រាប់ APIs — Product Manager សរសេរ OpenAPI contract (YAML) មុនពេល developers ចាប់ផ្តើម code ។ គំនិតល្អ ប៉ុន្តែបញ្ហាគឺ៖ គ្មានវិធីពិនិត្យមើលថា code ពិតជាគោរព contract ហ្នឹងទេ។

Breaking change មួយបានចូល production ចុងឆ្នាំ ២០២៤ ព្រោះគ្មានការ diff contract ចាស់ VS ថ្មី។

---

## ដំណោះស្រាយ៖ ឧបករណ៍ Web Diff

ខ្ញុំបានបង្កើតឧបករណ៍មួយក្នុងរយៈពេល ១ ថ្ងៃ ជាមួយ Vaadin (Java framework) ។ Interface សាមញ្ញ៖

1. **ខាងឆ្វេង**៖ ចាក់ YAML contract design-first
2. **ខាងស្តាំ**៖ ចាក់ YAML/JSON ដែល code generate ឬ URL api-docs
3. **ប្រៀបធៀប**៖ ឧបករណ៍ស្វែងរក breaking changes និង differences

លក្ខណៈសំខាន់៖
- Diff ច្បាស់លាស់
- Tracking descriptions ក្នុង nested schemas
- ប្រើ \`operationId\` ដូច្នេះមិនចម្លែកចិត្ត ដោយ URL changes

---

## មេរៀន

1. **Design-first ដោយគ្មានការ verify = contract បែក** — ត្រូវ automate
2. **ឧបករណ៍សាមញ្ញ > ដំណោះស្រាយល្អឥតខ្ចោះ** — Done is better than perfect
3. **\`operationId\` មានសារៈសំខាន់** — identifier stable សម្រាប់ diff មានន័យ

---

*Chetana YIN — កុម្ភៈ ២០២៦*
*Engineering Manager នៅ DJUST*`

async function seedBlogOpenApiDiff() {
  console.log('🔧 Seeding blog article: OpenAPI Diff Tool...')

  await db.delete(blogPosts).where(eq(blogPosts.slug, 'openapi-contract-diff-outil'))

  await db.insert(blogPosts).values({
    slug: 'openapi-contract-diff-outil',
    titleFr: "J'ai construit un outil de diff OpenAPI en un jour — et ça a changé notre workflow",
    titleEn: "I Built an OpenAPI Diff Tool in a Day — and It Changed Our Workflow",
    titleKm: "ខ្ញុំបានបង្កើតឧបករណ៍ OpenAPI Diff ក្នុង ១ ថ្ងៃ",
    contentFr,
    contentEn,
    contentKm,
    excerptFr: "On pratique le design-first chez DJUST — le PM écrit le contrat avant le code. Mais sans outil pour vérifier la dérive, les contrats divergent silencieusement. Voici comment j'ai résolu ce problème en une journée avec Vaadin.",
    excerptEn: "We practice design-first at DJUST — the PM writes the contract before the code. But without a tool to check drift, contracts diverge silently. Here's how I solved this in one day with Vaadin.",
    excerptKm: "នៅ DJUST យើងប្រើ design-first API — PM សរសេរ contract មុន code ។ ប៉ុន្តែ contract និង code បែកចេញដោយស្ងៀម។ ខ្ញុំបានដោះស្រាយបញ្ហានេះក្នុង ១ ថ្ងៃ។",
    tags: ['OpenAPI', 'API', 'Design-First', 'Tools', 'Java'],
    published: true
  })

  console.log('✅ OpenAPI Diff article seeded!')
}

seedBlogOpenApiDiff().catch(console.error)
