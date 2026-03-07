import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { blogPosts } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const contentFr = `## Le luxe d'une époque révolue : un seul PSP

Il fut un temps — pas si lointain — où intégrer un PSP (Prestataire de Services de Paiement) dans une plateforme e-commerce était relativement simple. On choisissait un acteur (Stripe, Adyen, ou en France souvent LemonWay ou MangoPay), on implémentait son API, et on était parti.

Chez DJUST, on a vécu cet âge d'or. Puis la réalité du marché B2B nous a rattrapés.

---

## La complexité du paiement B2B

Le B2B, c'est différent du B2C. Nos clients (Franprix, Eiffage, VEJA, Socoda, Manutan) ont des besoins de paiement très spécifiques :

- **Les cartes d'achat** — des cartes corporate de niveau 2 ou 3 (ITS Group) avec des données enrichies (tax, line items détaillés) que les PSPs classiques ne gèrent pas
- **Le paiement classique** — cartes bancaires, virements, SEPA, gérés via Adyen
- **Le paiement marketplace** — quand notre plateforme orchestre des paiements entre un acheteur, un vendeur et DJUST, avec des règles de commission et de payout (Stripe Connect)
- **Le SEPA automatisé** — pour les cas de paiement fractionné ou d'abonnement, via mandat signé une fois

Chaque cas a son PSP, ses webhooks, ses particularités techniques. Et tous doivent coexister sur la même plateforme.

---

## La crise LemonWay / MangoPay

Jusqu'en 2024, nos deux PSPs principaux pour les cas non-marketplace étaient LemonWay et MangoPay. Deux acteurs historiques du marché français, bien intégrés dans notre stack.

Puis la réalité économique a frappé :

**LemonWay** : clair et net dans leur communication — ils ne supportent que les marketplaces. Pour nos use cases hors-marketplace, c'est hors scope.

**MangoPay** : plus diplomatique mais tout aussi ferme. Pour les usages hors-marketplace, ils proposent des tarifs prohibitifs (frais mensuels élevés + commission) et recommandent désormais eux-mêmes Stripe quand leurs clients les interrogent sur des use cases standards.

Le message entre les lignes est limpide : les pure players du paiement B2B non-marketplace vont vers Stripe et Adyen.

Cette réalité a déclenché une question architecturale fondamentale.

---

## Le vrai problème : un contrat API commun pour des PSPs incompatibles

Quand on jongle avec plusieurs PSPs (MangoPay, LemonWay, Adyen, Stripe, ITS), chaque PSP expose des APIs différentes, avec des modèles de données différents, des webhooks différents, des comportements différents.

L'action "autoriser un paiement" ne prend pas les mêmes paramètres chez Adyen que chez Stripe que chez ITS. Le webhook de confirmation d'un paiement n'a pas la même structure. Les codes d'erreur sont différents.

Comment exposer une API de paiement cohérente à nos clients et partenaires intégrateurs quand les PSPs en dessous sont si différents ?

On avait 3 grandes options architecturales.

---

## Option 1 : Un endpoint universel avec polymorphisme

L'idée : un seul endpoint \`/payments\` qui accepte des payloads différents selon le PSP, avec du polymorphisme OpenAPI (\`oneOf\`).

\`\`\`
POST /payments
{
  "type": "adyen_card" | "stripe_marketplace" | "its_purchase_card",
  ...
}
\`\`\`

**Arguments pour** (notre Tech Lead) : moins de routes, lexique cognitif réduit, "le fond est le même — tu paies".

**Arguments contre** (notre PM) : les contrats polymorphes sont difficiles à documenter clairement dans Swagger. Les intégrateurs vont être perdus si \`/payments\` peut avoir 15 comportements différents selon un champ \`type\`.

**Mon argument** : on ne peut pas uniformiser les bodies ni les réponses entre les PSPs. La flexibilité apportée par le polymorphisme va complexifier la tech pour un gain côté API discutable.

---

## Option 2 : Segmentation par endpoint

L'idée : des routes distinctes pour chaque cas de figure :

\`\`\`
POST /payments/author                  # Adyen classique
POST /payments/purchase-cards/author   # ITS cartes d'achat
POST /payments/marketplace/author      # Stripe marketplace
\`\`\`

**Arguments pour** : on voit immédiatement de quoi on parle avec l'endpoint. La flexibilité est maximale pour chaque PSP sans faire des endpoints surchargés.

**Arguments contre** (le Tech Lead) : discoverabilité difficile. Un intégrateur qui découvre l'API ne sait pas quelle route utiliser.

**Réponse** : c'est à nous de documenter quel PSP est utilisé par quel tenant, et d'avoir des réponses d'API qui correspondent.

---

## Option 3 : Le juste milieu (où on a fini)

Après discussion avec notre PM, on a convergé vers une approche intermédiaire :

- Une base commune \`/payments\` pour les opérations génériques
- Des sous-resources pour les cas vraiment différents (\`/payments/purchase-cards\` pour ITS)
- L'utilisation de \`oneOf\` dans OpenAPI pour les cas où les bodies varient mais restent proches
- Une documentation soignée qui explique quel endpoint s'applique à quel PSP / quel tenant

L'enjeu, comme notre PM l'a souligné : certains endpoints n'existent que pour un seul PSP. Si on les cache sous \`/payments\`, les intégrateurs vont croire qu'ils doivent les appeler alors que non. La documentation devient critique.

---

## Le défi des webhooks : à qui appartient ce paiement ?

Une fois l'architecture API résolue, il restait un problème plus insidieux : la gestion des webhooks dans un environnement multi-tenant.

Quand Adyen nous envoie un webhook \`balancePlatform.payout.created\`, il nous notifie qu'un payout a été effectué. Mais lequel ? Pour quel tenant ? Dans une plateforme multi-tenant où des dizaines de marchands ont leur propre compte Adyen rattaché à notre balance platform, comment savoir à qui appartient l'information ?

La solution retenue : **préfixer les références**. Chaque transaction créée dans Adyen intègre dans sa référence un identifiant du tenant. Quand le webhook arrive, on décode la référence pour identifier le propriétaire.

Simple en apparence. En pratique, ça demande une discipline stricte sur le naming des références à la création de chaque transaction — une discipline que toute l'équipe doit respecter.

---

## L'idée SEPA pour le paiement fractionné

Un use case a émergé lors des discussions avec notre équipe Business : le paiement échelonné pour les commandes B2B récurrentes.

L'idée : un client signe un mandat SEPA une fois. Chaque mois, on crée une commande externe (external order) avec le montant calculé, et on déclenche automatiquement le prélèvement via le token SEPA stocké chez Adyen.

Ce n'est pas du BNPL (Buy Now Pay Later) — pas de garantie financière, pas de crédit. C'est une automatisation du prélèvement récurrent B2B, plus simple et plus adaptée que les solutions de paiement fractionné classiques.

L'analyse technique a montré la faisabilité, sous réserve que le workflow OMS soit conçu pour supporter ce type de prélèvement asynchrone. La question des tenants et des mandats multi-clients reste un sujet d'architecture à trancher.

---

## Ce qu'on a appris sur le paiement B2B

### 1. Le PSP n'est pas neutre techniquement

Choisir Adyen plutôt que Stripe n'est pas juste un choix commercial. C'est un choix architectural. Les deux ont des modèles de données différents, des APIs différentes, des contraintes d'intégration différentes. Anticiper ces choix lors de la conception de l'API publique évite des refactos douloureux.

### 2. La spécialisation PSP par use case est inévitable

En B2B multi-PSP, il n'y a pas de saint graal d'une API de paiement universelle. Les cas d'usage sont trop différents. La sagesse, c'est d'accepter cette réalité et de la rendre explicite dans l'API — plutôt que de l'abstraire derrière une façade trompeuse.

### 3. Les webhooks sont votre vrai risque

L'API synchrone est la partie facile. Les webhooks — les notifications asynchrones que les PSPs vous envoient — sont la partie complexe. Identifier le tenant propriétaire d'un webhook, garantir l'idempotence, gérer les retries, logger pour l'auditabilité... c'est là que les bugs arrivent et que les revenus se perdent.

### 4. La documentation est un produit

Dans un contexte multi-PSP, la documentation de votre API de paiement doit explicitement dire : "si vous êtes un tenant avec Adyen, utilisez cet endpoint. Si vous êtes sur Stripe Connect, utilisez celui-là." Ce niveau de clarté demande un effort éditorial réel — mais c'est ce qui différencie une API que les partenaires adorent d'une API qu'ils fuient.

---

*Chetana YIN — Octobre 2025*
*Engineering Manager chez DJUST. OMS, Payments, Cart.*
*PSPs actifs : Adyen (paiements classiques + marketplace), Stripe (marketplace), ITS (cartes d'achat niveau 3).*`

