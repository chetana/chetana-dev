/**
 * seed-cv.ts — Upsert intelligent des experiences et skills.
 * - Compare par company+dateStart (experiences) et category+name (skills)
 * - Ajoute les nouvelles entrées, met à jour celles qui existent
 * - Ne supprime RIEN
 * - Ne touche PAS aux autres tables (blog_posts, comments, projects, users, etc.)
 */
import { neon } from '@neondatabase/serverless'
import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import { experiences, skills, projects } from './schema'
import { eq, and } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

// Neon (dev, HTTP driver) vs Scaleway Serverless SQL / autre Postgres (prod, node-postgres).
const databaseUrl = process.env.DATABASE_URL!
const db = databaseUrl.includes('neon.tech')
  ? drizzleNeon(neon(databaseUrl))
  : drizzlePg(new Pool({ connectionString: databaseUrl }))

// ── Data ──────────────────────────────────────────────────────────────────

const experiencesData = [
  {
    company: 'DJUST',
    roleFr: 'Engineering Manager — de l\'OMS au Sales Copilot (IA)',
    roleEn: 'Engineering Manager — from OMS to Sales Copilot (AI)',
    roleKm: 'Engineering Manager — ពី OMS ដល់ Sales Copilot (IA)',
    dateStart: '2023-11',
    dateEnd: null,
    location: 'Paris',
    bulletsFr: [
      "<strong>2023-2026 — Engineering Manager, équipe OMS</strong> (5 personnes : devs + QA) : recrutement, 1:1, performance reviews, montée en compétences — une expérience structurante qui a façonné ma façon de manager et de piloter un produit, entre business value (avant-ventes techniques grands comptes B2B, arbitrages make vs. buy) et rigueur technique",
      "API governance automation : spec OpenAPI avant le code (API-first design), CI de validation de contrat, détection automatisée de breaking changes via MCP avant merge",
      "Performance engineering : résolution N+1 sur les mises à jour de commandes en masse — réduction de 61% du temps de réponse (batch processing, IN query, EnumMap UUID) ; load testing k6 + Grafana Cloud sur les workflows critiques (checkout, search, cart)",
      "Architecture PSP : consolidation sur Adyen pour paiements classiques et marketplace (split interne) — décision issue d'une analyse réglementaire, partenariale et business",
      "Incident management : gestion d'un incident OOM en production (fetch collections Hibernate sur exports massifs, storm de retries, Flyway lock orphelin) — root cause analysis, coordination du fix, déploiement hotfix d'urgence ; pilotage des MEP hebdomadaires, production support, coordination Back/FOC et équipes Catalog, Infra, Intégration",
      "AI-augmented development (équipe OMS) : 63 custom skills Claude Code, 9 sous-agents spécialisés, 11 hooks, 15 MCP servers, workspace AI versionné sur GitHub, 6/6 membres formés — +40% productivité sur reviews et tests",
      "<strong>Stack IA locale souveraine</strong> : Ollama + qwen2.5-coder:7b sur AMD Ryzen AI 9 HX PRO 370 (GPU Radeon 890M RDNA3 + NPU XDNA2) — 100% GPU inference, zéro cloud, zéro token externe, zéro latence réseau ; nomic-embed-text pour embeddings sémantiques locaux",
      "<strong>Quality gate hybride post-commit</strong> : hook multi-langage (Java, Python, JavaScript/k6) sur 10 repos — grep déterministe + LLM local (violations sémantiques) — détection en < 5s",
      "<strong>Outillage CLI local basé sur LLM</strong> : gcm (commit messages depuis git diff), dlogs (pré-filtre logs Spring Boot, 62k lignes → résumé en 10s), dsql (optimiseur SQL PostgreSQL), dtest (générateur squelettes tests), Continue.dev (complétion inline sur Ollama local)",
      "<strong>Depuis juin 2026 — pivot vers Sales Copilot (djust-sales)</strong> : je reste EM, désormais d'une équipe IA plus resserrée et dédiée à 100% à ce produit, avec un retour à un rôle plus hands-on / tech lead — ~8 MR/semaine en moyenne, alpha lancée le 19/06 avec 6 testeurs",
      "Architecture et développement full-stack sur le copilot : Python (FastAPI, LangGraph, SQLAlchemy async), PostgreSQL avec RLS, Nuxt 3/Vue, SSE streaming, Kubernetes/ArgoCD",
      "Pipelines LLM multi-étapes : import intelligent multi-format (CSV, email, chat) avec HITL (Human-in-the-Loop), recherche vectorielle pgvector, seed beta-testeurs",
      "Observabilité LLM : intégration Langfuse + OpenTelemetry sur toutes les surfaces IA — tracking tokens, coûts, latences et sessions unifiées copilot/engine ; dashboard Grafana dédié à l'ingestion e-mail",
      "Sécurité multi-tenant : durcissement fail-closed de l'isolation RLS jusqu'en production — y compris le scoping des tables de checkpoint LangGraph (persistance des conversations copilot) ; auth Logto multi-organisation (webhooks, provisioning, OAuth2)",
      "Pilotage de l'épic <strong>Multi-user par tenant</strong> (priorité Highest) : invitation, affectation de rôles, visibilité croisée, gestion de session multi-utilisateur sur un même poste",
      "Fiabilisation du pipeline <strong>extraction ↔ matching</strong> piloté par un harness d'évaluation (golds par entité, scoring compte/contact/adresse) — élimination des faux positifs de cache de correspondance produit",
      "Analytics & feedback : widget utilisateur permanent avec SDK custom pour retours continus en production ; process de release durci (répétition générale du rollback en préprod avant chaque MEP) et délégation outillée de tâches à faible valeur (création de tickets Jira via Claude)"
    ],
    bulletsEn: [
      "<strong>2023-2026 — Engineering Manager, OMS team</strong> (5 people: devs + QA): hiring, 1:1s, performance reviews, skill development — a formative experience that shaped how I manage and drive a product, balancing business value (technical pre-sales for major B2B accounts, make vs. buy decisions) with technical rigor",
      "API governance automation: OpenAPI spec before code (API-first design), contract validation CI, automated breaking change detection via MCP before merge",
      "Performance optimization: resolved N+1 query on bulk order updates — 61% response time reduction (batch processing, IN query, EnumMap UUID); k6 + Grafana Cloud load testing on critical workflows (checkout, search, cart)",
      "PSP architecture: consolidated on Adyen for classic payments and marketplace (internal split) — decision driven by regulatory, partnership and business analysis",
      "Production incident management: handled OOM incident caused by Hibernate collection fetch on massive exports (retry storm, orphan Flyway lock) — root cause analysis, fix coordination, emergency hotfix deployment; weekly production releases, production support, Back/FOC and cross-team coordination",
      "AI-augmented development (OMS team): 63 custom Claude Code skills, 9 specialized sub-agents, 11 hooks, 15 MCP servers, versioned AI workspace on GitHub, 6/6 team members trained — +40% productivity on reviews and tests",
      "<strong>Sovereign local AI stack</strong>: Ollama + qwen2.5-coder:7b on AMD Ryzen AI 9 HX PRO 370 (GPU Radeon 890M RDNA3 + NPU XDNA2) — 100% GPU inference, zero cloud, zero external tokens, zero network latency; nomic-embed-text for local semantic embeddings",
      "<strong>Hybrid post-commit quality gate</strong>: multi-language hook (Java, Python, JavaScript/k6) across 10 repos — deterministic grep + local LLM (semantic violations) — detection in < 5s",
      "<strong>LLM-powered local CLI tooling</strong>: gcm (commit messages from git diff), dlogs (Spring Boot log pre-filter, 62k lines → summary in 10s), dsql (PostgreSQL SQL optimizer), dtest (test skeleton generator), Continue.dev (inline completion on local Ollama)",
      "<strong>Since June 2026 — pivot to Sales Copilot (djust-sales)</strong>: still an EM, now of a smaller AI team dedicated 100% to this product, with a return to a more hands-on / tech lead role — ~8 MRs/week on average, alpha launched 06/19 with 6 testers",
      "Full-stack architecture and development on the copilot: Python (FastAPI, LangGraph, SQLAlchemy async), PostgreSQL with RLS, Nuxt 3/Vue, SSE streaming, Kubernetes/ArgoCD",
      "Multi-step LLM pipelines: intelligent multi-format import (CSV, email, chat) with HITL (Human-in-the-Loop), pgvector semantic search, beta-tester seeding",
      "LLM observability: Langfuse + OpenTelemetry integration on all AI surfaces — token tracking, cost monitoring, latency, copilot/engine session unification; Grafana dashboard dedicated to email ingestion",
      "Multi-tenant security: hardened RLS isolation to fail-closed all the way to production — including RLS scoping of LangGraph checkpoint tables (copilot conversation persistence); Logto multi-organisation auth (webhooks, provisioning, OAuth2)",
      "Drove the <strong>multi-user per tenant</strong> epic (Highest priority): invitation, role assignment, cross-visibility, multi-user session handling on a shared workstation",
      "Hardened the <strong>extraction ↔ matching</strong> pipeline via an evaluation harness (per-entity golds, account/contact/address scoring) — eliminated false positives from the product-match cache",
      "Analytics & feedback: permanent user feedback widget with custom SDK for continuous production feedback; hardened release process (rollback dry-run on staging before every production release) and tooled delegation of low-value tasks (Jira ticket creation via Claude)"
    ],
    bulletsKm: [
      "<strong>2023-2026 — Engineering Manager ក្រុម OMS</strong> (៥ នាក់៖ devs + QA)៖ ការជ្រើសរើស 1:1 ការវាយតម្លៃ ការអភិវឌ្ឍជំនាញ — បទពិសោធន៍ដ៏សំខាន់ដែលបានបង្កើតរបៀបគ្រប់គ្រង និងដឹកនាំផលិតផលរបស់ខ្ញុំ",
      "API governance automation៖ OpenAPI spec មុនកូដ (API-first design) CI ផ្ទៀងផ្ទាត់កិច្ចសន្យា ការរកឃើញ breaking changes ដោយស្វ័យប្រវត្តិតាម MCP មុន merge",
      "Performance engineering៖ ដោះស្រាយ N+1 query — កាត់បន្ថយ 61% នៃពេលវេលាឆ្លើយតប ; load testing k6 + Grafana Cloud",
      "ស្ថាបត្យកម្ម PSP៖ បង្រួបបង្រួមនៅ Adyen សម្រាប់ការទូទាត់ទូទៅ និង marketplace",
      "ការគ្រប់គ្រង incidents៖ ដោះស្រាយ OOM ក្នុង production — root cause analysis hotfix ; ដឹកនាំ releases ប្រចាំសប្តាហ៍ production support",
      "AI-augmented development (ក្រុម OMS)៖ 63 custom skills 9 sous-agents 11 hooks 15 MCP servers workspace AI versioned នៅ GitHub 6/6 សមាជិកបានបណ្តុះបណ្តាល — +40% ផលិតភាព",
      "<strong>Stack IA មូលដ្ឋានអធិបតេយ្យ</strong>៖ Ollama + qwen2.5-coder:7b នៅលើ AMD Ryzen AI 9 — 100% GPU inference សូន្យ cloud",
      "<strong>Quality gate កូនកាត់ post-commit</strong>៖ hook ពហុភាសា លើ 10 repos — grep + LLM មូលដ្ឋាន — រកឃើញក្នុង < 5s",
      "<strong>ឧបករណ៍ CLI មូលដ្ឋានផ្អែកលើ LLM</strong>៖ gcm dlogs dsql dtest Continue.dev",
      "<strong>ចាប់ពីខែមិថុនា 2026 — ផ្លាស់ប្តូរទៅ Sales Copilot (djust-sales)</strong>៖ នៅតែជា EM ប៉ុន្តែក្រុម IA តូចជាង ដែលឧទ្ទិសទាំងស្រុងចំពោះផលិតផលនេះ ជាមួយតួនាទី hands-on / tech lead ច្រើនជាងមុន",
      "ស្ថាបត្យកម្ម និងអភិវឌ្ឍ full-stack លើ copilot៖ Python (FastAPI, LangGraph, SQLAlchemy async) PostgreSQL ជាមួយ RLS Nuxt 3/Vue SSE streaming Kubernetes/ArgoCD",
      "Pipelines LLM ច្រើនដំណាក់កាល៖ import ឆ្លាតវៃពហុទ្រង់ទ្រាយ (CSV email chat) ជាមួយ HITL ស្វែងរក pgvector",
      "Observability LLM៖ Langfuse + OpenTelemetry លើផ្ទៃ IA ទាំងអស់ បន្ថែម dashboard Grafana សម្រាប់ email",
      "សុវត្ថិភាព multi-tenant៖ ពង្រឹង RLS ដល់ fail-closed រហូតដល់ production រួមទាំង checkpoint LangGraph ; auth Logto ពហុអង្គភាព",
      "ដឹកនាំ epic <strong>Multi-user per tenant</strong> (Highest)៖ invitation ការចាត់តាំងតួនាទី visibility",
      "ពង្រឹង pipeline <strong>extraction ↔ matching</strong> ដោយ harness វាយតម្លៃ — លុបបំបាត់ false positives",
      "Widget feedback អ្នកប្រើប្រាស់ ជាមួយ SDK custom ពង្រឹងដំណើរការ release (rollback dry-run) និងប្រគល់ភារកិច្ចតម្លៃទាបទៅ Claude"
    ],
    sortOrder: 1
  },
  {
    company: 'DJUST (via Takima)', roleFr: 'Lead Software Engineer', roleEn: 'Lead Software Engineer', roleKm: 'Lead Software Engineer',
    dateStart: '2021-10', dateEnd: '2023-11', location: 'Paris',
    bulletsFr: ["Conception et développement de la plateforme e-commerce B2B from scratch", "Architecture multi-tenant, multi-PSP (Adyen, Mangopay, Lemonway, Thunes)", "Stack : Java 17, Spring Boot, PostgreSQL, Elasticsearch, Keycloak, Docker, GCP", "Mise en place du CI/CD GitLab, des tests E2E, et des conventions de code"],
    bulletsEn: ["Designed and built the B2B e-commerce platform from scratch", "Multi-tenant, multi-PSP architecture (Adyen, Mangopay, Lemonway, Thunes)", "Stack: Java 17, Spring Boot, PostgreSQL, Elasticsearch, Keycloak, Docker, GCP", "Set up GitLab CI/CD, E2E tests, and coding conventions"],
    bulletsKm: ["រចនា និងបង្កើតវេទិកា e-commerce B2B ពីដំបូង", "ស្ថាបត្យកម្ម multi-tenant multi-PSP (Adyen, Mangopay, Lemonway, Thunes)", "Stack៖ Java 17, Spring Boot, PostgreSQL, Elasticsearch, Keycloak, Docker, GCP", "ដំឡើង GitLab CI/CD tests E2E និងស្តង់ដារកូដ"],
    sortOrder: 2
  },
  {
    company: 'Galeries Lafayette (via Takima)', roleFr: 'Ingénieur Full Stack Java', roleEn: 'Full Stack Java Engineer', roleKm: 'វិស្វករ Full Stack Java',
    dateStart: '2018-06', dateEnd: '2021-09', location: 'Paris',
    bulletsFr: ["<strong>Gestion de production & Référent technique</strong> (2019-2021) : responsable de la production du tunnel d'achat, référent technique équipe, gestion du monolithe Hybris (Java 7) et des API Java 8, déploiements Jenkins/Ansible, méthodologie SAFe", "<strong>Produit / Recherche / E-merchandising</strong> (2019) : migration moteur de recherche Hybris vers Algolia, conception d'une API GraphQL, architecture hexagonale, practice Example Mapping", "<strong>Tunnel d'achat</strong> (2018) : développement du checkout flow e-commerce à fort trafic (panier, livraison, paiement, marketplace, carte cadeau, refonte UX)"],
    bulletsEn: ["<strong>Production Management & Tech Lead</strong> (2019-2021): responsible for checkout production, team technical referent, managed Hybris monolith (Java 7) and Java 8 APIs, Jenkins/Ansible deployments, SAFe methodology", "<strong>Product / Search / E-merchandising</strong> (2019): migrated search engine from Hybris to Algolia, designed a GraphQL API, hexagonal architecture, Example Mapping practice", "<strong>Checkout flow</strong> (2018): developed high-traffic e-commerce checkout (cart, shipping, payment, marketplace, gift cards, UX redesign)"],
    bulletsKm: ["<strong>ការគ្រប់គ្រង production និង Référent technique</strong> (2019-2021)៖ ទទួលខុសត្រូវលើ production នៃ checkout referent technique ក្រុម គ្រប់គ្រង Hybris monolith (Java 7) និង API Java 8 deployments Jenkins/Ansible វិធីសាស្ត្រ SAFe", "<strong>ផលិតផល / ស្វែងរក / E-merchandising</strong> (2019)៖ ផ្លាស់ប្តូរម៉ាស៊ីនស្វែងរកពី Hybris ទៅ Algolia រចនា API GraphQL ស្ថាបត្យកម្មគោលប្រាំមុខ practice Example Mapping", "<strong>លំហូរ Checkout</strong> (2018)៖ អភិវឌ្ឍ checkout e-commerce ចរាចរខ្ពស់ (រទេះ ការដឹកជញ្ជូន ការទូទាត់ marketplace កាតអំណោយ ការរចនា UX ឡើងវិញ)"],
    sortOrder: 3
  },
  {
    company: 'INFOTEL (pour Groupe Burrus / DiOT)', roleFr: 'Ingénieur logiciels Java', roleEn: 'Java Software Engineer', roleKm: 'វិស្វករកម្មវិធី Java',
    dateStart: '2016-06', dateEnd: '2018-04', location: 'Paris',
    bulletsFr: ["<strong>Projet SAFE</strong> : application de gestion de flottes (EDF, Fnac-Darty) et plateforme assurance DARVA", "Conception et développement avec BPMN 2.0 (Activiti), moteur de règles Drools, SOAP", "Stack : Java, Spring, Hibernate, PostgreSQL, Vaadin, Activiti, Drools"],
    bulletsEn: ["<strong>SAFE Project</strong>: fleet management application (EDF, Fnac-Darty) and DARVA insurance platform", "Design and development with BPMN 2.0 (Activiti), Drools rules engine, SOAP", "Stack: Java, Spring, Hibernate, PostgreSQL, Vaadin, Activiti, Drools"],
    bulletsKm: ["<strong>គម្រោង SAFE</strong>៖ កម្មវិធីគ្រប់គ្រងកងយានយន្ត (EDF, Fnac-Darty) និងវេទិកាធានារ៉ាប់រង DARVA", "រចនា និងអភិវឌ្ឍជាមួយ BPMN 2.0 (Activiti) ម៉ាស៊ីនច្បាប់ Drools SOAP", "Stack៖ Java, Spring, Hibernate, PostgreSQL, Vaadin, Activiti, Drools"],
    sortOrder: 4
  },
  {
    company: 'INFOTEL (pour BNP Paribas)', roleFr: 'Ingénieur mobile', roleEn: 'Mobile Engineer', roleKm: 'វិស្វករ Mobile',
    dateStart: '2015-10', dateEnd: '2016-06', location: 'Bagnolet',
    bulletsFr: ["Maintenance et évolution de l'application bancaire \"Mes comptes\" (Android Java)", "POC application hybride multi-plateforme (Android/iOS/Windows)", "Formation iOS/Swift dispensée par Apple"],
    bulletsEn: ["Maintenance and development of the \"Mes comptes\" banking app (Android Java)", "Hybrid multi-platform application POC (Android/iOS/Windows)", "iOS/Swift training by Apple"],
    bulletsKm: ["ថែទាំ និងអភិវឌ្ឍកម្មវិធីធនាគារ \"Mes comptes\" (Android Java)", "POC កម្មវិធីកូនកាត់ multi-platform (Android/iOS/Windows)", "វគ្គបណ្តុះបណ្តាល iOS/Swift ដោយ Apple"],
    sortOrder: 5
  },
  {
    company: 'miLibris', roleFr: 'Ingénieur R&D', roleEn: 'R&D Engineer', roleKm: 'វិស្វករ R&D',
    dateStart: '2012-10', dateEnd: '2015-06', location: 'Paris',
    bulletsFr: ["<strong>Applications Android natives</strong> : développement complet pour des clients presse exigeants, de l'expression du besoin à la publication Play Store", "<strong>Framework hybride iOS/Android</strong> : liseuse numérique avec achats in-app, gestion de bibliothèque, reader interactif", "Startup de presse numérique — autonomie totale sur le cycle de vie mobile"],
    bulletsEn: ["<strong>Native Android Apps</strong>: end-to-end development for demanding press clients, from requirements to Play Store publication", "<strong>Hybrid iOS/Android Framework</strong>: digital reader with in-app purchases, library management, interactive reader", "Digital press startup — full ownership of the mobile lifecycle"],
    bulletsKm: ["<strong>កម្មវិធី Android ដើម</strong>៖ ការអភិវឌ្ឍពេញលេញសម្រាប់អតិថិជនសារព័ត៌មាន ពីតម្រូវការដល់ការបោះពុម្ពផ្សាយ Play Store", "<strong>Framework កូនកាត់ iOS/Android</strong>៖ កម្មវិធីអានឌីជីថលជាមួយការទិញក្នុងកម្មវិធី ការគ្រប់គ្រងបណ្ណាល័យ អ្នកអានអន្តរកម្ម", "Startup សារព័ត៌មានឌីជីថល — ភាពស្វ័យភាពពេញលេញលើវដ្តជីវិត mobile"],
    sortOrder: 6
  }
]

