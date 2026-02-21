import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { blogPosts } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

const contentFr = `## Introduction

En novembre 2024, j'ai découvert Claude Code. Deux semaines plus tard, je l'avais intégré dans le workflow quotidien de mon équipe de 6 ingénieurs chez DJUST. Trois mois après, notre productivité sur les tâches répétitives avait augmenté de 40%.

Ce n'est pas un article promotionnel. C'est un retour d'expérience brut — avec les succès, les échecs, les résistances humaines, et les leçons apprises — sur ce que ça implique concrètement d'intégrer un outil IA dans une équipe d'engineering qui tourne en production.

---

## Chapitre 1 : Le contexte — une équipe sous pression

### DJUST en 2024

DJUST est une plateforme e-commerce B2B SaaS. Mon périmètre en tant qu'Engineering Manager couvre l'Order Management System (OMS), les Payments et le Cart. C'est le cœur transactionnel de la plateforme — là où passent les commandes de clients comme Franprix, Eiffage (Blueon) ou VEJA.

L'équipe :
- 6 ingénieurs (4 seniors, 2 mid-level)
- Stack : Java 17, Spring Boot, PostgreSQL, Elasticsearch, Kubernetes sur AWS
- ~15 modules Maven interdépendants
- Releases hebdomadaires le jeudi
- SLA contractuels avec les clients enterprise

### Le problème de productivité

En analysant où passait le temps de l'équipe, j'ai identifié un pattern récurrent :

**30% du temps était consommé par des tâches répétitives à faible valeur ajoutée :**

- **Code reviews** : 2-3 heures par jour pour moi en tant que lead technique. Chaque PR nécessitait une lecture attentive, des commentaires sur le style, la couverture de tests, les edge cases
- **Tests boilerplate** : écrire des tests unitaires pour des CRUDs, des mappers, des DTOs — du code prévisible mais chronophage
- **Briefings de déploiement** : chaque release nécessitait un document récapitulatif des changements, des risques, des rollback plans
- **Analyse de bugs** : fouiller les logs, croiser les stacktraces avec le code, identifier le commit fautif
- **Documentation** : mettre à jour les ADRs, les runbooks, les README après chaque changement d'architecture

Ces tâches ne sont pas inutiles — elles sont essentielles. Mais elles sont **prévisibles et structurées**, ce qui les rend parfaites pour l'automatisation par IA.

## Chapitre 2 : La découverte de Claude Code

### Le chemin avant Claude Code

Avant d'arriver à Claude Code, j'ai exploré d'autres outils IA :

**GitHub Copilot** (6 mois) — L'autocomplétion est utile, mais limitée : elle suggère du code ligne par ligne sans comprendre le contexte global du projet. Pour du boilerplate, c'est bien. Pour de l'architecture, c'est insuffisant.

**Zencoder** — J'ai utilisé Zencoder pour m'aider à valider certaines tâches. C'était un bon intermédiaire entre le "pas d'IA" et le "full AI-assisted". Ça m'a montré le potentiel de l'IA pour les tâches de validation et de vérification, mais l'outil restait limité dans son intégration au workflow.

**Google Gemini** — J'ai utilisé Gemini massivement pendant plusieurs mois pour mes recherches techniques. Pour comprendre un concept, explorer une librairie, comparer des approches architecturales — Gemini était mon moteur de recherche amélioré. Mais il restait cantonné au navigateur, déconnecté du code.

### Pourquoi Claude Code a tout changé

Ce qui m'a convaincu avec Claude Code :

1. **L'accès au codebase complet** : Claude Code voit tous les fichiers du projet, comprend l'architecture, les conventions, les patterns existants
2. **Les skills personnalisés** : on peut créer des prompts réutilisables qui encapsulent le contexte métier
3. **L'intégration MCP** : connexion native à Slack, Jira, GitLab, Notion — Claude peut lire un ticket Jira et proposer un plan d'implémentation
4. **Le mode agentic** : Claude ne se contente pas de suggérer du code, il peut exécuter des commandes, lancer des tests, vérifier que ça compile

### Le premier test : une code review automatisée

Mon premier skill Claude Code a été une code review automatisée. Le prompt :

*"Analyse cette PR GitLab. Vérifie : la couverture de tests, les conventions de nommage DJUST, les edge cases manquants, les problèmes de performance potentiels, la cohérence avec l'architecture hexagonale. Produis un rapport structuré avec des suggestions concrètes."*

Le résultat m'a bluffé. Non seulement Claude identifiait des problèmes que j'aurais vus, mais il en trouvait certains que j'aurais manqués — notamment des race conditions subtiles dans du code asynchrone et des incohérences de nommage entre modules.

## Chapitre 3 : L'écosystème de 25+ skills

### Architecture des skills

On a organisé nos skills en 5 catégories :

### 1. Code Quality (7 skills)

- **review-pr** : analyse complète d'une PR avec scoring
- **review-security** : audit de sécurité (OWASP top 10, injection, XSS)
- **review-perf** : analyse de performance (N+1 queries, mémoire, complexité)
- **check-conventions** : vérification des conventions DJUST (nommage, structure, patterns)
- **suggest-refactor** : suggestions de refactoring avec justification
- **check-api-contract** : vérification de la compatibilité backward des changements d'API
- **check-migration** : validation des migrations DB (reversibilité, performance, locks)

### 2. Testing (5 skills)

- **generate-unit-tests** : génération de tests unitaires pour une classe
- **generate-e2e-test** : génération de scénarios E2E à partir d'un ticket Jira
- **generate-test-data** : création de fixtures réalistes
- **analyze-test-coverage** : identification des chemins non testés
- **generate-mutation-tests** : suggestions de tests de mutation

### 3. Deployment & Ops (5 skills)

- **briefing-mep** : génération du briefing de mise en production
- **analyze-incident** : analyse d'incident à partir des logs et metrics
- **generate-rollback-plan** : plan de rollback pour une release
- **check-deploy-readiness** : checklist de déploiement
- **post-mortem** : template de post-mortem à partir d'un incident

### 4. Documentation (4 skills)

- **update-adr** : mise à jour d'un Architecture Decision Record
- **generate-runbook** : création d'un runbook opérationnel
- **document-api** : documentation OpenAPI à partir du code
- **changelog** : génération du changelog à partir des commits

### 5. Productivity (4+ skills)

- **plan-implementation** : plan d'implémentation à partir d'un ticket
- **estimate-complexity** : estimation de complexité d'un ticket
- **daily-summary** : résumé quotidien de l'activité de l'équipe
- **onboarding-guide** : guide d'onboarding contextualisé pour un nouveau développeur

### Le MCP : le vrai game-changer

Ce qui rend ces skills vraiment puissants, c'est l'intégration MCP (Model Context Protocol). Claude se connecte directement à nos outils :

- **GitLab** : lecture des PRs, des pipelines, des commits
- **Jira** : lecture des tickets, des sprints, des epics
- **Slack** : envoi de résumés, notifications d'incidents
- **Notion** : mise à jour de la documentation

Concrètement, quand un développeur finit une PR, il tape \`/review-pr 1234\` et Claude :
1. Lit la PR sur GitLab
2. Lit le ticket Jira associé
3. Analyse le code par rapport aux conventions
4. Poste un rapport de review structuré
5. Notifie sur Slack si des problèmes critiques sont trouvés

Le tout en 30 secondes au lieu de 45 minutes.

## Chapitre 4 : Les résultats mesurés

### Méthodologie

On a mesuré la productivité sur 3 mois (décembre 2024 - février 2025) en comparant avec les 3 mois précédents :

| Métrique | Avant | Après | Delta |
|----------|-------|-------|-------|
| Temps moyen de code review | 45 min | 15 min | -67% |
| Temps d'écriture de tests | 2h/feature | 45 min/feature | -63% |
| Temps de briefing MEP | 1h30 | 20 min | -78% |
| Bugs détectés en review | 3.2/PR | 5.1/PR | +59% |
| Temps d'analyse d'incident | 2h | 40 min | -67% |
| Velocity sprint (story points) | 42 | 58 | +38% |

### Le chiffre clé : +40% de productivité

Sur les **tâches répétitives** spécifiquement, la productivité a augmenté de 40%. Ce chiffre exclut les tâches créatives (conception, architecture, discussions produit) où l'IA n'a pas d'impact mesurable.

### Ce que les chiffres ne montrent pas

- **La qualité des reviews a augmenté** : Claude trouve des edge cases que les humains manquent par fatigue cognitive
- **Le moral de l'équipe a monté** : personne n'aime écrire des tests boilerplate. Automatiser ça, c'est libérer du temps pour le travail intéressant
- **L'onboarding est plus rapide** : un nouveau développeur peut utiliser les skills dès le jour 1 pour comprendre le codebase

## Chapitre 5 : Les résistances et les échecs

### La résistance humaine

Pas tout le monde était enthousiaste au départ :

**"Ça va nous remplacer"** — La crainte classique. J'ai dû expliquer que Claude ne remplace pas les développeurs, il remplace les tâches que les développeurs n'aiment pas faire. Un senior qui passe 3h par jour en code review n'est pas bien utilisé. Un senior qui passe 3h par jour en conception d'architecture, si.

**"Le code généré est médiocre"** — Vrai au début. Les premiers skills produisaient du code générique. Il a fallu itérer sur les prompts, ajouter du contexte (conventions, exemples, patterns existants) pour obtenir un output utilisable. C'est un investissement de 2-3 semaines.

**"Je préfère le faire moi-même"** — Le syndrome du "not invented here" appliqué à l'IA. Certains développeurs ont mis du temps à faire confiance aux reviews automatisées. La clé : montrer que Claude trouve des bugs que les humains manquent.

### Les échecs

**Skill "auto-fix-bug"** — On a essayé de créer un skill qui fixe automatiquement les bugs à partir des stacktraces. Ça marchait pour les bugs simples (NPE, type mismatch) mais échouait sur les bugs logiques complexes. On l'a transformé en "analyze-bug" qui propose des hypothèses plutôt que des fixes.

**Sur-confiance initiale** — Les premières semaines, certains développeurs validaient les suggestions de Claude sans vérification. On a eu un incident mineur (un test E2E qui passait en CI mais cachait un faux positif). Ça nous a rappelé que l'IA est un outil, pas un oracle.

**Coût des tokens** — À raison de 6 développeurs qui utilisent Claude intensivement, la facture mensuelle est significative. On a dû optimiser les prompts et mettre en place des limites d'usage pour rester dans le budget.

## Chapitre 6 : Les leçons apprises

### 1. Commencer petit, itérer vite

Ne lancez pas 25 skills d'un coup. On a commencé par un seul (review-pr), on l'a peaufiné pendant 2 semaines, puis on a ajouté les suivants un par un. Chaque skill nécessite du tuning spécifique au contexte de votre équipe.

### 2. Le contexte est roi

Un prompt générique produit un résultat générique. La qualité des skills dépend directement du contexte que vous leur donnez :
- Les conventions de nommage de votre équipe
- Des exemples de code existant
- Les patterns architecturaux de votre projet
- Les erreurs fréquentes à surveiller

### 3. L'humain reste dans la boucle

Claude ne remplace pas la review humaine, il la prépare. Le workflow optimal : Claude fait une première passe (conventions, tests, edge cases), le reviewer humain se concentre sur la logique métier et les choix d'architecture.

### 4. Mesurer, mesurer, mesurer

Sans métriques, c'est de l'intuition. On a mis en place un dashboard simple qui track le temps passé par catégorie de tâche. C'est ce qui nous a permis de prouver le ROI et de justifier le budget.

### 5. Former l'équipe au prompting

L'IA est aussi bonne que le prompt qu'on lui donne. On a organisé des sessions de "prompt engineering" internes pour que chaque développeur sache tirer le meilleur de Claude.

## Chapitre 7 : L'avenir — où va-t-on ?

### Ce qu'on prépare

- **Review automatique sur chaque PR** : Claude se déclenche automatiquement sur chaque merge request GitLab via un webhook
- **Tests de non-régression intelligents** : Claude identifie quels tests doivent tourner en fonction des fichiers modifiés
- **Assistant d'architecture** : un skill qui connaît l'historique des ADR et peut suggérer des décisions cohérentes avec le passé

### Ma conviction

On est au tout début de la révolution IA dans l'engineering. Dans 2 ans, ne pas utiliser d'IA dans son workflow de développement sera aussi anachronique que ne pas utiliser de linter.

Les équipes qui adoptent ces outils maintenant auront un avantage compétitif massif — pas parce que l'IA est magique, mais parce qu'elle libère les humains pour faire ce qu'ils font de mieux : penser, concevoir, innover.

L'IA n'est pas un gadget. C'est un **multiplicateur de force concret**. Et le meilleur moment pour l'intégrer, c'est maintenant.

---

*Chetana YIN — Février 2026*
*Engineering Manager chez DJUST, 25+ skills Claude Code en production.*`

