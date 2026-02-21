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

En janvier 2026, au retour de mes vacances, j'ai découvert Claude Code. Quelques semaines plus tard, je commençais à l'intégrer dans le workflow de mon équipe de 5 personnes chez DJUST. On est encore au tout début de l'aventure — c'est frais, c'est récent, et les résultats ne sont pas encore spectaculaires.

Ce n'est pas un article promotionnel. C'est un retour d'expérience honnête — avec les premiers succès, les résistances humaines, les ajustements, et ce qu'on commence à comprendre — sur ce que ça implique concrètement de demander à une équipe d'engineering en production de changer ses habitudes pour intégrer un outil IA.

---

## Chapitre 1 : Le contexte — une équipe sous pression

### DJUST en 2024

DJUST est une plateforme e-commerce B2B SaaS. Mon périmètre en tant qu'Engineering Manager couvre l'Order Management System (OMS), les Payments et le Cart. C'est le cœur transactionnel de la plateforme — là où passent les commandes de clients comme Franprix, Eiffage (Blueon) ou VEJA.

L'équipe :
- 5 personnes : 2 développeurs seniors, 1 mid-level, 1 junior, et 1 QA senior
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

### 2. Testing & QA (7 skills)

C'est la catégorie qui a le plus d'impact — et c'est notre QA senior qui en tire le plus de valeur. Avant Claude, elle passait des heures à rédiger des cas de test manuellement. Maintenant, elle utilise Claude pour générer une première matrice de tests qu'elle affine ensuite.

- **generate-unit-tests** : génération de tests unitaires pour une classe
- **generate-e2e-test** : génération de scénarios E2E à partir d'un ticket Jira
- **generate-test-data** : création de fixtures réalistes
- **analyze-test-coverage** : identification des chemins non testés
- **generate-mutation-tests** : suggestions de tests de mutation
- **generate-test-matrix** : génération d'une matrice de cas de test (nominal, edge cases, erreurs) à partir d'une spec — le skill préféré de notre QA
- **explore-edge-cases** : Claude explore les combinaisons improbables qu'un humain ne penserait pas à tester (valeurs limites, concurrence, encodages exotiques)

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

## Chapitre 4 : Les premiers résultats (honnêtes)

### Ce qu'on observe après quelques semaines

Soyons clairs : on n'a pas encore 3 mois de recul. On est en février 2026, l'intégration a commencé en janvier. Les chiffres qu'on peut donner sont des **premières tendances**, pas des métriques consolidées.

Ce qu'on observe concrètement :

| Tâche | Avant | Maintenant | Ressenti |
|-------|-------|------------|----------|
| Code review (première passe) | 45 min | ~20 min | Gain réel, Claude pré-mâche le travail |
| Tests boilerplate | 2h/feature | ~1h | Gain variable selon la complexité |
| Briefing MEP | 1h30 | ~30 min | Bon gain, le template est fiable |
| Analyse de bug | Variable | Variable | Parfois bluffant, parfois à côté |

### Ce qui marche vraiment

- **Les code reviews assistées** : le gain est le plus clair. Claude détecte des choses que la fatigue cognitive nous fait rater
- **La génération de tests** : pour les CRUDs et le boilerplate, c'est un vrai time-saver
- **Les briefings de MEP** : le skill produit un document structuré en 30 secondes
- **La QA** : c'est la surprise. Notre QA senior utilise Claude pour générer des matrices de tests à partir des specs Jira. Elle produit en 10 minutes ce qui prenait 2 heures. Et surtout, Claude trouve des edge cases auxquels personne n'aurait pensé — des combinaisons de données exotiques, des scénarios de concurrence, des cas limites sur les encodages. Elle dit que c'est "comme avoir un junior QA infatigable qui pose des questions stupides brillantes"

### Ce qui ne marche pas encore

- **L'analyse de bugs complexes** : Claude est bon sur les NPE évidentes, mais sur les bugs de logique métier, il tâtonne autant que nous
- **La vélocité globale** : on ne peut pas honnêtement dire "+40% de productivité". C'est plus nuancé — certaines tâches sont 3x plus rapides, d'autres ne changent pas
- **L'adoption n'est pas uniforme** : sur 5 personnes, les 2 seniors et moi l'utilisons quotidiennement, le mid-level commence à accrocher, le junior a été une vraie surprise — il a directement créé plein de skills et voulu tout automatiser, c'est un excellent élément qui mériterait d'aller plus haut, et la QA senior — ironiquement — est celle qui en tire le plus de valeur immédiate (génération de cas de test, exploration de scénarios edge case)

