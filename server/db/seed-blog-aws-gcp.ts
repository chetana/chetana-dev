import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { blogPosts } from './schema'
import { eq } from 'drizzle-orm'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const contentFr = `## Introduction

En 2024, Google Cloud nous a invités, mon équipe et moi chez DJUST, à une série d'événements exclusifs. Le pitch était clair : **"Vous êtes sur AWS depuis 4 ans. Venez chez nous, on vous accompagne dans la migration, et on vous offre des crédits cloud conséquents."**

Google ne faisait pas ça par charité. DJUST est une plateforme e-commerce B2B SaaS qui gère des commandes pour des clients dans la grande distribution, la construction et la mode. C'est exactement le type de workload que GCP veut attirer : du Java/Spring Boot, du Kubernetes, du PostgreSQL, de l'Elasticsearch — tout ce que Google Cloud sait faire.

Moi, j'étais totalement pour. Je voyais dans cette migration une opportunité unique : non seulement économiser sur les coûts cloud, mais surtout **moderniser notre codebase** en travaillant main dans la main avec des ingénieurs Google et un cabinet cloud partenaire. C'était l'occasion rêvée de rembourser de la dette technique tout en étant accompagné par des experts.

Mais la direction de DJUST a dit non. Et avec le recul, je comprends pourquoi — même si une part de moi regrette encore l'opportunité manquée.

Voici l'histoire complète, les analyses techniques, et les leçons que j'en tire.

## Chapitre 1 : Le contexte — DJUST sur AWS

### Comment on a atterri sur AWS

DJUST a été créé en 2021. Comme 90% des startups tech, le choix initial du cloud s'est fait de manière pragmatique :

- **Les crédits AWS Activate** : Amazon offre jusqu'à 100 000$ de crédits aux startups via son programme Activate. Pour une boîte qui démarre, c'est un argument massif
- **La familiarité** : les premiers développeurs (dont moi, en tant que Lead Software Engineer) connaissaient AWS. EC2, RDS, S3, SQS — c'est la lingua franca du cloud
- **L'écosystème** : plus de documentation, plus de tutorials, plus de réponses StackOverflow pour AWS que pour n'importe quel autre cloud

Le choix n'a pas fait l'objet d'un benchmark détaillé. C'était : "On connaît AWS, on a des crédits, on y va." Et c'est **normal** pour une startup en phase de construction. L'enjeu à ce stade, c'est de livrer le produit, pas d'optimiser l'infra.

### Notre stack AWS en 2024

Après 3 ans de développement, voici à quoi ressemblait notre infrastructure :

- **EKS** (Elastic Kubernetes Service) : notre cluster Kubernetes managé, hébergeant ~15 microservices Spring Boot
- **RDS PostgreSQL** : notre base de données principale (multi-AZ pour la haute disponibilité)
- **ElastiCache Redis** : cache et sessions
- **Amazon Elasticsearch Service** : moteur de recherche produit
- **SQS** : messaging entre microservices (commandes, paiements, notifications)
- **S3** : stockage d'assets (images produits, documents)
- **ECR** : registry Docker pour nos images
- **CloudFront** : CDN pour le frontend
- **Route 53** : DNS
- **IAM** : gestion des accès
- **CloudWatch** : monitoring et logs

Le tout géré par **2 DevOps**. Deux personnes. Pour une plateforme qui sert des clients enterprise avec des SLA exigeants.

### Les douleurs

Après 3 ans sur AWS, on avait accumulé des frustrations :

**1. Les coûts qui explosent**

Les crédits Activate s'étaient épuisés. Et la facture AWS avait une tendance claire : **elle montait chaque mois**. EKS seul coûte ~$75/mois juste pour le control plane, avant même d'ajouter des nodes. RDS multi-AZ, c'est cher. ElastiCache, c'est cher. Et surtout : AWS est **notoirement opaque** sur ses tarifs. Comprendre sa facture AWS est un métier à part entière.

**2. La complexité opérationnelle**

Avec 2 DevOps pour gérer tout ça, on était en permanence en mode pompier. Un upgrade EKS ? Ça prend une semaine de préparation. Un incident RDS ? Tout le monde est en alerte. La charge opérationnelle était disproportionnée par rapport à la taille de l'équipe.

**3. La dette technique liée à AWS**

On avait fait des choix rapides au début (normal pour une startup) qui devenaient des boulets :
- Des instances EC2 surdimensionnées "par sécurité"
- Des services non optimisés (Reserved Instances non utilisées, GP2 au lieu de GP3)
- Un monitoring CloudWatch partiel et coûteux
- Pas de FinOps structuré

## Chapitre 2 : L'offre de Google

### Les événements Google Cloud

Google Cloud a une stratégie agressive pour attirer les clients AWS. Ils identifient des entreprises en croissance qui utilisent AWS et leur proposent un accompagnement personnalisé.

Pour DJUST, ça s'est concrétisé par :

- **Invitations à des événements Google Cloud** : workshops techniques, présentations de cas clients, networking avec des décideurs tech. J'y ai assisté avec d'autres membres de l'équipe
- **Engagement technique** : des ingénieurs Google Cloud prêts à travailler avec nous sur un plan de migration détaillé
- **Partenariat avec un cabinet cloud partenaire** : spécialisé dans les migrations cloud, qui aurait assuré l'accompagnement opérationnel de la migration
- **Crédits GCP** : des crédits cloud conséquents pour couvrir la période de migration et au-delà (souvent 100K-300K$ sur 1-2 ans pour ce type de deal)

### Ce que GCP mettait sur la table

Concrètement, voici ce que la migration aurait impliqué et les avantages associés :

**GKE (Google Kubernetes Engine) vs EKS**

C'est LE point fort de Google. GKE est unanimement reconnu comme le **meilleur Kubernetes managé du marché** :
- **Autopilot** : GKE gère les nodes automatiquement, pas besoin de dimensionner. Avec EKS, nos DevOps passaient du temps à gérer les node groups
- **Cluster autoscaler natif** : plus réactif et mieux intégré que celui d'EKS
- **Coût du control plane** : GKE Autopilot = $0 pour le control plane (facturé à l'usage des pods). EKS = $73/mois fixe
- **Mises à jour** : GKE se met à jour quasi-automatiquement. EKS nécessite des mises à jour manuelles planifiées (et stressantes)
- **Multi-cluster** : Anthos pour la gestion multi-cluster, bien au-delà de ce qu'EKS propose

Pour notre équipe de 2 DevOps, GKE Autopilot aurait été un **game changer**. Moins d'ops, plus de temps pour améliorer l'infra.

**Cloud SQL vs RDS PostgreSQL**

Relativement similaires en features, mais :
- Cloud SQL a un meilleur support natif des connexions poolées (via PgBouncer intégré ou AlloyDB pour PostgreSQL)
- **AlloyDB** : le PostgreSQL compatible de Google, qui promet des performances 4x supérieures à RDS PostgreSQL pour les workloads transactionnels. Pour notre OMS, ça aurait été intéressant
- Les prix sont comparables, avec un léger avantage GCP sur les instances committées

**BigQuery vs... rien chez nous**

On n'avait pas de data warehouse. BigQuery aurait ouvert la porte à de l'analytics avancé sur nos données de commandes, paiements, comportements clients. C'est le **meilleur produit de Google Cloud**, et il n'a pas d'équivalent direct chez AWS (Redshift existe, mais c'est moins intégré et plus cher).

**Pub/Sub vs SQS**

Google Pub/Sub est plus flexible que SQS :
- Support natif du pattern pub/sub (un message, plusieurs consommateurs) vs SQS qui est uniquement point-à-point
- Ordering guarantees plus souples
- Dead letter queues intégrées
- Pricing plus simple

**Cloud Monitoring vs CloudWatch**

CloudWatch est cher et limité. Google Cloud Monitoring + Cloud Logging sont inclus et plus généreux dans le free tier.

### L'opportunité cachée : moderniser la codebase

C'est ce point qui m'excitait le plus. Une migration cloud, c'est l'occasion de **tout revoir** :

- **Revoir l'architecture des microservices** : est-ce qu'on a vraiment besoin de 15 services ? Peut-on en consolider certains ?
- **Adopter GKE Autopilot** : simplifier radicalement l'ops
- **Implémenter du FinOps dès le départ** : labels, budgets, alertes, rightsizing
- **Moderniser le CI/CD** : passer de notre pipeline GitLab custom à quelque chose de plus streamlined
- **Rembourser de la dette technique** : profiter du "mouvement" pour nettoyer ce qui traîne depuis 3 ans

Et on n'aurait pas été seuls. Les ingénieurs Google + le cabinet partenaire auraient apporté leur expertise. C'est rare d'avoir accès à ce niveau d'accompagnement technique.

## Chapitre 3 : Pourquoi la direction a dit non

### L'argument du risque client

DJUST sert des clients enterprise dans la distribution, la construction et la mode. Ces clients ont des **SLA contractuels**. Un downtime de 2 heures, c'est pas juste un incident technique — c'est une pénalité financière et une perte de confiance.

La direction a posé la question fondamentale : **"Quel est le risque d'une migration cloud pour nos clients ?"**

Et la réponse honnête est : **le risque est réel et significatif**.

Une migration AWS → GCP pour une plateforme de notre taille, c'est :

- **3 à 6 mois** de travail minimum (estimation optimiste)
- Un risque de **downtime** pendant la bascule (même avec une migration progressive)
- Une période de **double run** (les deux clouds en parallèle) coûteuse
- Des **bugs inattendus** liés aux différences subtiles entre services (SQS vs Pub/Sub, RDS vs Cloud SQL)
- Une **courbe d'apprentissage** pour les 2 DevOps qui connaissent AWS par cœur mais pas GCP

Pour une startup B2B qui cherche à gagner la confiance de clients enterprise, prendre ce risque est **difficile à justifier** auprès du board.

### L'argument de l'équipe

Avec **2 DevOps**, on n'avait pas le bandwidth pour :
1. Maintenir la plateforme AWS en production (le quotidien)
2. ET piloter une migration vers GCP (le projet)

Il aurait fallu soit embaucher des DevOps supplémentaires (coût), soit dégrader temporairement le support de la production (risque). Le cabinet partenaire aurait aidé, mais la connaissance de notre stack spécifique restait chez nos 2 DevOps.

### L'argument du coût à court terme

Paradoxalement, migrer pour économiser coûte cher à court terme :
- **Double run** pendant la migration : on paie AWS ET GCP pendant 3-6 mois
- **Temps humain** : les DevOps travaillent sur la migration au lieu d'améliorer la prod
- **Le cabinet cloud partenaire** : même avec des crédits Google, le consulting a un coût
- **Formation** : toute l'équipe (pas juste les DevOps) doit apprendre les services GCP

L'estimation : **6-12 mois avant de voir un ROI positif** sur la migration. Pour une startup qui brûle du cash, c'est long.

### La décision : optimiser AWS

La direction a tranché : **on reste sur AWS, mais on optimise**.

Le plan :
- **FinOps** : audit complet de la facture AWS, identification des quick wins
- **Reserved Instances / Savings Plans** : engagement 1 an pour réduire les coûts compute de 30-40%
- **Rightsizing** : réduire les instances surdimensionnées
- **Storage optimization** : GP2 → GP3, lifecycle policies S3
- **Monitoring** : alertes budget, dashboards coût par service

## Chapitre 4 : AWS vs GCP — l'analyse technique approfondie

Avec du recul, voici mon analyse honnête des deux clouds pour un workload comme celui de DJUST.

### Kubernetes : avantage net GCP

| Critère | EKS (AWS) | GKE (GCP) |
|---------|-----------|-----------|
| Control plane | $73/mois fixe | $0 (Autopilot) |
| Node management | Manuel (node groups, AMI) | Automatique (Autopilot) |
| Upgrades | Manuels, risqués, planifiés | Quasi-automatiques |
| Autoscaling | Cluster Autoscaler (addon) | Natif, plus réactif |
| Multi-cluster | Basique | Anthos (puissant) |
| Charge ops | Élevée | Faible |
| Maturité K8s | Bonne | Excellente (K8s est né chez Google) |

**Verdict** : GKE est objectivement meilleur. Kubernetes a été inventé par Google, et ça se sent. Pour 2 DevOps, GKE Autopilot aurait réduit significativement la charge opérationnelle.

### Base de données : quasi-égalité

| Critère | RDS PostgreSQL | Cloud SQL / AlloyDB |
|---------|---------------|-------------------|
| PostgreSQL managed | Excellent | Excellent |
| Haute dispo | Multi-AZ | Régional (similaire) |
| Performance | Très bon | AlloyDB potentiellement 4x |
| Backup/restore | Automatique | Automatique |
| Prix | Comparable | Comparable (léger avantage) |
| Connexion pooling | Manuel (PgBouncer) | AlloyDB intégré |

**Verdict** : match nul sur Cloud SQL, léger avantage GCP si on utilise AlloyDB.

### Messaging : avantage GCP

| Critère | SQS | Pub/Sub |
|---------|-----|---------|
| Modèle | Point-à-point uniquement | Pub/Sub + point-à-point |
| Ordering | FIFO (limité) | Natif, plus flexible |
| Fan-out | Nécessite SNS + SQS | Natif |
| Dead letter | Oui | Oui |
| Prix | Par message | Par volume (souvent moins cher) |

**Verdict** : Pub/Sub est plus polyvalent. Pour nos flux de commandes et paiements, le pattern pub/sub natif aurait été utile.

### Monitoring & observabilité : avantage GCP

| Critère | CloudWatch | Cloud Monitoring |
|---------|-----------|-----------------|
| Prix | Cher (logs, métriques, dashboards payants) | Généreux free tier |
| Intégration K8s | Via addons | Natif avec GKE |
| Dashboards | Basiques | Plus riches |
| Alerting | Correct | Correct |
| Traces | X-Ray (séparé) | Cloud Trace (intégré) |

**Verdict** : avantage GCP, surtout sur le pricing. On dépensait une part significative de notre budget AWS juste en CloudWatch.

### Réseau & CDN : avantage AWS

| Critère | AWS | GCP |
|---------|-----|-----|
| CDN | CloudFront (leader marché) | Cloud CDN (correct) |
| DNS | Route 53 (excellent) | Cloud DNS (correct) |
| Load Balancer | ALB/NLB (matures) | Cloud Load Balancing (bon) |
| VPC | Très mature | Bon, mais différent |
| Points de présence | 450+ | 200+ |

**Verdict** : AWS a un réseau plus étendu et plus mature. CloudFront reste le meilleur CDN du marché.

### IAM & sécurité : avantage AWS

| Critère | AWS IAM | GCP IAM |
|---------|---------|---------|
| Granularité | Très fine | Fine |
| Policies | JSON détaillé | Rôles prédéfinis + custom |
| SSO intégration | Mature | Bon |
| Audit | CloudTrail (excellent) | Cloud Audit Logs (bon) |
| Compliance | Plus de certifications | En rattrapage |

**Verdict** : AWS a plus d'expérience en sécurité enterprise. Pour des clients comme des enseignes de distribution qui auditent notre infra, c'est un argument.

### Data & Analytics : avantage massif GCP

| Critère | AWS | GCP |
|---------|-----|-----|
| Data warehouse | Redshift (bon, cher) | BigQuery (excellent, serverless) |
| Data processing | EMR / Glue | Dataflow / Dataproc |
| ML/AI | SageMaker | Vertex AI |
| Intégration | Fragmentée | Très cohérente |

**Verdict** : BigQuery est le meilleur produit de Google Cloud. Pour de l'analytics sur nos données de commandes, c'aurait été un upgrade massif. C'est peut-être l'opportunité manquée la plus significative.

### Le score final

| Domaine | Gagnant |
|---------|---------|
| Kubernetes | GCP |
| Base de données | Égalité |
| Messaging | GCP |
| Monitoring | GCP |
| Réseau/CDN | AWS |
| IAM/Sécurité | AWS |
| Data/Analytics | GCP |
| Écosystème/Market share | AWS |
| **Score** | **GCP 4 - AWS 3 (+ 1 égalité)** |

Sur le papier, GCP gagne. Mais le score ne capture pas le **coût du changement**, qui est le vrai sujet.

## Chapitre 5 : Ce qui se serait passé si on avait migré

### Le scénario optimiste

Avec le support de Google et du cabinet partenaire :

**Mois 1-2** : audit, plan de migration, POC sur GKE Autopilot
**Mois 3-4** : migration des services non-critiques, double run
**Mois 5-6** : migration de la production, bascule DNS, décommissionnement AWS

Résultat après 6 mois :
- **GKE Autopilot** réduit la charge ops de 40%
- **Coûts cloud** réduits de 25-35% (crédits Google + pricing compétitif + FinOps intégré)
- **BigQuery** opérationnel pour l'analytics
- **DevOps** libérés pour travailler sur l'amélioration continue au lieu de l'ops K8s
- **Codebase modernisée** : la migration a forcé le nettoyage de la dette technique

### Le scénario pessimiste (et réaliste)

**Mois 1-2** : audit et plan — tout va bien
**Mois 3** : on commence la migration... et on découvre des dépendances cachées. Un service utilise une feature spécifique de SQS FIFO qui n'a pas d'équivalent exact dans Pub/Sub. Le mapping IAM est plus complexe que prévu
**Mois 4** : les DevOps sont submergés. Un incident production sur AWS nécessite leur attention, la migration prend du retard
**Mois 5** : un client enterprise demande un audit de sécurité. On leur explique qu'on est en pleine migration cloud. Ils paniquent
**Mois 6-8** : la migration se termine finalement avec 2 mois de retard, quelques incidents mineurs, et une équipe épuisée
**Mois 9-12** : stabilisation, correction des bugs post-migration, formation de l'équipe

Résultat : les bénéfices arrivent, mais **après 9-12 mois au lieu de 6**. Le coût humain est significatif.

### Le vrai risque : la réputation

Le pire scénario n'est pas technique. C'est un **incident client** pendant la migration. Un downtime de 4 heures sur le système de commandes d'un client clé un vendredi après-midi, avec comme root cause "on était en train de migrer de cloud"... C'est le genre d'événement qui peut coûter un contrat.

Pour une startup B2B qui se bat pour gagner la confiance de grands comptes, la stabilité perçue est aussi importante que la stabilité réelle.

## Chapitre 6 : Les leçons apprises

### 1. Le meilleur cloud est celui que votre équipe maîtrise

La supériorité technique de GKE sur EKS est réelle. Mais une équipe de 2 DevOps qui connaît AWS par cœur sera plus efficace sur AWS qu'une équipe de 2 DevOps qui apprend GCP, même si GCP est "objectivement meilleur".

**La maîtrise opérationnelle bat la supériorité technique.** Surtout avec une petite équipe.

### 2. Le coût du changement est toujours sous-estimé

Tout plan de migration sous-estime :
- Le temps de formation
- Les incompatibilités subtiles entre services "équivalents"
- L'impact sur le moral de l'équipe (fatigue du changement)
- Le coût d'opportunité (pendant qu'on migre, on ne développe pas de features)

### 3. Le timing compte plus que la technologie

Si DJUST avait été en phase de construction (2021-2022), la migration vers GCP aurait eu du sens. Le code n'est pas encore en production critique, l'équipe est petite et agile, les clients sont peu nombreux.

En 2024, avec des clients enterprise en production et des SLA contractuels, le calcul risque/bénéfice a changé. **Le bon moment pour migrer était il y a 2 ans ou dans 2 ans — pas maintenant.**

### 4. L'optimisation du cloud actuel est souvent le meilleur ROI

Notre plan d'optimisation AWS a donné des résultats concrets :
- **Savings Plans** : -35% sur le compute
- **Rightsizing** : -20% sur les instances surdimensionnées
- **GP2 → GP3** : -20% sur le stockage EBS
- **Nettoyage** : suppression des ressources orphelines (snapshots, volumes non attachés)

Total : environ **-30% sur la facture AWS**, sans aucun risque opérationnel, en quelques semaines de travail.

C'est moins que ce qu'une migration GCP aurait apporté à long terme, mais le ROI est **immédiat et sans risque**.

### 5. Les crédits cloud sont un piège stratégique

AWS Activate, Google Cloud Credits, Azure for Startups — tous les clouds offrent des crédits aux startups. Le problème : ces crédits créent un **lock-in initial**. Vous construisez votre stack sur un cloud parce qu'il est "gratuit", puis les crédits expirent, et vous êtes piégé par les coûts de migration.

Le conseil : dès le jour 1, abstraire autant que possible les services cloud-spécifiques. Utiliser Kubernetes (portable), PostgreSQL standard (portable), S3 compatible (MinIO en local). Minimiser les services propriétaires (SQS, SNS, DynamoDB) qui créent du lock-in.

### 6. Le cloud-agnostic est un idéal, pas une réalité

Cela dit, être 100% cloud-agnostic est une chimère. Vous finirez toujours par utiliser des services managés spécifiques (RDS, EKS, CloudFront). L'objectif réaliste n'est pas le cloud-agnostic, c'est la **réduction du coût de migration**. Chaque choix architectural devrait être évalué avec la question : "combien ça coûterait de changer ça si on devait migrer ?"

### 7. Avec 2 DevOps, chaque décision d'infra est critique

C'est peut-être la leçon la plus importante. Avec une équipe ops de 2 personnes :
- **Chaque service ajouté** est un service de plus à maintenir
- **Chaque migration** consomme une part significative du bandwidth total
- **Chaque incident** mobilise 50% de l'équipe ops

La contrainte n'est pas technique. C'est le **temps humain disponible**. Et c'est cette contrainte qui, in fine, a fait pencher la balance vers "on reste et on optimise".

## Chapitre 7 : Et si c'était à refaire ?

### Ce que je changerais

Si je pouvais revenir en 2021, au démarrage de DJUST :

1. **Je commencerais sur GCP** plutôt qu'AWS. GKE Autopilot dès le jour 1 aurait évité toute cette histoire
2. **J'abstrairais le messaging** : utiliser un broker standard (RabbitMQ, NATS) au lieu de SQS, pour rester portable
3. **J'intégrerais BigQuery** dès le début pour l'analytics
4. **Je mettrais en place du FinOps** dès le mois 1, pas après 3 ans

### Ce que je garderais

1. **La décision de rester en 2024** : dans le contexte de l'époque (clients enterprise, petite équipe, SLA), c'était la bonne décision
2. **L'optimisation AWS** : le ROI immédiat sans risque, c'est pragmatique
3. **La relation avec Google** : même sans migrer, les événements Google Cloud nous ont ouvert les yeux sur ce qui se fait ailleurs. Et la porte reste ouverte

### Ce qui pourrait changer

DJUST grandit. L'équipe DevOps pourrait passer à 4-5 personnes. Les crédits Google pourraient être renégociés. Le marché évolue. Une migration reste possible — mais elle se ferait à un moment choisi, pas sous la pression d'une offre commerciale.

## Conclusion

Cette histoire n'est pas un échec. C'est une **leçon de pragmatisme**.

En tant qu'ingénieur, j'aurais voulu migrer. GKE est meilleur qu'EKS. BigQuery nous aurait ouvert des portes. La modernisation de la codebase aurait fait du bien. Et travailler avec des ingénieurs Google, c'est une opportunité rare.

Mais en tant qu'Engineering Manager, je comprends la décision de la direction. Quand vous servez des clients enterprise avec des SLA, que votre équipe ops fait 2 personnes, et que votre plateforme est en croissance — **la stabilité est une feature**. La plus importante, même.

Le cloud n'est pas une religion. AWS n'est pas "mauvais" et GCP n'est pas "meilleur". Ce sont des outils, et le bon choix dépend du contexte : la taille de l'équipe, la maturité du produit, les contraintes clients, le timing.

Si vous êtes dans une situation similaire — Google ou Azure qui vous courtise pour quitter AWS — posez-vous ces questions :
- Quelle est la taille de mon équipe ops ?
- Quels sont mes SLA clients ?
- Est-ce que j'ai le bandwidth pour une migration ET le run quotidien ?
- Est-ce que le ROI justifie le risque ?

Si la réponse à la dernière question n'est pas un "oui" clair, restez et optimisez. Le meilleur cloud, c'est celui qui vous laisse dormir la nuit.

---

*Chetana YIN — Février 2026*
*Engineering Manager chez DJUST, partisan de GCP qui dort bien sur AWS.*`

