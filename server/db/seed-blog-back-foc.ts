import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { blogPosts } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const contentFr = `## Deux équipes, une incompréhension structurelle

Chez DJUST, les APIs ne sont pas consommées uniquement par des clients externes. L'équipe FOC — Front of Customers, les développeurs qui construisent et maintiennent notre SDK Front — est le premier consommateur interne de nos APIs Backend.

Pendant longtemps, cette relation fonctionnait "à peu près". Le Back développait des endpoints, le FOC les intégrait dans le SDK, les clients finaux utilisaient le SDK. En théorie, une chaîne simple. En pratique, une source de friction permanente.

Les symptômes sont apparus progressivement dans les rétros :

> *"Monter un point pour les problèmes d'évolutions qui impactent le FOC sans prévenir"*

> *"Trouver un point d'entrée front pour communiquer avec les intégrateurs front"*

Ces actions revenaient d'une rétro à l'autre, trimestre après trimestre, sans vraiment être résolues. C'est le signe classique d'un problème structurel qu'on panse sans jamais traiter la cause.

---

## Les frustrations des deux côtés

La réunion de clarification a eu lieu en octobre 2025. Ce qu'on a mis à plat :

**Du côté Back :**
- Le FOC implémente parfois des choses "à leur manière" sans consulter le Back au préalable
- Des décisions d'architecture Front impactent le comportement attendu des APIs Backend sans qu'on soit au courant
- On découvre après coup que le SDK fait des appels qu'on n'avait pas anticipés

**Du côté FOC :**
- Le Back change des contrats API sans prévenir — et le SDK se retrouve cassé du jour au lendemain
- On n'est pas consulté lors de la conception des nouvelles features qui vont toucher le SDK
- On est le premier à découvrir les bugs et incohérences des APIs, mais on n'a pas de canal clair pour les remonter

Le constat rédigé à chaud après la réunion :

> *"Frustrations des 2 côtés. Les deux équipes se reprochent de 'faire des choses sans en parler aux autres' et de ne pas s'écouter."*

Ce n'est pas une question de mauvaise volonté. C'est une question de structure : sans framework clair, chaque équipe optimize localement au détriment du global.

---

## La vision qu'on a construite ensemble

Le vrai travail de la réunion n'était pas de lister les frustrations — c'était de formuler une vision partagée. Ce qu'on a posé :

**Le FOC est un partenaire privilégié du Back, qui a la charge de développer un SDK utilisé par l'ensemble des partenaires. Le SDK est une extension du produit DJUST, générique, qui doit évoluer au même rythme que son produit.**

Cette phrase semble simple, mais elle change beaucoup de choses. Elle dit que :
1. Le SDK n'est pas un projet parallèle — c'est une extension du produit. Sa qualité est la qualité du produit.
2. Le FOC n'est pas un client lambda — c'est un partenaire privilégié avec des droits ET des responsabilités spécifiques.
3. "Évoluer au même rythme" — le SDK ne peut pas être en retard d'une release sur le Back. Ce n'est pas acceptable.

---

## Les trois casquettes du FOC

On a ensuite décliné cette vision en trois rôles distincts, qui coexistent :

### En tant que partenaire standard

Le FOC utilise nos APIs comme n'importe quel intégrateur externe. Il doit :
- Utiliser la documentation (README, Swagger) comme référence
- Être autonome sur les APIs publiques disponibles
- Ne pas avoir accès à des "raccourcis" non documentés

C'est important. Si le FOC a besoin de raccourcis pour implémenter le SDK, c'est que notre documentation est insuffisante pour les partenaires externes. Le FOC est notre premier signal qualité.

### En tant que partenaire privilégié

Parce qu'il est le premier consommateur de nos nouvelles APIs, le FOC a des responsabilités supplémentaires :
- **Remonter immédiatement** tout problème rencontré en phase de lancement (manque de doc, bugs, comportements inattendus)
- **Être consulté** sur la définition des standards API — il a une expérience unique d'avoir implémenté des dizaines de FOC clients
- **Participer à la conception** des futures fonctionnalités qui toucheront les contrats API

### En tant que responsable du SDK

C'est le rôle le plus contraignant : le FOC doit être au courant *en amont* des évolutions roadmap pour pouvoir planifier l'implémentation SDK en parallèle du développement Back. Pas après. Pas le jour de la release. En amont.

---

## Les actions concrètes

La vision, c'est bien. Les actions, c'est mieux. Ce qu'on a décidé :

**1. Finaliser les standards API avec le FOC**
Des APIs simples, cohérentes et bien documentées réduisent naturellement les frictions. On ne peut pas demander au FOC d'être autonome si nos APIs sont ésotériques. Responsable : le Tech Lead.

**2. Un référent FOC dédié par feature**
Pour chaque feature qui touche les APIs, un référent FOC est désigné par le Head of FOC. Ce référent :
- Est consulté sur les choix API dès la conception
- Participe au Kick-Off Feature
- Communique au Back comment il va implémenter la partie SDK
- Met à jour le SDK en parallèle du développement Back

**3. Anticipation des évolutions tech**
On a listé des cas concrets d'évolutions tech qui avaient impacté le FOC sans prévenance :
- Le passage au nouveau DAM — le FOC a découvert les changements lors de la mise en production
- Le monitoring SSR — une décision d'architecture qui avait des implications FOC que personne n'avait anticipées

Le principe : toute évolution technique qui touche le comportement de nos APIs doit être présentée au FOC *avant* d'être développée.

---

## Ce que ça change concrètement

Six mois après cette réunion, voici ce qu'on observe :

**Ce qui marche mieux :**
- Le projet Carte Achat de Niveau 3 (ITS / Socoda) a été le premier test du nouveau process. Un message formel a été envoyé à l'équipe FOC en amont pour les informer de l'impact API et leur demander des retours préliminaires. Le Head of FOC a confirmé l'importance de la démarche immédiatement.
- Les breaking changes sont maintenant communiqués en amont via nos release notes. Le FOC sait quoi préparer avant la release du jeudi.

**Ce qui reste difficile :**
- La discipline sur les kick-offs feature. Quand on est dans le rush d'un sprint, la tentation de "finir d'abord, aligner ensuite" est forte.
- Le SDK a tendance à prendre du retard sur le Back malgré les bonnes intentions. La roadmap commune reste un chantier.

**Ce qu'on a appris :**
Une réunion ne résout pas un problème structurel. Elle pose les bases. Le vrai travail, c'est de tenir les engagements dans la durée — et d'ajuster quand ça glisse.

---

## Pour les Engineering Managers

Si vous gérez une équipe Backend dont les APIs sont consommées par un partenaire interne (SDK, intégrateur, équipe Front), voici ce que j'ai appris :

**Ne présumez pas que "ils savent ce qu'on fait".** La transparence par défaut n'existe pas entre équipes. Il faut des rituels explicites.

**Distinguez les rôles.** Un partenaire interne n'est pas un client externe et n'est pas non plus un membre de votre équipe. C'est une catégorie à part, avec ses droits et ses responsabilités propres.

**Le SDK est votre premier signal qualité.** Si votre partenaire interne a besoin de workarounds pour implémenter son SDK, c'est que vos APIs ont un problème. Écoutez-le.

**La vision commune précède les process.** On a essayé de résoudre les frustrations avec des actions concrètes pendant des mois, sans succès. Quand on a posé la vision en premier (le FOC est un partenaire privilégié, le SDK est une extension du produit), les actions ont suivi naturellement.

---

*Chetana YIN — Novembre 2025*
*Engineering Manager chez DJUST. OMS, Payments, Cart.*`