const contentEn = `## The Luxury of a Bygone Era: A Single PSP

There was a time — not so long ago — when integrating a PSP (Payment Service Provider) into an e-commerce platform was relatively straightforward. You chose one player (Stripe, Adyen, or in France often LemonWay or MangoPay), implemented their API, and you were set.

At DJUST, we lived that golden age. Then the B2B market reality caught up with us.

---

## The Complexity of B2B Payment

B2B is different from B2C. Our clients (Franprix, Eiffage, VEJA, Socoda, Manutan) have very specific payment needs:

- **Purchase cards** — level 2 or 3 corporate cards (ITS Group) with enriched data (tax, detailed line items) that standard PSPs don't handle
- **Classic payment** — bank cards, transfers, SEPA, managed via Adyen
- **Marketplace payment** — when our platform orchestrates payments between buyer, seller, and DJUST, with commission and payout rules (Stripe Connect)
- **Automated SEPA** — for fractional payment or subscription cases, via a mandate signed once

Each case has its PSP, its webhooks, its technical particularities. And all must coexist on the same platform.

---

## The LemonWay / MangoPay Crisis

Until 2024, our two main PSPs for non-marketplace cases were LemonWay and MangoPay. Two historical players in the French market, well-integrated in our stack.

Then economic reality hit:

**LemonWay**: clear and direct — they only support marketplaces. For our non-marketplace use cases, it's out of scope.

**MangoPay**: more diplomatic but equally firm. For non-marketplace uses, they propose prohibitive pricing (high monthly fees + commission) and now even recommend Stripe themselves when clients ask about standard use cases.

The message between the lines is clear: pure B2B non-marketplace payment players are moving toward Stripe and Adyen.

This reality triggered a fundamental architectural question.

---

## The Real Problem: A Common API Contract for Incompatible PSPs

When juggling multiple PSPs (MangoPay, LemonWay, Adyen, Stripe, ITS), each PSP exposes different APIs, with different data models, different webhooks, different behaviors.

The "authorize a payment" action doesn't take the same parameters at Adyen as at Stripe as at ITS. The payment confirmation webhook doesn't have the same structure. Error codes are different.

How do you expose a coherent payment API to your clients and partner integrators when the underlying PSPs are so different?

We had 3 main architectural options.

---

## Option 1: A Universal Endpoint with Polymorphism

The idea: a single \`/payments\` endpoint accepting different payloads depending on the PSP, with OpenAPI polymorphism (\`oneOf\`).

\`\`\`
POST /payments
{
  "type": "adyen_card" | "stripe_marketplace" | "its_purchase_card",
  ...
}
\`\`\`

**Arguments for** (our Tech Lead): fewer routes, reduced cognitive lexicon, "the underlying purpose is the same — you're paying."

**Arguments against** (our PM): polymorphic contracts are difficult to document clearly in Swagger. Integrators will be lost if \`/payments\` can have 15 different behaviors depending on a \`type\` field.

**My argument**: we can't uniformize bodies or responses between PSPs. The flexibility from polymorphism will complexify the tech for questionable API-side gain.

---

## Option 2: Endpoint Segmentation

The idea: distinct routes for each use case:

\`\`\`
POST /payments/author                  # Classic Adyen
POST /payments/purchase-cards/author   # ITS purchase cards
POST /payments/marketplace/author      # Stripe marketplace
\`\`\`

**Arguments for**: immediately clear what the endpoint is about. Maximum flexibility for each PSP without overloaded endpoints.

**Arguments against** (the Tech Lead): poor discoverability. An integrator discovering the API won't know which route to use.

**Response**: it's up to us to document which PSP is used by which tenant, and to have API responses that correspond.

---

## Option 3: The Middle Ground (Where We Ended Up)

After discussion with our PM, we converged on an intermediate approach:

- A common base \`/payments\` for generic operations
- Sub-resources for truly different cases (\`/payments/purchase-cards\` for ITS)
- Use of \`oneOf\` in OpenAPI for cases where bodies vary but remain close
- Careful documentation explaining which endpoint applies to which PSP / which tenant

The key issue, as our PM pointed out: some endpoints only exist for a single PSP. If we hide them under \`/payments\`, integrators will think they need to call them when they don't. Documentation becomes critical.

---

## The Webhook Challenge: Who Owns This Payment?

Once the API architecture was resolved, a more insidious problem remained: webhook management in a multi-tenant environment.

When Adyen sends us a \`balancePlatform.payout.created\` webhook, it notifies us that a payout was made. But which one? For which tenant? In a multi-tenant platform where dozens of merchants have their own Adyen account attached to our balance platform, how do you know who the information belongs to?

The solution: **reference prefixing**. Every transaction created in Adyen embeds a tenant identifier in its reference. When the webhook arrives, we decode the reference to identify the owner.

Simple in theory. In practice, it requires strict discipline around reference naming when creating each transaction — discipline the entire team must maintain.

---

## The SEPA Idea for Fractional Payment

A use case emerged from discussions with our Business team: installment payment for recurring B2B orders.

The idea: a client signs a SEPA mandate once. Each month, we create an external order with the calculated amount, and automatically trigger the debit via the SEPA token stored at Adyen.

This isn't BNPL (Buy Now Pay Later) — no financial guarantee, no credit. It's B2B recurring debit automation, simpler and more adapted than classic fractional payment solutions.

The technical analysis showed feasibility, provided the OMS workflow is designed to support this type of asynchronous debit. The question of tenants and multi-client mandates remains an architecture decision to make.

---

## What We Learned About B2B Payment

### 1. The PSP Isn't Technically Neutral

Choosing Adyen over Stripe isn't just a commercial decision. It's an architectural decision. Both have different data models, different APIs, different integration constraints. Anticipating these choices during public API design avoids painful refactors.

### 2. PSP Specialization by Use Case Is Inevitable

In multi-PSP B2B, there's no holy grail of a universal payment API. Use cases are too different. The wisdom is accepting this reality and making it explicit in the API — rather than hiding it behind a misleading facade.

### 3. Webhooks Are Your Real Risk

The synchronous API is the easy part. Webhooks — asynchronous notifications PSPs send you — are the complex part. Identifying the webhook-owning tenant, guaranteeing idempotency, handling retries, logging for auditability... that's where bugs happen and revenue gets lost.

### 4. Documentation Is a Product

In a multi-PSP context, your payment API documentation must explicitly say: "if you're an Adyen tenant, use this endpoint. If you're on Stripe Connect, use that one." This level of clarity requires real editorial effort — but it's what differentiates an API partners love from one they avoid.

---

*Chetana YIN — October 2025*
*Engineering Manager at DJUST. OMS, Payments, Cart.*
*Active PSPs: Adyen (classic payments + marketplace), Stripe (marketplace), ITS (level 3 purchase cards).*`