const contentEn = `## Introduction

In 2024, Google Cloud invited my team and me at DJUST to a series of exclusive events. The pitch was clear: **"You've been on AWS for 4 years. Come to us, we'll support your migration, and we'll offer you substantial cloud credits."**

Google wasn't doing this out of charity. DJUST is a B2B SaaS e-commerce platform processing orders for clients in food distribution, construction, and fashion. It's exactly the type of workload GCP wants to attract: Java/Spring Boot, Kubernetes, PostgreSQL, Elasticsearch — everything Google Cloud excels at.

I was completely in favor. I saw this migration as a unique opportunity: not just saving on cloud costs, but above all **modernizing our codebase** by working hand-in-hand with Google engineers and a partner cloud consulting firm. It was the perfect chance to pay down technical debt while being supported by experts.

But DJUST's leadership said no. And in hindsight, I understand why — even though part of me still regrets the missed opportunity.

Here's the full story, the technical analysis, and the lessons I've drawn.

## Chapter 1: Context — DJUST on AWS

### How we ended up on AWS

DJUST was created in 2021. Like 90% of tech startups, the initial cloud choice was pragmatic:

- **AWS Activate credits**: Amazon offers up to $100,000 in credits to startups. For a company just starting out, it's a massive argument
- **Familiarity**: the first developers (including me, as Lead Software Engineer) knew AWS. EC2, RDS, S3, SQS — it's the lingua franca of cloud
- **Ecosystem**: more documentation, more tutorials, more StackOverflow answers for AWS than any other cloud

The choice wasn't based on a detailed benchmark. It was: "We know AWS, we have credits, let's go." And that's **normal** for a startup in build phase. The priority is shipping the product, not optimizing infrastructure.

### Our AWS stack in 2024

After 3 years of development, our infrastructure looked like this:

- **EKS** (Elastic Kubernetes Service): our managed Kubernetes cluster, hosting ~15 Spring Boot microservices
- **RDS PostgreSQL**: our main database (multi-AZ for high availability)
- **ElastiCache Redis**: cache and sessions
- **Amazon Elasticsearch Service**: product search engine
- **SQS**: messaging between microservices (orders, payments, notifications)
- **S3**: asset storage (product images, documents)
- **ECR**: Docker registry for our images
- **CloudFront**: CDN for the frontend
- **Route 53**: DNS
- **IAM**: access management
- **CloudWatch**: monitoring and logs

All managed by **2 DevOps engineers**. Two people. For a platform serving enterprise clients with demanding SLAs.

### The pain points

After 3 years on AWS, we'd accumulated frustrations:

**1. Exploding costs**

The Activate credits had run out. And the AWS bill had a clear trend: **it went up every month**. EKS alone costs ~$75/month just for the control plane, before even adding nodes. Multi-AZ RDS is expensive. ElastiCache is expensive. And above all: AWS is **notoriously opaque** about its pricing. Understanding your AWS bill is a job in itself.

**2. Operational complexity**

With 2 DevOps managing all of this, we were constantly in firefighting mode. An EKS upgrade? That's a week of preparation. An RDS incident? Everyone's on alert. The operational burden was disproportionate to the team size.

**3. AWS-tied technical debt**

We'd made quick choices early on (normal for a startup) that were becoming anchors:
- Oversized EC2 instances "just to be safe"
- Unoptimized services (unused Reserved Instances, GP2 instead of GP3)
- Partial and expensive CloudWatch monitoring
- No structured FinOps

## Chapter 2: Google's Offer

### The Google Cloud events

Google Cloud has an aggressive strategy to attract AWS customers. They identify growing companies on AWS and offer personalized support.

For DJUST, this materialized as:

- **Invitations to Google Cloud events**: technical workshops, client case presentations, networking with tech decision-makers
- **Technical engagement**: Google Cloud engineers ready to work with us on a detailed migration plan
- **Partnership with a partner cloud consulting firm**: specializing in cloud migrations, which would have provided operational migration support
- **GCP credits**: substantial cloud credits to cover the migration period and beyond (often $100K-300K over 1-2 years for this type of deal)

### What GCP was putting on the table

**GKE (Google Kubernetes Engine) vs EKS**

This is Google's strongest point. GKE is unanimously recognized as the **best managed Kubernetes on the market**:
- **Autopilot**: GKE manages nodes automatically. With EKS, our DevOps spent time managing node groups
- **Cost**: GKE Autopilot = $0 for the control plane. EKS = $73/month fixed
- **Upgrades**: GKE updates almost automatically. EKS requires planned manual updates
- **Kubernetes was born at Google** — and it shows

For our 2-person DevOps team, GKE Autopilot would have been a **game changer**.

**BigQuery — the missed opportunity**

We had no data warehouse. BigQuery would have opened the door to advanced analytics on our order, payment, and customer behavior data. It's Google Cloud's **best product**, with no direct AWS equivalent at the same price/performance.

### The hidden opportunity: modernizing the codebase

This was what excited me most. A cloud migration is an opportunity to **review everything**: microservice architecture, FinOps, CI/CD, technical debt. And we wouldn't have been alone — Google engineers + the partner firm would have brought their expertise.

## Chapter 3: Why Leadership Said No

### The client risk argument

DJUST serves enterprise clients with **contractual SLAs**. A 2-hour downtime isn't just a technical incident — it's a financial penalty and a loss of trust.

A cloud migration for a platform our size means:
- **3 to 6 months** of work minimum
- Risk of **downtime** during the switchover
- A costly **dual-run** period (both clouds in parallel)
- **Unexpected bugs** from subtle differences between services
- A **learning curve** for DevOps who know AWS inside out but not GCP

### The team argument

With **2 DevOps**, we didn't have the bandwidth to maintain production AND pilot a migration simultaneously.

### The short-term cost argument

Migrating to save money costs money upfront: dual-run, consulting, training, human time. Estimated **6-12 months before positive ROI**.

### The decision: optimize AWS

Leadership decided: **stay on AWS, but optimize**. Savings Plans, rightsizing, GP2→GP3, resource cleanup. Result: approximately **-30% on the AWS bill**, with zero operational risk.

## Chapter 4: AWS vs GCP — Deep Technical Analysis

### Kubernetes: clear GCP advantage

GKE is objectively better than EKS. Kubernetes was invented by Google, and it shows. GKE Autopilot ($0 control plane, automatic node management) would have significantly reduced operational burden for 2 DevOps.

### Database: tie

RDS PostgreSQL and Cloud SQL are comparable. AlloyDB (Google's PostgreSQL-compatible) could offer 4x performance for transactional workloads — interesting for our OMS.

### Messaging: GCP advantage

Pub/Sub is more versatile than SQS: native pub/sub pattern, flexible ordering, simpler pricing.

### Monitoring: GCP advantage

CloudWatch is expensive. Google Cloud Monitoring has a generous free tier and native GKE integration.

### Network/CDN: AWS advantage

CloudFront remains the best CDN. AWS has 450+ points of presence vs GCP's 200+.

### IAM/Security: AWS advantage

More certifications, more enterprise audit experience. Important for clients who audit our infrastructure.

### Data/Analytics: massive GCP advantage

BigQuery is the best product in Google Cloud. No direct equivalent at the same price/performance on AWS.

### Final score: GCP 4 - AWS 3 (1 tie)

On paper, GCP wins. But the score doesn't capture the **cost of change**, which is the real issue.

## Chapter 5: Lessons Learned

### 1. The best cloud is the one your team masters

GKE's technical superiority over EKS is real. But 2 DevOps who know AWS by heart will be more effective on AWS than 2 DevOps learning GCP. **Operational mastery beats technical superiority.**

### 2. The cost of change is always underestimated

Every migration plan underestimates: training time, subtle incompatibilities, team morale impact, opportunity cost.

### 3. Timing matters more than technology

In 2021 (build phase), migration would have made sense. In 2024 (enterprise clients, contractual SLAs), the risk/benefit calculation had changed.

### 4. Optimizing your current cloud often has the best ROI

-30% on the AWS bill, zero risk, a few weeks of work. Less than a GCP migration would have brought long-term, but **immediate and risk-free ROI**.

### 5. Cloud credits are a strategic trap

All clouds offer startup credits that create initial lock-in. Advice: abstract cloud-specific services from day 1. Use Kubernetes (portable), standard PostgreSQL (portable), S3-compatible storage. Minimize proprietary services.

### 6. With 2 DevOps, every infrastructure decision is critical

The constraint isn't technical. It's **available human time**. And it's this constraint that ultimately tipped the balance toward "stay and optimize."

## Conclusion

This story isn't a failure. It's a **lesson in pragmatism**.

As an engineer, I wanted to migrate. GKE is better than EKS. BigQuery would have opened doors. Working with Google engineers is a rare opportunity.

But as an Engineering Manager, I understand leadership's decision. When you serve enterprise clients with SLAs, your ops team is 2 people, and your platform is growing — **stability is a feature**. The most important one.

The cloud isn't a religion. AWS isn't "bad" and GCP isn't "better." They're tools, and the right choice depends on context: team size, product maturity, client constraints, timing.

If you're in a similar situation — Google or Azure courting you to leave AWS — ask yourself:
- How big is my ops team?
- What are my client SLAs?
- Do I have the bandwidth for a migration AND daily operations?
- Does the ROI clearly justify the risk?

If the answer to the last question isn't a clear "yes," stay and optimize. The best cloud is the one that lets you sleep at night.

---

*Chetana YIN — February 2026*
*Engineering Manager at DJUST, GCP advocate who sleeps well on AWS.*`