const contentEn = `## Two Teams, One Structural Misunderstanding

At DJUST, APIs aren't just consumed by external clients. The FOC team — Front of Customers, the developers who build and maintain our Front SDK — is the primary internal consumer of our Backend APIs.

For a long time, this relationship worked "well enough." The Backend developed endpoints, the FOC integrated them into the SDK, end clients used the SDK. In theory, a simple chain. In practice, a constant source of friction.

The symptoms appeared gradually in retrospectives:

> *"Set up a meeting about evolutions that impact the FOC without warning"*

> *"Find an entry point to communicate with front integrators"*

These actions kept coming up retro after retro, quarter after quarter, without ever being truly resolved. That's the classic sign of a structural problem being patched without ever treating the root cause.

---

## The Frustrations on Both Sides

The clarification meeting took place in October 2025. What we laid out:

**From the Back side:**
- The FOC sometimes implements things "their way" without consulting Backend beforehand
- Front architecture decisions impact expected API behavior without us knowing
- We discover after the fact that the SDK makes calls we hadn't anticipated

**From the FOC side:**
- Backend changes API contracts without warning — and the SDK breaks overnight
- We're not consulted during the design of new features that will affect the SDK
- We're the first to discover API bugs and inconsistencies, but there's no clear channel to report them

The assessment written immediately after the meeting:

> *"Frustrations on both sides. Both teams accuse each other of 'doing things without telling others' and not listening."*

This isn't a question of bad will. It's a structural problem: without a clear framework, each team optimizes locally at the expense of the whole.

---

## The Shared Vision We Built

The real work of the meeting wasn't listing frustrations — it was formulating a shared vision. What we established:

**The FOC is a privileged partner of the Backend, responsible for developing an SDK used by all partners. The SDK is a generic extension of the DJUST product that must evolve at the same pace as the product.**

This sentence seems simple, but it changes a lot. It says:
1. The SDK isn't a parallel project — it's a product extension. Its quality is the product's quality.
2. The FOC isn't just another client — it's a privileged partner with specific rights AND responsibilities.
3. "Evolve at the same pace" — the SDK cannot lag one release behind the Backend. That's not acceptable.

---

## The Three Hats of the FOC

We then broke down this vision into three distinct roles that coexist:

### As a Standard Partner

The FOC uses our APIs like any external integrator. It must:
- Use documentation (README, Swagger) as reference
- Be autonomous on available public APIs
- Not have access to undocumented "shortcuts"

This is important. If the FOC needs shortcuts to implement the SDK, it means our documentation is insufficient for external partners. The FOC is our first quality signal.

### As a Privileged Partner

Because it's the first consumer of our new APIs, the FOC has additional responsibilities:
- **Immediately report** any problem encountered during launch phase (missing docs, bugs, unexpected behaviors)
- **Be consulted** on API standards definition — it has unique experience from implementing dozens of client FOCs
- **Participate in the design** of future features that will affect API contracts

### As SDK Owner

This is the most demanding role: the FOC must know *in advance* about roadmap evolutions to plan SDK implementation in parallel with Backend development. Not after. Not on release day. In advance.

---

## Concrete Actions

Vision is good. Actions are better. What we decided:

**1. Finalize API Standards with the FOC**
Simple, consistent, well-documented APIs naturally reduce friction. We can't ask the FOC to be autonomous if our APIs are esoteric. Owner: the Tech Lead.

**2. A Dedicated FOC Reference Per Feature**
For every feature touching APIs, a FOC reference is designated by the Head of FOC. This person:
- Is consulted on API choices from the design phase
- Participates in the Feature Kick-Off
- Communicates to Backend how they'll implement the SDK part
- Updates the SDK in parallel with Backend development

**3. Anticipating Tech Evolutions**
We listed concrete cases where tech evolutions impacted the FOC without warning:
- The new DAM migration — the FOC discovered changes at deployment
- SSR monitoring — an architecture decision with FOC implications nobody had anticipated

The principle: any technical evolution affecting API behavior must be presented to the FOC *before* development starts.

---

## What Changed Concretely

Six months after this meeting, here's what we observe:

**What's working better:**
- The Level 3 Purchase Card project (ITS / Socoda) was the first test of the new process. A formal message was sent to the FOC team in advance to inform them of API impact and request preliminary feedback. The Head of FOC confirmed the importance of the approach immediately.
- Breaking changes are now communicated in advance via release notes. The FOC knows what to prepare before Thursday's release.

**What remains difficult:**
- Discipline on feature kick-offs. When you're in sprint rush, the temptation to "finish first, align later" is strong.
- The SDK tends to fall behind Backend despite good intentions. The shared roadmap remains a work in progress.

**What we learned:**
One meeting doesn't fix a structural problem. It sets the foundations. The real work is holding commitments over time — and adjusting when things slip.

---

## For Engineering Managers

If you manage a Backend team whose APIs are consumed by an internal partner (SDK, integrator, Front team), here's what I learned:

**Don't assume "they know what we're doing."** Default transparency doesn't exist between teams. You need explicit rituals.

**Distinguish roles.** An internal partner isn't an external client and isn't a team member either. It's a separate category with its own rights and responsibilities.

**The SDK is your first quality signal.** If your internal partner needs workarounds to implement their SDK, your APIs have a problem. Listen to them.

**Shared vision precedes process.** We tried to resolve frustrations with concrete actions for months, unsuccessfully. When we established the vision first (FOC is a privileged partner, SDK is a product extension), actions followed naturally.

---

*Chetana YIN — November 2025*
*Engineering Manager at DJUST. OMS, Payments, Cart.*`