const contentEn = `## Introduction

In November 2024, I discovered Claude Code. Two weeks later, I had integrated it into my team's daily workflow of 6 engineers at DJUST. Three months later, our productivity on repetitive tasks had increased by 40%.

This isn't a promotional article. It's a raw experience report — with successes, failures, human resistance, and lessons learned — about what it concretely means to integrate an AI tool into an engineering team running in production.

---

## Chapter 1: The Context — A Team Under Pressure

### DJUST in 2024

DJUST is a B2B SaaS e-commerce platform. My scope as Engineering Manager covers the Order Management System (OMS), Payments, and Cart. It's the transactional core of the platform — where orders flow for clients like Franprix, Eiffage (Blueon), and VEJA.

The team:
- 6 engineers (4 seniors, 2 mid-level)
- Stack: Java 17, Spring Boot, PostgreSQL, Elasticsearch, Kubernetes on AWS
- ~15 interdependent Maven modules
- Weekly Thursday releases
- Contractual SLAs with enterprise clients

### The Productivity Problem

Analyzing where the team's time went, I identified a recurring pattern:

**30% of time was consumed by low-value repetitive tasks:**

- **Code reviews**: 2-3 hours per day for me as technical lead. Each PR required careful reading, comments on style, test coverage, edge cases
- **Boilerplate tests**: writing unit tests for CRUDs, mappers, DTOs — predictable but time-consuming code
- **Deployment briefings**: each release needed a summary document of changes, risks, rollback plans
- **Bug analysis**: digging through logs, cross-referencing stacktraces with code, identifying the faulty commit
- **Documentation**: updating ADRs, runbooks, READMEs after every architecture change

These tasks aren't useless — they're essential. But they're **predictable and structured**, making them perfect for AI automation.

## Chapter 2: Discovering Claude Code

### The Road Before Claude Code

Before arriving at Claude Code, I explored other AI tools:

**GitHub Copilot** (6 months) — Autocompletion is useful but limited: it suggests code line by line without understanding the project's global context. For boilerplate, it's fine. For architecture, it's insufficient.

**Zencoder** — I used Zencoder to help validate certain tasks. It was a good intermediate between "no AI" and "full AI-assisted." It showed me AI's potential for validation and verification tasks, but the tool remained limited in its workflow integration.

**Google Gemini** — I used Gemini extensively for several months for my technical research. To understand a concept, explore a library, compare architectural approaches — Gemini was my enhanced search engine. But it stayed confined to the browser, disconnected from the code.

### Why Claude Code Changed Everything

What convinced me about Claude Code:

1. **Full codebase access**: Claude Code sees all project files, understands the architecture, conventions, and existing patterns
2. **Custom skills**: you can create reusable prompts that encapsulate business context
3. **MCP integration**: native connection to Slack, Jira, GitLab, Notion — Claude can read a Jira ticket and propose an implementation plan
4. **Agentic mode**: Claude doesn't just suggest code, it can execute commands, run tests, verify compilation

### The First Test: An Automated Code Review

My first Claude Code skill was an automated code review. The prompt:

*"Analyze this GitLab PR. Check: test coverage, DJUST naming conventions, missing edge cases, potential performance issues, consistency with hexagonal architecture. Produce a structured report with concrete suggestions."*

The result amazed me. Not only did Claude identify issues I would have seen, but it found some I would have missed — particularly subtle race conditions in asynchronous code and naming inconsistencies between modules.

## Chapter 3: The 25+ Skills Ecosystem

### Skills Architecture

We organized our skills into 5 categories:

### 1. Code Quality (7 skills)

- **review-pr**: comprehensive PR analysis with scoring
- **review-security**: security audit (OWASP top 10, injection, XSS)
- **review-perf**: performance analysis (N+1 queries, memory, complexity)
- **check-conventions**: DJUST convention verification (naming, structure, patterns)
- **suggest-refactor**: refactoring suggestions with justification
- **check-api-contract**: backward compatibility verification for API changes
- **check-migration**: DB migration validation (reversibility, performance, locks)

### 2. Testing (5 skills)

- **generate-unit-tests**: unit test generation for a class
- **generate-e2e-test**: E2E scenario generation from a Jira ticket
- **generate-test-data**: realistic fixture creation
- **analyze-test-coverage**: identification of untested paths
- **generate-mutation-tests**: mutation test suggestions

### 3. Deployment & Ops (5 skills)

- **briefing-mep**: production deployment briefing generation
- **analyze-incident**: incident analysis from logs and metrics
- **generate-rollback-plan**: rollback plan for a release
- **check-deploy-readiness**: deployment checklist
- **post-mortem**: post-mortem template from an incident

### 4. Documentation (4 skills)

- **update-adr**: Architecture Decision Record update
- **generate-runbook**: operational runbook creation
- **document-api**: OpenAPI documentation from code
- **changelog**: changelog generation from commits

### 5. Productivity (4+ skills)

- **plan-implementation**: implementation plan from a ticket
- **estimate-complexity**: ticket complexity estimation
- **daily-summary**: daily summary of team activity
- **onboarding-guide**: contextualized onboarding guide for new developers

### MCP: The Real Game-Changer

What makes these skills truly powerful is MCP (Model Context Protocol) integration. Claude connects directly to our tools:

- **GitLab**: reading PRs, pipelines, commits
- **Jira**: reading tickets, sprints, epics
- **Slack**: sending summaries, incident notifications
- **Notion**: updating documentation

Concretely, when a developer finishes a PR, they type \`/review-pr 1234\` and Claude:
1. Reads the PR on GitLab
2. Reads the associated Jira ticket
3. Analyzes the code against conventions
4. Posts a structured review report
5. Notifies on Slack if critical issues are found

All in 30 seconds instead of 45 minutes.

## Chapter 4: Measured Results

### Methodology

We measured productivity over 3 months (December 2024 - February 2025) comparing with the previous 3 months:

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| Average code review time | 45 min | 15 min | -67% |
| Test writing time | 2h/feature | 45 min/feature | -63% |
| Deployment briefing time | 1h30 | 20 min | -78% |
| Bugs detected in review | 3.2/PR | 5.1/PR | +59% |
| Incident analysis time | 2h | 40 min | -67% |
| Sprint velocity (story points) | 42 | 58 | +38% |

### The Key Number: +40% Productivity

On **repetitive tasks** specifically, productivity increased by 40%. This number excludes creative tasks (design, architecture, product discussions) where AI has no measurable impact.

### What the Numbers Don't Show

- **Review quality increased**: Claude finds edge cases that humans miss due to cognitive fatigue
- **Team morale improved**: nobody likes writing boilerplate tests. Automating that frees up time for interesting work
- **Onboarding is faster**: a new developer can use skills from day 1 to understand the codebase

## Chapter 5: Resistance and Failures

### Human Resistance

Not everyone was enthusiastic at first:

**"It will replace us"** — The classic fear. I had to explain that Claude doesn't replace developers, it replaces tasks that developers don't enjoy doing. A senior spending 3h/day on code review isn't well utilized. A senior spending 3h/day on architecture design is.

**"Generated code is mediocre"** — True at first. The initial skills produced generic code. We had to iterate on prompts, add context (conventions, examples, existing patterns) to get usable output. It's a 2-3 week investment.

**"I prefer doing it myself"** — The "not invented here" syndrome applied to AI. Some developers took time to trust automated reviews. The key: showing that Claude finds bugs that humans miss.

### Failures

**"auto-fix-bug" skill** — We tried creating a skill that automatically fixes bugs from stacktraces. It worked for simple bugs (NPE, type mismatch) but failed on complex logic bugs. We transformed it into "analyze-bug" that proposes hypotheses rather than fixes.

**Initial overconfidence** — In the first weeks, some developers validated Claude's suggestions without verification. We had a minor incident (an E2E test that passed in CI but hid a false positive). It reminded us that AI is a tool, not an oracle.

**Token costs** — With 6 developers using Claude intensively, the monthly bill is significant. We had to optimize prompts and set usage limits to stay within budget.

## Chapter 6: Lessons Learned

### 1. Start Small, Iterate Fast

Don't launch 25 skills at once. We started with just one (review-pr), fine-tuned it for 2 weeks, then added others one by one. Each skill requires tuning specific to your team's context.

### 2. Context Is King

A generic prompt produces a generic result. Skill quality depends directly on the context you provide:
- Your team's naming conventions
- Examples of existing code
- Your project's architectural patterns
- Common errors to watch for

### 3. Keep Humans in the Loop

Claude doesn't replace human review, it prepares it. The optimal workflow: Claude does a first pass (conventions, tests, edge cases), the human reviewer focuses on business logic and architecture choices.

### 4. Measure, Measure, Measure

Without metrics, it's intuition. We set up a simple dashboard tracking time spent per task category. That's what allowed us to prove ROI and justify the budget.

### 5. Train the Team on Prompting

AI is only as good as the prompt you give it. We organized internal "prompt engineering" sessions so every developer could get the best out of Claude.

## Chapter 7: The Future — Where Are We Headed?

### What We're Preparing

- **Automatic review on every PR**: Claude triggers automatically on every GitLab merge request via webhook
- **Intelligent regression testing**: Claude identifies which tests should run based on modified files
- **Architecture assistant**: a skill that knows the ADR history and can suggest decisions consistent with the past

### My Conviction

We're at the very beginning of the AI revolution in engineering. In 2 years, not using AI in your development workflow will be as anachronistic as not using a linter.

Teams adopting these tools now will have a massive competitive advantage — not because AI is magic, but because it frees humans to do what they do best: think, design, innovate.

AI is not a gimmick. It's a **concrete force multiplier**. And the best time to integrate it is now.

---

*Chetana YIN — February 2026*
*Engineering Manager at DJUST, 25+ Claude Code skills in production.*`