const contentKm = `## សេចក្តីផ្តើម

ក្នុងឆ្នាំ 2024 Google Cloud បានអញ្ជើញក្រុមរបស់ខ្ញុំនៅ DJUST ទៅព្រឹត្តិការណ៍ផ្តាច់មុខជាច្រើន។ សំណើច្បាស់៖ **"អ្នកនៅលើ AWS អស់ ៤ ឆ្នាំហើយ។ មកជាមួយយើង យើងនឹងជួយក្នុងការផ្លាស់ប្តូរ ហើយយើងផ្តល់ credit cloud ច្រើន។"**

ខ្ញុំយល់ស្របទាំងស្រុង។ ខ្ញុំមើលឃើញក្នុងការផ្លាស់ប្តូរនេះជាឱកាសពិសេស៖ មិនត្រឹមតែសន្សំថ្លៃ cloud ប៉ុណ្ណោះទេ ថែមទាំង **ទំនើបកម្ម codebase** របស់យើងដោយធ្វើការជាមួយវិស្វករ Google និងក្រុមហ៊ុនពិគ្រោះ cloud ដៃគូ។

ប៉ុន្តែថ្នាក់ដឹកនាំ DJUST បាននិយាយថាទេ។ ហើយនៅពេលមើលថយក្រោយ ខ្ញុំយល់ពីមូលហេតុ។

## AWS vs GCP — ការវិភាគ

**Kubernetes**: GKE ល្អជាង EKS យ៉ាងច្បាស់។ GKE Autopilot គ្រប់គ្រង nodes ដោយស្វ័យប្រវត្តិ control plane ឥតគិតថ្លៃ។ សម្រាប់ក្រុម DevOps ២ នាក់ វាជា game changer។

**មូលដ្ឋានទិន្នន័យ**: RDS PostgreSQL និង Cloud SQL ស្មើគ្នា។ AlloyDB អាចផ្តល់ប្រសិទ្ធភាព 4x សម្រាប់ workloads ប្រតិបត្តិការ។

**Analytics**: BigQuery ជាផលិតផលល្អបំផុតរបស់ Google Cloud ដែលគ្មានសមភាគផ្ទាល់នៅ AWS។

## ហេតុអ្វីយើងនៅលើ AWS

ជាមួយ DevOps ២ នាក់ អតិថិជន enterprise និង SLA កិច្ចសន្យា ហានិភ័យនៃការផ្លាស់ប្តូរខ្ពស់ពេក។ ការបង្កើនប្រសិទ្ធភាព AWS បានផ្តល់ **-30%** លើវិក្កយបត្រ ដោយគ្មានហានិភ័យប្រតិបត្តិការ។

## មេរៀន

- Cloud ល្អបំផុតគឺដែលក្រុមរបស់អ្នកស្គាល់
- ការចំណាorg នៃការផ្លាស់ប្តូរត្រូវបានប៉ាន់ស្មានទាបជានិច្ច
- ពេលវេលាសំខាន់ជាងបច្ចេកវិទ្យា
- ស្ថេរភាពជា feature — feature សំខាន់បំផុត

Cloud មិនមែនជាសាសនាទេ។ ជម្រើorg ត្រឹមត្រូវអាស្រ័យលើបរិបទ។

---

*Chetana YIN — កុម្ភៈ 2026*
*Engineering Manager នៅ DJUST អ្នកគាំទ org GCP ដែលគេងស្រួលនៅលើ AWS។*`