const contentKm = `## ក្រុម ២ ដែលមានភាពខ្វះខាតដោយសារ Structure

នៅ DJUST ក្រុម FOC (Front of Customers) — developers ដែលបង្កើត SDK Front — គឺជា consumer ខាងក្នុងដំបូងគេនៃ APIs Back។

រយៈពេលយូរ ទំនាក់ទំនងនេះដំណើរការ "ល្អបន្តិចបន្ហោច" ។ ប៉ុន្តែការបារម្ភបន្តិចម្តងៗ ក្នុងការ retrospectives :

- FOC ដឹងអំពី breaking changes តែនៅ deploy ហើយ
- Back ដឹងថា SDK ប្រើ endpoints ដែលមិនបានរំពឹង
- មិនមានចាំណែងច្បាស់លាស់

---

## Vision ដែលបានបង្កើតជាមួយគ្នា

**FOC = partenaire privilégié du Back ដែលទទួលខុសត្រូវក្នុងការអភិវឌ្ឍ SDK ។ SDK = extension ផលិតផល DJUST ។**

ការចែករំលែក Vision នេះបានផ្លាស់ប្តូរអ្វីៗ — SDK មិនមែន projet ផ្សេងទៀតទេ ជា extension ផលិតផល។

**FOC ម្នាក់ ③ HistoryCap**
1. ជា partenaire standard ដូច integrator ខាងក្រៅ
2. ជា partenaire privilégié — report bugs API ទាំងដំបូង consult API standards
3. ជា SDK owner — ត្រូវដឹងជាមុននូវ roadmap evolutions

---

## Action Concrètes

- Finalize API standards ជាមួយ FOC
- Référent FOC dedicated ក្នុង feature នីមួយៗ — participates in kick-off
- Communication proactive : breaking changes ត្រូវប្រាប់ FOC មុន release

---

## ការរៀន

Vision ចែករំលែក > process — ត្រូវវាងមុន ។ SDK ជា quality signal ដំបូង — ប្រសិន FOC ត្រូវ workarounds APIs ខ្លួនទ្រង់ problem ។

---

*Chetana YIN — វិច្ឆិកា ២០២៥*
*Engineering Manager នៅ DJUST*`