### Le vrai impact : le temps libéré

Le gain le plus concret n'est pas un pourcentage. C'est que **je passe moins de temps sur les reviews mécaniques et plus sur l'architecture et le mentoring**. Et ça, c'est précieux pour un Engineering Manager.

## Chapitre 5 : Les résistances et les échecs

### La résistance humaine

Pas tout le monde était enthousiaste au départ :

**"Ça va nous remplacer"** — La crainte classique. J'ai dû expliquer que Claude ne remplace pas les développeurs, il remplace les tâches que les développeurs n'aiment pas faire. Un senior qui passe 3h par jour en code review n'est pas bien utilisé. Un senior qui passe 3h par jour en conception d'architecture, si.

**"Le code généré est médiocre"** — Vrai au début. Les premiers skills produisaient du code générique. Il a fallu itérer sur les prompts, ajouter du contexte (conventions, exemples, patterns existants) pour obtenir un output utilisable. C'est un investissement de 2-3 semaines.

**"Je préfère le faire moi-même"** — Le syndrome du "not invented here" appliqué à l'IA. Certains développeurs ont mis du temps à faire confiance aux reviews automatisées. La clé : montrer que Claude trouve des bugs que les humains manquent.

### Les échecs

**Skill "auto-fix-bug"** — On a essayé de créer un skill qui fixe automatiquement les bugs à partir des stacktraces. Ça marchait pour les bugs simples (NPE, type mismatch) mais échouait sur les bugs logiques complexes. On l'a transformé en "analyze-bug" qui propose des hypothèses plutôt que des fixes.

**Sur-confiance initiale** — Les premières semaines, certains développeurs validaient les suggestions de Claude sans vérification. On a eu un incident mineur (un test E2E qui passait en CI mais cachait un faux positif). Ça nous a rappelé que l'IA est un outil, pas un oracle.

**Coût des tokens** — La facture mensuelle est significative. On a dû optimiser les prompts et mettre en place des limites d'usage pour rester dans le budget.

### Le paradoxe de l'IA pour les profils en formation

C'est la question qui me travaille le plus en tant que manager. Mon junior et mon mid-level produisent plus de code, plus vite, avec moins de bugs. Sur le papier, c'est un succès. Mais en creusant, je me demande : **est-ce qu'ils apprennent autant ?**

Quand j'étais junior, je passais des heures à debugger un NPE. C'était frustrant, mais c'est comme ça que j'ai compris en profondeur le cycle de vie des objets Java. Aujourd'hui, mon junior tape un prompt et Claude lui donne la solution en 30 secondes. Il livre plus vite, mais a-t-il vraiment compris pourquoi ça marchait pas ?

Mon mid-level utilise Claude pour écrire des tests qu'il n'aurait jamais écrits seul. Les tests sont bons. Mais est-ce qu'il a intériorisé les patterns de test, ou est-ce qu'il dépend de Claude pour ça ?

**Je n'ai pas la réponse.** Ce que je fais en attendant :
- Je demande au junior de m'**expliquer** le code que Claude a généré avant de le valider. Si tu ne peux pas l'expliquer, tu ne peux pas le committer
- J'organise des sessions de **live coding sans IA** pour garder les fondamentaux
- Je valorise la **compréhension** autant que la **livraison** dans mes évaluations

C'est peut-être la question la plus importante de cette décennie pour les Engineering Managers : **comment former des développeurs solides dans un monde où l'IA écrit du code à leur place ?** Je n'ai pas de réponse définitive, mais j'y réfléchis chaque jour.

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

### Ma conviction (humble)

On est au tout début. C'est excitant et frustrant à la fois. L'IA n'est pas magique — elle ne transforme pas une équipe du jour au lendemain. Il faut investir du temps, convaincre, itérer, et accepter que certains collègues ne seront pas convaincus tout de suite.