const contentKm = `## ជម្លោះ PSP ក្នុង OMS B2B

នៅ DJUST យើងជួប PSPs (Payment Service Providers) ជាច្រើន ៖ LemonWay, MangoPay, Adyen, Stripe, ITS ។ ករណី use cases ៣ ធំ ៖

1. **Cartes d'achat** (ITS) — level 3 corporate cards
2. **Paiements classiques** (Adyen) — CB, virement, SEPA
3. **Marketplace** (Stripe Connect) — commissions + payouts

LemonWay/MangoPay បានច្រានចេញ non-marketplace use cases → Adyen/Stripe ជាចំណាប់ ។

---

## បញ្ហា API ៖ Contract ដូចគ្នា PSPs ផ្សេង ?

Action "autoriser paiement" ≠ parameters ដូចគ្នា Adyen vs Stripe vs ITS ។

**ជម្លោះ Architecture** ៖
- Polymorphisme \`/payments\` ⟶ \`oneOf\` → ស្មុគ្រស្មាញ doc
- Segmentation \`/payments/purchase-cards\` \`/payments/marketplace\` → ច្បាស់ប៉ុន្តែ discoverability ទាប
- Middle ground ៖ base \`/payments\` + sub-resources + oneOf + documentation ច្បាស់

---

## Webhooks Challenge

Multi-tenant + Adyen webhook → 누OwnerTenant ? Solution ៖ prefix reference ជាមួយ tenant ID ។

---

## SEPA Fractionné

Client sign SEPA mandate once → monthly external order → auto-debit → B2B installment payment ។ ងាយ ប្រើ ជាង BNPL ។

---

*Chetana YIN — តុលា ២០២៥*
*Engineering Manager នៅ DJUST*`