async function seedBlogBackFoc() {
  console.log('🤝 Seeding blog article: Back/FOC Collaboration...')

  await db.delete(blogPosts).where(eq(blogPosts.slug, 'back-foc-collaboration-sdk'))

  await db.insert(blogPosts).values({
    slug: 'back-foc-collaboration-sdk',
    titleFr: "Back et FOC : comment on a mis fin à deux ans de frustrations en une réunion",
    titleEn: "Back and FOC: How We Ended Two Years of Frustration in One Meeting",
    titleKm: "Back និង FOC ៖ របៀបដែលយើងបញ្ចប់ភាពខ្វះខាតក្នុងការ Meeting មួយ",
    contentFr,
    contentEn,
    contentKm,
    excerptFr: "Le FOC et le Back se reprochaient mutuellement de ne pas s'écouter. Après des mois de rétros sans résolution, une réunion a tout changé — en posant d'abord une vision claire du rôle du SDK et du partenariat Back/FOC.",
    excerptEn: "FOC and Backend were accusing each other of not listening. After months of unresolved retros, one meeting changed everything — by first establishing a clear vision of the SDK's role and the Back/FOC partnership.",
    excerptKm: "FOC និង Back បានស្តីបន្ទោសគ្នា ។ ក្រោយ retrospectives ច្រើនខែដោយគ្មានការដោះស្រាយ Meeting មួយបានផ្លាស់ប្តូរអ្វីៗ ។",
    tags: ['Management', 'API', 'SDK', 'Collaboration', 'Architecture'],
    published: true
  })

  console.log('✅ Back/FOC article seeded!')
}

seedBlogBackFoc().catch(console.error)