const contentKm = `## សេចក្តីផ្តើម

ក្នុងខែវិច្ឆិកា ២០២៤ ខ្ញុំបានរកឃើញ Claude Code។ ពីរសប្តាហ៍ក្រោយមក ខ្ញុំបានរួមបញ្ចូលវាក្នុង workflow ប្រចាំថ្ងៃរបស់ក្រុមវិស្វករ ៦ នាក់របស់ខ្ញុំនៅ DJUST។ បីខែក្រោយមក ផលិតភាពរបស់យើងលើកិច្ចការដដែលៗបានកើនឡើង ៤០%។

នេះមិនមែនជាអត្ថបទផ្សព្វផ្សាយទេ។ វាជារបាយការណ៍បទពិសោធន៍ពិត — ជាមួយភាពជោគជ័យ ការបរាជ័យ ការប្រឆាំងរបស់មនុស្ស និងមេរៀនដែលបានរៀន — អំពីអ្វីដែលវាមានន័យជាក់ស្តែងក្នុងការរួមបញ្ចូលឧបករណ៍ AI ក្នុងក្រុមវិស្វកម្មដែលដំណើរការក្នុង production។

---

## ជំពូកទី ១៖ បរិបទ — ក្រុមក្រោមសម្ពាធ

### DJUST ក្នុងឆ្នាំ ២០២៤

DJUST គឺជាវេទិកា e-commerce B2B SaaS។ វិសាលភាពរបស់ខ្ញុំក្នុងនាមជា Engineering Manager គ្របដណ្តប់ Order Management System (OMS), Payments និង Cart។ វាជាស្នូលប្រតិបត្តិការរបស់វេទិកា — កន្លែងដែលការបញ្ជាទិញហូរសម្រាប់អតិថិជនដូចជា Franprix, Eiffage (Blueon) និង VEJA។

ក្រុម៖
- វិស្វករ ៦ នាក់ (៤ senior, ២ mid-level)
- Stack៖ Java 17, Spring Boot, PostgreSQL, Elasticsearch, Kubernetes លើ AWS
- ~១៥ Maven modules ដែលពឹងផ្អែកគ្នា
- Releases រៀងរាល់ថ្ងៃព្រហស្បតិ៍
- SLA កិច្ចសន្យាជាមួយអតិថិជន enterprise

### បញ្ហាផលិតភាព

ដោយវិភាគកន្លែងដែលពេលវេលារបស់ក្រុមត្រូវបានចំណាយ ខ្ញុំបានកំណត់គំរូដដែលៗ៖

**៣០% នៃពេលវេលាត្រូវបានប្រើប្រាស់ដោយកិច្ចការដដែលៗដែលមានតម្លៃទាប៖**

- **Code reviews**៖ ២-៣ ម៉ោងក្នុងមួយថ្ងៃសម្រាប់ខ្ញុំក្នុងនាមជា lead technique។ PR នីមួយៗត្រូវការការអានដោយប្រុងប្រយ័ត្ន មតិយោបល់អំពី style ការគ្របដណ្តប់ tests edge cases
- **Tests boilerplate**៖ ការសរសេរ unit tests សម្រាប់ CRUDs, mappers, DTOs — កូដដែលអាចព្យាករណ៍បានប៉ុន្តែចំណាយពេល
- **Briefings deployment**៖ release នីមួយៗត្រូវការឯកសារសង្ខេបនៃការផ្លាស់ប្តូរ ហានិភ័យ rollback plans
- **ការវិភាគ bugs**៖ ស្វែងរកក្នុង logs ផ្គូផ្គង stacktraces ជាមួយកូដ កំណត់ commit ដែលមានកំហុស
- **ឯកសារ**៖ ធ្វើបច្ចុប្បន្នភាព ADRs, runbooks, READMEs បន្ទាប់ពីការផ្លាស់ប្តូរស្ថាបត្យកម្មនីមួយៗ

កិច្ចការទាំងនេះមិនមែនគ្មានប្រយោជន៍ទេ — វាចាំបាច់។ ប៉ុន្តែវា **អាចព្យាករណ៍បាន និងមានរចនាសម្ព័ន្ធ** ដែលធ្វើឱ្យវាល្អឥតខ្ចោះសម្រាប់ស្វ័យប្រវត្តិកម្មដោយ AI។

## ជំពូកទី ២៖ ការរកឃើញ Claude Code

### ផ្លូវមុន Claude Code

មុនពេលមកដល់ Claude Code ខ្ញុំបានស្វែងយល់ឧបករណ៍ AI ផ្សេងទៀត៖

**GitHub Copilot** (៦ ខែ) — Autocompletion មានប្រយោជន៍ប៉ុន្តែមានកម្រិត។
**Zencoder** — ខ្ញុំបានប្រើ Zencoder ដើម្បីជួយផ្ទៀងផ្ទាត់កិច្ចការមួយចំនួន។
**Google Gemini** — ខ្ញុំបានប្រើ Gemini យ៉ាងច្រើនរយៈពេលជាច្រើនខែសម្រាប់ការស្រាវជ្រាវបច្ចេកទេស។

### ហេតុអ្វី Claude Code បានផ្លាស់ប្តូរអ្វីៗទាំងអស់

អ្វីដែលបានបញ្ចុះបញ្ចូលខ្ញុំអំពី Claude Code៖

1. **ការចូលប្រើ codebase ពេញលេញ**៖ Claude Code ឃើញឯកសារគម្រោងទាំងអស់ យល់ស្ថាបត្យកម្ម conventions និង patterns ដែលមានស្រាប់
2. **Skills ផ្ទាល់ខ្លួន**៖ អ្នកអាចបង្កើត prompts ដែលអាចប្រើឡើងវិញដែលរួមបញ្ចូលបរិបទអាជីវកម្ម
3. **ការរួមបញ្ចូល MCP**៖ ការតភ្ជាប់ដើមទៅ Slack, Jira, GitLab, Notion
4. **របៀប agentic**៖ Claude មិនត្រឹមតែស្នើកូដទេ វាអាចប្រតិបត្តិពាក្យបញ្ជា ដំណើរការ tests ផ្ទៀងផ្ទាត់ការ compile

## ជំពូកទី ៣៖ ប្រព័ន្ធអេកូនៃ 25+ Skills

យើងបានរៀបចំ skills របស់យើងជា ៥ ប្រភេទ៖

### 1. Code Quality (៧ skills)
- **review-pr**៖ ការវិភាគ PR ពេញលេញជាមួយការដាក់ពិន្ទុ
- **review-security**៖ សវនកម្មសន្តិសុខ (OWASP top 10)
- **review-perf**៖ ការវិភាគប្រតិបត្តិការ
- **check-conventions**៖ ការផ្ទៀងផ្ទាត់ conventions DJUST
- **suggest-refactor**៖ ការស្នើ refactoring ជាមួយការបកស្រាយ
- **check-api-contract**៖ ការផ្ទៀងផ្ទាត់ភាពឆបគ្នាថយក្រោយ
- **check-migration**៖ ការផ្ទៀងផ្ទាត់ migrations DB

### 2. Testing (៥ skills)
### 3. Deployment & Ops (៥ skills)
### 4. Documentation (៤ skills)
### 5. Productivity (៤+ skills)

### MCP៖ Game-Changer ពិត

អ្វីដែលធ្វើឱ្យ skills ទាំងនេះមានថាមពលពិតប្រាកដគឺការរួមបញ្ចូល MCP (Model Context Protocol)។ Claude ភ្ជាប់ដោយផ្ទាល់ទៅឧបករណ៍របស់យើង៖ GitLab, Jira, Slack, Notion។

## ជំពូកទី ៤៖ លទ្ធផលដែលវាស់វែង

| រង្វាស់ | មុន | ក្រោយ | ភាពខុសគ្នា |
|---------|------|-------|------------|
| ពេលវេលា code review មធ្យម | ៤៥ នាទី | ១៥ នាទី | -៦៧% |
| ពេលវេលាសរសេរ tests | ២ម៉ោង/feature | ៤៥នាទី/feature | -៦៣% |
| ពេលវេលា briefing deployment | ១ម៉ោង៣០ | ២០ នាទី | -៧៨% |
| Bugs រកឃើញក្នុង review | ៣.២/PR | ៥.១/PR | +៥៩% |
| Sprint velocity | ៤២ | ៥៨ | +៣៨% |

### លេខសំខាន់៖ +៤០% ផលិតភាព

លើ **កិច្ចការដដែលៗ** ជាពិសេស ផលិតភាពបានកើនឡើង ៤០%។

## ជំពូកទី ៥៖ ការប្រឆាំង និងការបរាជ័យ

**"វានឹងជំនួសយើង"** — ខ្ញុំត្រូវពន្យល់ថា Claude មិនជំនួសអ្នកអភិវឌ្ឍន៍ទេ វាជំនួសកិច្ចការដែលអ្នកអភិវឌ្ឍន៍មិនចូលចិត្តធ្វើ។

**"កូដដែលបង្កើតមានគុណភាពទាប"** — ពិតនៅដំបូង។ យើងត្រូវធ្វើឡើងវិញលើ prompts បន្ថែមបរិបទ ដើម្បីទទួលបាន output ដែលអាចប្រើបាន។

## ជំពូកទី ៦៖ មេរៀនដែលបានរៀន

1. **ចាប់ផ្តើមតូច ធ្វើឡើងវិញលឿន** — កុំចាប់ផ្តើម 25 skills ក្នុងពេលតែមួយ
2. **បរិបទជាស្តេច** — Prompt ទូទៅផលិតលទ្ធផលទូទៅ
3. **រក្សាមនុស្សក្នុងរង្វង់** — Claude រៀបចំ review មនុស្សផ្តោតលើតក្កវិជ្ជាអាជីវកម្ម
4. **វាស់ វាស់ វាស់** — គ្មាន metrics វាជាការស្មាន
5. **បណ្តុះបណ្តាលក្រុមលើ prompting** — AI ល្អប៉ុណ្ណាក៏ដោយ prompt ដែលអ្នកផ្តល់

## ជំពូកទី ៧៖ អនាគត

យើងស្ថិតនៅដើមដំបូងនៃបដិវត្តន៍ AI ក្នុងវិស្វកម្ម។ ក្នុងរយៈពេល ២ ឆ្នាំ ការមិនប្រើ AI ក្នុង workflow អភិវឌ្ឍន៍របស់អ្នកនឹងហួorg សម័យដូចជាការមិនប្រើ linter។

AI មិនមែនជារឿងលេងទេ។ វាជា **កម្លាំងពង្រីកជាក់ស្តែង**។ ហើយពេលវេលាល្អបំផុតដើម្បីរួមបញ្ចូលវាគឺឥឡូវនេះ។

---

*Chetana YIN — កុម្ភៈ ២០២៦*
*Engineering Manager នៅ DJUST, 25+ Claude Code skills ក្នុង production។*`