async function seed() {
  console.log('🌱 Seeding blog article: AWS vs GCP at DJUST...')

  await db.delete(blogPosts).where(eq(blogPosts.slug, 'aws-gcp-migration-startup-b2b'))

  await db.insert(blogPosts).values({
    slug: 'aws-gcp-migration-startup-b2b',
    titleFr: 'Quand Google Cloud vous courtise : pourquoi on est resté sur AWS (et ce qu\'on y a perdu)',
    titleEn: 'When Google Cloud courts you: why we stayed on AWS (and what we lost)',
    titleKm: 'នៅពេល Google Cloud អញ្ជើញអ្នក៖ ហេតុអ្វីយើងនៅលើ AWS (និងអ្វីដែលយើងបានបាត់)',
    contentFr,
    contentEn,
    contentKm,
    excerptFr: 'Google nous a proposé de migrer de AWS vers GCP avec accompagnement et crédits. Avec 2 DevOps et des clients enterprise, on a choisi de rester. Analyse technique complète AWS vs GCP et leçons apprises.',
    excerptEn: 'Google offered to migrate us from AWS to GCP with support and credits. With 2 DevOps and enterprise clients, we chose to stay. Complete AWS vs GCP technical analysis and lessons learned.',
    excerptKm: 'Google បានស្នើឱ្យយើងផ្លាស់ប្តូរពី AWS ទៅ GCP ជាមួយការគាំទ្រ និង credits។ ជាមួយ DevOps ២ នាក់ និងអតិថិជន enterprise យើងបានជ្រើសរើសនៅ។ ការវិភាគបច្ចេកទorg ពេញលេorg AWS vs GCP។',
    tags: ['AWS', 'GCP', 'Cloud', 'DevOps', 'Kubernetes', 'Infrastructure'],
    published: true
  })

  console.log('✅ Blog article seeded successfully!')
}

seed().catch(console.error)