Mais je suis convaincu que les équipes qui expérimentent maintenant, même imparfaitement, auront une longueur d'avance. Pas parce que l'IA remplace les développeurs, mais parce qu'elle **libère du temps pour le travail qui compte** : penser, concevoir, mentorer.

C'est encore le début. On verra dans 6 mois si les promesses se confirment. En attendant, on continue à itérer — une skill à la fois.

---

*Chetana YIN — Février 2026*
*Engineering Manager chez DJUST, 25+ skills Claude Code en production.*`

const contentEn = `## Introduction

In January 2026, right after coming back from vacation, I discovered Claude Code. A few weeks later, I started integrating it into my team's workflow of 5 people at DJUST. We're still at the very beginning of this journey — it's fresh, it's recent, and the results aren't spectacular yet.

This isn't a promotional article. It's an honest experience report — with early wins, human resistance, adjustments, and what we're starting to understand — about what it concretely means to ask an engineering team in production to change their habits and integrate an AI tool.

---

## Chapter 1: The Context — A Team Under Pressure

### DJUST in 2024

DJUST is a B2B SaaS e-commerce platform. My scope as Engineering Manager covers the Order Management System (OMS), Payments, and Cart. It's the transactional core of the platform — where orders flow for clients like Franprix, Eiffage (Blueon), and VEJA.

The team:
- 5 people: 2 senior developers, 1 mid-level, 1 junior, and 1 senior QA
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

### 2. Testing & QA (7 skills)

This is the category with the most impact — and it's our senior QA who gets the most value. Before Claude, she spent hours writing test cases manually. Now she uses Claude to generate a first test matrix that she refines.

- **generate-unit-tests**: unit test generation for a class
- **generate-e2e-test**: E2E scenario generation from a Jira ticket
- **generate-test-data**: realistic fixture creation
- **analyze-test-coverage**: identification of untested paths
- **generate-mutation-tests**: mutation test suggestions
- **generate-test-matrix**: test case matrix generation (nominal, edge cases, errors) from a spec — our QA's favorite skill
- **explore-edge-cases**: Claude explores unlikely combinations a human wouldn't think to test (boundary values, concurrency, exotic encodings)

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

## Chapter 4: Early Results (Honest)

### What We're Seeing After a Few Weeks

Let's be clear: we don't have 3 months of data yet. It's February 2026, integration started in January. The numbers we can share are **early trends**, not consolidated metrics.

What we're concretely observing:

| Task | Before | Now | Feeling |
|------|--------|-----|---------|
| Code review (first pass) | 45 min | ~20 min | Real gain, Claude pre-chews the work |
| Boilerplate tests | 2h/feature | ~1h | Variable gain depending on complexity |
| Deployment briefing | 1h30 | ~30 min | Good gain, template is reliable |
| Bug analysis | Variable | Variable | Sometimes amazing, sometimes off |

### What's Actually Working

- **Assisted code reviews**: the clearest gain. Claude catches things that cognitive fatigue makes us miss
- **Test generation**: for CRUDs and boilerplate, it's a real time-saver
- **Deployment briefings**: the skill produces a structured document in 30 seconds
- **QA**: this is the surprise. Our senior QA uses Claude to generate test matrices from Jira specs. She produces in 10 minutes what used to take 2 hours. And above all, Claude finds edge cases nobody would have thought of — exotic data combinations, concurrency scenarios, encoding boundary cases. She says it's "like having a tireless junior QA who asks brilliantly stupid questions"

### What's Not Working Yet

- **Complex bug analysis**: Claude is good on obvious NPEs, but on business logic bugs, it fumbles as much as we do
- **Overall velocity**: we can't honestly claim "+40% productivity." It's more nuanced — some tasks are 3x faster, others don't change
- **Adoption isn't uniform**: out of 5 people, the 2 seniors and I use it daily, the mid-level is starting to get hooked, the junior was a real surprise — he immediately created tons of skills and wanted to automate everything, he's an excellent talent who deserves to go higher, and the senior QA — ironically — is the one getting the most immediate value (test case generation, edge case scenario exploration)

### The Real Impact: Freed Time

The most concrete gain isn't a percentage. It's that **I spend less time on mechanical reviews and more on architecture and mentoring**. And that's invaluable for an Engineering Manager.

## Chapter 5: Resistance and Failures

### Human Resistance

Not everyone was enthusiastic at first:

**"It will replace us"** — The classic fear. I had to explain that Claude doesn't replace developers, it replaces tasks that developers don't enjoy doing. A senior spending 3h/day on code review isn't well utilized. A senior spending 3h/day on architecture design is.

**"Generated code is mediocre"** — True at first. The initial skills produced generic code. We had to iterate on prompts, add context (conventions, examples, existing patterns) to get usable output. It's a 2-3 week investment.

**"I prefer doing it myself"** — The "not invented here" syndrome applied to AI. Some developers took time to trust automated reviews. The key: showing that Claude finds bugs that humans miss.

### Failures

**"auto-fix-bug" skill** — We tried creating a skill that automatically fixes bugs from stacktraces. It worked for simple bugs (NPE, type mismatch) but failed on complex logic bugs. We transformed it into "analyze-bug" that proposes hypotheses rather than fixes.

**Initial overconfidence** — In the first weeks, some developers validated Claude's suggestions without verification. We had a minor incident (an E2E test that passed in CI but hid a false positive). It reminded us that AI is a tool, not an oracle.

**Token costs** — The monthly bill is significant. We had to optimize prompts and set usage limits to stay within budget.

### The AI Paradox for Junior/Mid Developers

This is the question that weighs on me most as a manager. My junior and mid-level developers produce more code, faster, with fewer bugs. On paper, it's a success. But digging deeper, I wonder: **are they learning as much?**

When I was a junior, I spent hours debugging an NPE. It was frustrating, but that's how I deeply understood Java object lifecycle. Today, my junior types a prompt and Claude gives him the solution in 30 seconds. He ships faster, but did he really understand why it wasn't working?

My mid-level uses Claude to write tests he would never have written alone. The tests are good. But has he internalized the testing patterns, or does he depend on Claude for that?

**I don't have the answer.** What I'm doing in the meantime:
- I ask the junior to **explain** the code Claude generated before validating it. If you can't explain it, you can't commit it
- I organize **live coding sessions without AI** to keep fundamentals sharp
- I value **understanding** as much as **delivery** in my evaluations

This might be the most important question of this decade for Engineering Managers: **how do you train solid developers in a world where AI writes code for them?** I don't have a definitive answer, but I think about it every day.

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

### My Conviction (Humble)

We're at the very beginning. It's exciting and frustrating at the same time. AI isn't magic — it doesn't transform a team overnight. You need to invest time, convince people, iterate, and accept that some colleagues won't be convinced right away.

But I'm convinced that teams experimenting now, even imperfectly, will have a head start. Not because AI replaces developers, but because it **frees time for the work that matters**: thinking, designing, mentoring.

It's still early days. We'll see in 6 months if the promises hold up. In the meantime, we keep iterating — one skill at a time.

---

*Chetana YIN — February 2026*
*Engineering Manager at DJUST, 25+ Claude Code skills in production.*`

const contentKm = `## សេចក្តីផ្តើម

ក្នុងខែមករា ២០២៦ បន្ទាប់ពីវិស្សមកាល ខ្ញុំបានរកឃើញ Claude Code។ ជាការចាប់ផ្តើមថ្មី ខ្ញុំកំពុងរួមបញ្ចូលវាក្នុង workflow របស់ក្រុម។ យើងស្ថិតនៅដំបូងនៃការផ្សងផ្រាសនេះ។

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
    excerptFr: "Retour d'expérience honnête sur l'intégration de Claude Code dans une équipe de 5 personnes : premiers résultats après quelques semaines, résistances humaines, et ce qu'on commence à comprendre.",
    excerptEn: "Honest experience report on integrating Claude Code into a team of 5: early results after a few weeks, human resistance, and what we're starting to understand.",
    excerptKm: "របាយការណ៍បទពិសោធន៍លើការរួមបញ្ចូល Claude Code ក្នុងក្រុមវិស្វករ ៦ នាក់៖ 25+ skills ផ្ទាល់ខ្លួន +៤០% ផលិតភាព ការប្រឆាំង និងមេរៀនដែលបានរៀន។",
    tags: ['AI', 'Claude Code', 'Management', 'Productivity', 'MCP'],
    published: true
  })

  console.log('✅ Blog article seeded successfully!')
}

seedBlogClaudeCode().catch(console.error)