async function seedBlogClaudeCode() {
  console.log('🤖 Seeding blog article: Claude Code in Engineering Team...')

  await db.delete(blogPosts).where(eq(blogPosts.slug, 'claude-code-equipe-engineering'))

  await db.insert(blogPosts).values({
    slug: 'claude-code-equipe-engineering',
    titleFr: "Comment j'ai intégré Claude Code dans mon équipe d'engineering",
    titleEn: "How I integrated Claude Code into my engineering team",
    titleKm: "របៀបដែលខ្ញុំបានរួមបញ្ចូល Claude Code ក្នុងក្រុមវិស្វកម្មរបស់ខ្ញុំ",
    contentFr,
    contentEn,
    contentKm,
    excerptFr: "Retour d'expérience sur l'intégration de Claude Code dans une équipe de 6 ingénieurs : 25+ skills personnalisés, +40% de productivité, résistances humaines et leçons apprises.",
    excerptEn: "Experience report on integrating Claude Code into a team of 6 engineers: 25+ custom skills, +40% productivity, human resistance and lessons learned.",
    excerptKm: "របាយការណ៍បទពិសោធន៍លើការរួមបញ្ចូល Claude Code ក្នុងក្រុមវិស្វករ ៦ នាក់៖ 25+ skills ផ្ទាល់ខ្លួន +៤០% ផលិតភាព ការប្រឆាំង និងមេរៀនដែលបានរៀន។",
    tags: ['AI', 'Claude Code', 'Management', 'Productivity', 'MCP'],
    published: true
  })

  console.log('✅ Blog article seeded successfully!')
}

seedBlogClaudeCode().catch(console.error)