const skillsData = [
  { category: 'Backend', name: 'Java 17', color: 'purple', sortOrder: 1 },
  { category: 'Backend', name: 'Spring Boot', color: 'purple', sortOrder: 2 },
  { category: 'Backend', name: 'Spring Security', color: 'purple', sortOrder: 3 },
  { category: 'Backend', name: 'JPA / Hibernate', color: 'purple', sortOrder: 4 },
  { category: 'Backend', name: 'Maven', color: 'purple', sortOrder: 5 },
  { category: 'Backend', name: 'REST API', color: 'purple', sortOrder: 6 },
  { category: 'Backend', name: 'GraphQL', color: 'purple', sortOrder: 7 },
  { category: 'Backend', name: 'OpenAPI / Swagger', color: 'purple', sortOrder: 8 },
  { category: 'Backend', name: 'API-first design', color: 'purple', sortOrder: 9 },
  { category: 'Backend', name: 'Node.js', color: 'purple', sortOrder: 10 },
  { category: 'Backend', name: 'Rust / Axum', color: 'purple', sortOrder: 11 },
  { category: 'Backend', name: 'Python', color: 'purple', sortOrder: 12 },
  { category: 'Backend', name: 'FastAPI', color: 'purple', sortOrder: 13 },
  { category: 'Backend', name: 'SQLAlchemy (async)', color: 'purple', sortOrder: 14 },
  { category: 'Cloud & Serverless', name: 'GCP (Cloud Run, Cloud Build)', color: 'cyan', sortOrder: 1 },
  { category: 'Cloud & Serverless', name: 'AWS (SQS, S3)', color: 'cyan', sortOrder: 2 },
  { category: 'Cloud & Serverless', name: 'Docker multi-stage', color: 'cyan', sortOrder: 3 },
  { category: 'Cloud & Serverless', name: 'Kubernetes', color: 'cyan', sortOrder: 4 },
  { category: 'Cloud & Serverless', name: 'Serverless containers', color: 'cyan', sortOrder: 5 },
  { category: 'Cloud & Serverless', name: 'gcloud CLI', color: 'cyan', sortOrder: 6 },
  { category: 'Cloud & Serverless', name: 'ArgoCD', color: 'cyan', sortOrder: 7 },
  { category: 'Cloud & Serverless', name: 'Scaleway (Containers, S3, SQL)', color: 'cyan', sortOrder: 8 },
  { category: 'Cloud & Serverless', name: 'Cloud migration / souveraineté', color: 'cyan', sortOrder: 9 },
  { category: 'Cloud & Serverless', name: 'OpenTelemetry', color: 'cyan', sortOrder: 10 },
  { category: 'Data & Infra', name: 'PostgreSQL', color: 'blue', sortOrder: 1 },
  { category: 'Data & Infra', name: 'Elasticsearch', color: 'blue', sortOrder: 2 },
  { category: 'Data & Infra', name: 'MongoDB', color: 'blue', sortOrder: 3 },
  { category: 'Data & Infra', name: 'Redis', color: 'blue', sortOrder: 4 },
  { category: 'Data & Infra', name: 'GitLab CI/CD', color: 'blue', sortOrder: 5 },
  { category: 'Data & Infra', name: 'Jenkins / Ansible', color: 'blue', sortOrder: 6 },
  { category: 'Data & Infra', name: 'Keycloak', color: 'blue', sortOrder: 7 },
  { category: 'Data & Infra', name: 'k6 (load testing)', color: 'blue', sortOrder: 8 },
  { category: 'Data & Infra', name: 'Grafana', color: 'blue', sortOrder: 9 },
  { category: 'Data & Infra', name: 'pgvector', color: 'blue', sortOrder: 10 },
  { category: 'Data & Infra', name: 'Logto (auth)', color: 'blue', sortOrder: 11 },
  { category: 'Data & Infra', name: 'PostHog', color: 'blue', sortOrder: 12 },
  { category: 'Domaine métier', name: 'Order Management (OMS)', color: 'green', sortOrder: 1 },
  { category: 'Domaine métier', name: 'Payments (Adyen, Mangopay)', color: 'green', sortOrder: 2 },
  { category: 'Domaine métier', name: 'Cart & Checkout', color: 'green', sortOrder: 3 },
  { category: 'Domaine métier', name: 'Multi-tenant SaaS', color: 'green', sortOrder: 4 },
  { category: 'Domaine métier', name: 'E-commerce B2B', color: 'green', sortOrder: 5 },
  { category: 'Domaine métier', name: 'Contract testing', color: 'green', sortOrder: 6 },
  { category: 'Domaine métier', name: 'Row-Level Security (RLS)', color: 'green', sortOrder: 7 },
  { category: 'Domaine métier', name: 'LLM Copilot / Extraction & Matching', color: 'green', sortOrder: 8 },
  { category: 'Management', name: 'Team Lead (5 : devs + QA)', color: 'orange', sortOrder: 1 },
  { category: 'Management', name: '1:1 / Performance Reviews', color: 'orange', sortOrder: 2 },
  { category: 'Management', name: 'Hiring', color: 'orange', sortOrder: 3 },
  { category: 'Management', name: 'People management', color: 'orange', sortOrder: 4 },
  { category: 'Management', name: 'Agile / Scrum', color: 'orange', sortOrder: 5 },
  { category: 'Management', name: 'SAFe', color: 'orange', sortOrder: 6 },
  { category: 'Management', name: 'Kanban', color: 'orange', sortOrder: 7 },
  { category: 'Management', name: 'Incident Management / RCA', color: 'orange', sortOrder: 8 },
  { category: 'Management', name: 'Production Support', color: 'orange', sortOrder: 9 },
  { category: 'Frontend', name: 'Nuxt 3', color: 'purple', sortOrder: 1 },
  { category: 'Frontend', name: 'Nuxt 4', color: 'purple', sortOrder: 2 },
  { category: 'Frontend', name: 'Vue.js', color: 'purple', sortOrder: 3 },
  { category: 'Frontend', name: 'SvelteKit / Svelte 5', color: 'purple', sortOrder: 4 },
  { category: 'Frontend', name: 'TypeScript strict', color: 'purple', sortOrder: 5 },
  { category: 'Frontend', name: 'Vite / pnpm', color: 'purple', sortOrder: 6 },
  { category: 'Frontend', name: 'SSR / Core Web Vitals', color: 'purple', sortOrder: 7 },
  { category: 'Mobile', name: 'Android (Kotlin/Java)', color: 'purple', sortOrder: 1 },
  { category: 'Mobile', name: 'iOS (Swift)', color: 'purple', sortOrder: 2 },
  { category: 'AI-Augmented Dev', name: 'Claude Code (63 skills)', color: 'purple', sortOrder: 1 },
  { category: 'AI-Augmented Dev', name: 'MCP (15 servers)', color: 'purple', sortOrder: 2 },
  { category: 'AI-Augmented Dev', name: '9 Sub-agents', color: 'purple', sortOrder: 3 },
  { category: 'AI-Augmented Dev', name: '11 Hooks (djust + perso)', color: 'purple', sortOrder: 4 },
  { category: 'AI-Augmented Dev', name: 'Vertex AI / Gemini', color: 'purple', sortOrder: 5 },
  { category: 'AI-Augmented Dev', name: 'Versioned AI workspace', color: 'purple', sortOrder: 6 },
  { category: 'AI-Augmented Dev', name: 'LangGraph', color: 'purple', sortOrder: 7 },
  { category: 'AI-Augmented Dev', name: 'Langfuse', color: 'purple', sortOrder: 8 },
  { category: 'AI-Augmented Dev', name: 'LLM Pipelines / HITL', color: 'purple', sortOrder: 9 },
  { category: 'Local AI Infrastructure', name: 'Ollama (qwen2.5-coder:7b)', color: 'cyan', sortOrder: 1 },
  { category: 'Local AI Infrastructure', name: 'ChromaDB / vector search', color: 'cyan', sortOrder: 2 },
  { category: 'Local AI Infrastructure', name: 'nomic-embed-text / MiniLM-L6', color: 'cyan', sortOrder: 3 },
  { category: 'Local AI Infrastructure', name: 'Continue.dev (Ollama)', color: 'cyan', sortOrder: 4 },
  { category: 'Local AI Infrastructure', name: 'AMD NPU/GPU inference', color: 'cyan', sortOrder: 5 },
  { category: 'Local AI Infrastructure', name: 'Quality gate hybride', color: 'cyan', sortOrder: 6 },
  { category: 'Local AI Infrastructure', name: 'CLI tools (gcm, dlogs, dsql, dtest)', color: 'cyan', sortOrder: 8 },
]