async function seedBlogPspIntegration() {
  console.log('💳 Seeding blog article: Stripe/Adyen PSP Integration...')

  await db.delete(blogPosts).where(eq(blogPosts.slug, 'stripe-adyen-oms-integration'))

  await db.insert(blogPosts).values({
    slug: 'stripe-adyen-oms-integration',
    titleFr: "Intégrer Stripe et Adyen dans un OMS B2B : le casse-tête des API de paiement",
    titleEn: "Integrating Stripe and Adyen into a B2B OMS: The Payment API Puzzle",
    titleKm: "ការ Integrate Stripe និង Adyen ក្នុង OMS B2B",
    contentFr,
    contentEn,
    contentKm,
    excerptFr: "LemonWay et MangoPay ne conviennent plus pour le non-marketplace. On se retrouve avec Adyen, Stripe et ITS en parallèle — et la question architecturale qui tue : comment exposer une API de paiement cohérente quand les PSPs sont si différents ?",
    excerptEn: "LemonWay and MangoPay no longer fit non-marketplace needs. We ended up with Adyen, Stripe, and ITS in parallel — and the killer architectural question: how do you expose a coherent payment API when PSPs are so different?",
    excerptKm: "LemonWay/MangoPay non-marketplace → Adyen/Stripe ។ Question archi ៖ API payment cohérente pour PSPs ខុសគ្នា ?",
    tags: ['Payment', 'Stripe', 'Adyen', 'API', 'OMS', 'Architecture'],
    published: true
  })

  console.log('✅ PSP Integration article seeded!')
}

seedBlogPspIntegration().catch(console.error)