// ── Upsert logic ──────────────────────────────────────────────────────────

async function seedCV() {
  console.log('📄 Upsert CV data (experiences + skills)...')

  // --- Experiences: match by company + dateStart ---
  let expInserted = 0, expUpdated = 0
  for (const exp of experiencesData) {
    const existing = await db.select().from(experiences)
      .where(and(eq(experiences.company, exp.company), eq(experiences.dateStart, exp.dateStart)))
    if (existing.length > 0) {
      await db.update(experiences)
        .set({ roleFr: exp.roleFr, roleEn: exp.roleEn, roleKm: exp.roleKm, dateEnd: exp.dateEnd, location: exp.location, bulletsFr: exp.bulletsFr, bulletsEn: exp.bulletsEn, bulletsKm: exp.bulletsKm, sortOrder: exp.sortOrder })
        .where(eq(experiences.id, existing[0].id))
      expUpdated++
    } else {
      await db.insert(experiences).values(exp)
      expInserted++
    }
  }
  console.log(`✅ Experiences: ${expInserted} inserted, ${expUpdated} updated`)

  // --- Skills: match by category + name ---
  let skillInserted = 0, skillUpdated = 0
  for (const sk of skillsData) {
    const existing = await db.select().from(skills)
      .where(and(eq(skills.category, sk.category), eq(skills.name, sk.name)))
    if (existing.length > 0) {
      await db.update(skills)
        .set({ color: sk.color, sortOrder: sk.sortOrder })
        .where(eq(skills.id, existing[0].id))
      skillUpdated++
    } else {
      await db.insert(skills).values(sk)
      skillInserted++
    }
  }
  console.log(`✅ Skills: ${skillInserted} inserted, ${skillUpdated} updated`)

  // --- Cleanup: remove skills NOT in the source data ---
  const validKeys = new Set(skillsData.map(s => `${s.category}::${s.name}`))
  const allSkills = await db.select().from(skills)
  const orphans = allSkills.filter(s => !validKeys.has(`${s.category}::${s.name}`))
  if (orphans.length > 0) {
    for (const o of orphans) {
      await db.delete(skills).where(eq(skills.id, o.id))
    }
    console.log(`🗑️  Removed ${orphans.length} obsolete skills: ${orphans.map(o => o.name).join(', ')}`)
  }

  // --- Projects: match by slug ---
  const projectsData = [
    {
      slug: 'chetaku-rs',
      titleFr: 'chetaku-rs — Backend Rust personnel',
      titleEn: 'chetaku-rs — Personal Rust Backend',
      titleKm: 'chetaku-rs — Backend Rust ផ្ទាល់ខ្លួន',
      descriptionFr: "Backend de mon portfolio écrit en Rust (Axum 0.8 + sqlx + Tokio), déployé sur GCP Cloud Run avec base Neon PostgreSQL. Intégrations : Strava API (cyclisme, course, natation), Jikan (anime), RAWG (jeux vidéo), TMDB (films/séries). Frontend Nuxt 4 + TypeScript consommant l'API. Cache intelligent avec TTL 30s en base (stats_cache pattern).",
      descriptionEn: "My portfolio backend written in Rust (Axum 0.8 + sqlx + Tokio), deployed on GCP Cloud Run with Neon PostgreSQL. Integrations: Strava API (cycling, running, swimming), Jikan (anime), RAWG (video games), TMDB (movies/series). Nuxt 4 + TypeScript frontend consuming the API. Smart caching with 30s TTL in database (stats_cache pattern).",
      descriptionKm: 'Backend portfolio របស់ខ្ញុំសរសេរជា Rust (Axum 0.8 + sqlx + Tokio) ដាក់ពង្រាយនៅ GCP Cloud Run ជាមួយ Neon PostgreSQL។ ការរួមបញ្ចូល៖ Strava API Jikan RAWG TMDB។ Frontend Nuxt 4 + TypeScript។',
      tags: ['Rust', 'Axum', 'Tokio', 'PostgreSQL', 'GCP Cloud Run', 'Strava API', 'Jikan', 'RAWG', 'TMDB'],
      githubUrl: 'https://github.com/chetana/chetaku-rs',
      demoUrl: 'https://chetana.dev',
      featured: true,
      type: 'side-project',
    }
  ]

  let projInserted = 0, projUpdated = 0
  for (const proj of projectsData) {
    const existing = await db.select().from(projects).where(eq(projects.slug, proj.slug))
    if (existing.length > 0) {
      await db.update(projects)
        .set({ titleFr: proj.titleFr, titleEn: proj.titleEn, titleKm: proj.titleKm, descriptionFr: proj.descriptionFr, descriptionEn: proj.descriptionEn, descriptionKm: proj.descriptionKm, tags: proj.tags, githubUrl: proj.githubUrl, demoUrl: proj.demoUrl, featured: proj.featured, type: proj.type })
        .where(eq(projects.id, existing[0].id))
      projUpdated++
    } else {
      await db.insert(projects).values(proj)
      projInserted++
    }
  }
  console.log(`✅ Projects: ${projInserted} inserted, ${projUpdated} updated`)

  console.log('🎉 Done! (blog_posts, comments, users untouched)')
}

seedCV().catch(console.error)
