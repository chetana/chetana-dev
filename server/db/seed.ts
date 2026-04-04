import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { experiences, skills, projects, blogPosts, comments } from './schema'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seed() {
  console.log('⚠️  seed.ts efface toutes les tables. Utilise npm run db:seed (seed-all.ts) pour tout restaurer.')
  console.log('🌱 Seeding database...')

  // Clear existing data to avoid duplicates on re-run
  // Order matters: comments references blogPosts (FK)
  await db.delete(comments)
  await db.delete(blogPosts)
  await db.delete(experiences)
  await db.delete(skills)
  await db.delete(projects)
  console.log('🗑️  Cleared existing data')

  // Seed experiences from existing CV
  await db.insert(experiences).values([
    {
      company: 'DJUST',
      roleFr: 'Engineering Manager',
      roleEn: 'Engineering Manager',
      roleKm: 'Engineering Manager',
      dateStart: '2023-11',
      dateEnd: null,
      location: 'Paris',
      bulletsFr: [
        "Management de l'équipe OMS (5 personnes : devs + QA) : recrutement, 1:1, performance reviews, montée en compétences",
        "EM orienté produit et business value : implication dans les avant-ventes techniques (grands comptes B2B), arbitrages make vs. buy, alignement architecture ↔ roadmap",
        "API governance automation : spec OpenAPI avant le code (API-first design), CI de validation de contrat, détection automatisée de breaking changes via MCP avant merge",
        "Performance engineering : résolution N+1 sur les mises à jour de commandes en masse — réduction de 61% du temps de réponse (batch processing, IN query, EnumMap UUID)",
        "Load testing : mise en place d'une suite k6 + Grafana Cloud couvrant les workflows critiques (checkout, search, cart) — smoke tests, load tests, monitoring continu en preprod",
        "Architecture PSP : consolidation sur Adyen pour paiements classiques et marketplace (split interne) — décision issue d'une analyse réglementaire, partenariale et business",
        "Incident management : gestion d'un incident OOM en production (fetch collections Hibernate sur exports massifs, storm de retries, Flyway lock orphelin) — root cause analysis, coordination du fix, déploiement hotfix d'urgence",
        "Pilotage des MEP hebdomadaires, production support, coordination Back/FOC et équipes Catalog, Infra, Intégration",
        "AI-augmented development : 43 slash commands Claude Code, 9 sous-agents spécialisés, 4 hooks pre-tool, 13 MCP servers intégrés (Jira, Notion, Slack, Grafana, PostgreSQL, Adyen), workspace AI versionné sur GitHub, 6/6 membres formés — +40% productivité sur reviews et tests"
      ],
      bulletsEn: [
        "Managing the OMS team (5 people: devs + QA): hiring, 1:1s, performance reviews, skill development",
        "Product and business value-driven EM: involvement in technical pre-sales (major B2B accounts), make vs. buy decisions, architecture-to-roadmap alignment",
        "API governance automation: OpenAPI spec before code (API-first design), contract validation CI, automated breaking change detection via MCP before merge",
        "Performance optimization: resolved N+1 query on bulk order updates — 61% response time reduction (batch processing, IN query, EnumMap UUID)",
        "Load testing: set up k6 + Grafana Cloud suite covering critical workflows (checkout, search, cart) — smoke tests, load tests, continuous preprod monitoring",
        "PSP architecture: consolidated on Adyen for classic payments and marketplace (internal split) — decision driven by regulatory, partnership and business analysis",
        "Production incident management: handled OOM incident caused by Hibernate collection fetch on massive exports (retry storm, orphan Flyway lock) — root cause analysis, fix coordination, emergency hotfix deployment",
        "Weekly production releases, production support, Back/FOC and cross-team coordination (Catalog, Infra, Integration)",
        "AI-augmented development: 43 Claude Code slash commands, 9 specialized sub-agents, 4 pre-tool hooks, 13 MCP servers (Jira, Notion, Slack, Grafana, PostgreSQL, Adyen), versioned AI workspace on GitHub, 6/6 team members trained — +40% productivity on reviews and tests"
      ],
      bulletsKm: [
        "ដឹកនាំក្រុម OMS (៥ នាក់៖ devs + QA)៖ ការជ្រើសរើស 1:1 ការវាយតម្លៃ ការអភិវឌ្ឍជំនាញ",
        "EM ផ្តោតលើផលិតផល និងតម្លៃអាជីវកម្ម៖ ចូលរួមក្នុងការលក់ជាមុន (គ្រឹះស្ថានធំ B2B) ការសម្រេចចិត្ត make vs. buy ការតម្រឹម architecture ↔ roadmap",
        "API governance automation៖ OpenAPI spec មុនកូដ (API-first design) CI ផ្ទៀងផ្ទាត់កិច្ចសន្យា ការរកឃើញ breaking changes ដោយស្វ័យប្រវត្តិតាម MCP មុន merge",
        "Performance engineering៖ ដោះស្រាយ N+1 query លើការអាប់ដេតការបញ្ជាទិញជាបាច់ — កាត់បន្ថយ 61% នៃពេលវេលាឆ្លើយតប (batch processing IN query EnumMap UUID)",
        "Load testing៖ ដំឡើង k6 + Grafana Cloud គ្របដណ្តប់ workflows សំខាន់ៗ (checkout search cart) — smoke tests load tests ការត្រួតពិនិត្យ preprod ជាបន្ត",
        "ស្ថាបត្យកម្ម PSP៖ បង្រួបបង្រួមនៅ Adyen សម្រាប់ការទូទាត់ទូទៅ និង marketplace (split ផ្ទៃក្នុង)",
        "ការគ្រប់គ្រង incidents៖ ដោះស្រាយ OOM ក្នុង production (Hibernate collection fetch លើការនាំចេញធំ storm retries Flyway lock orphelin) — root cause analysis hotfix",
        "ដឹកនាំ releases ប្រចាំសប្តាហ៍ production support ការសម្របសម្រួល Back/FOC និងក្រុម Catalog Infra Integration",
        "AI-augmented development៖ 43 slash commands 9 sous-agents 4 hooks 13 MCP servers workspace AI versioned នៅ GitHub 6/6 សមាជិកបានបណ្តុះបណ្តាល — +40% ផលិតភាព"
      ],
      sortOrder: 1
    },
    {
      company: 'DJUST (via Takima)',
      roleFr: 'Lead Software Engineer',
      roleEn: 'Lead Software Engineer',
      roleKm: 'Lead Software Engineer',
      dateStart: '2021-10',
      dateEnd: '2023-11',
      location: 'Paris',
      bulletsFr: [
        "Conception et développement de la plateforme e-commerce B2B from scratch",
        "Architecture multi-tenant, multi-PSP (Adyen, Mangopay, Lemonway, Thunes)",
        "Stack : Java 17, Spring Boot, PostgreSQL, Elasticsearch, Keycloak, Docker, GCP",
        "Mise en place du CI/CD GitLab, des tests E2E, et des conventions de code"
      ],
      bulletsEn: [
        "Designed and built the B2B e-commerce platform from scratch",
        "Multi-tenant, multi-PSP architecture (Adyen, Mangopay, Lemonway, Thunes)",
        "Stack: Java 17, Spring Boot, PostgreSQL, Elasticsearch, Keycloak, Docker, GCP",
        "Set up GitLab CI/CD, E2E tests, and coding conventions"
      ],
      bulletsKm: [
        "រចនា និងបង្កើតវេទិកា e-commerce B2B ពីដំបូង",
        "ស្ថាបត្យកម្ម multi-tenant multi-PSP (Adyen, Mangopay, Lemonway, Thunes)",
        "Stack៖ Java 17, Spring Boot, PostgreSQL, Elasticsearch, Keycloak, Docker, GCP",
        "ដំឡើង GitLab CI/CD tests E2E និងស្តង់ដារកូដ"
      ],
      sortOrder: 2
    },
    {
      company: 'Galeries Lafayette (via Takima)',
      roleFr: 'Ingénieur Full Stack Java',
      roleEn: 'Full Stack Java Engineer',
      roleKm: 'វិស្វករ Full Stack Java',
      dateStart: '2018-06',
      dateEnd: '2021-09',
      location: 'Paris',
      bulletsFr: [
        "<strong>Gestion de production & Référent technique</strong> (2019-2021) : responsable de la production du tunnel d'achat, référent technique équipe, gestion du monolithe Hybris (Java 7) et des API Java 8, déploiements Jenkins/Ansible, méthodologie SAFe",
        "<strong>Produit / Recherche / E-merchandising</strong> (2019) : migration moteur de recherche Hybris vers Algolia, conception d'une API GraphQL, architecture hexagonale, practice Example Mapping",
        "<strong>Tunnel d'achat</strong> (2018) : développement du checkout flow e-commerce à fort trafic (panier, livraison, paiement, marketplace, carte cadeau, refonte UX)"
      ],
      bulletsEn: [
        "<strong>Production Management & Tech Lead</strong> (2019-2021): responsible for checkout production, team technical referent, managed Hybris monolith (Java 7) and Java 8 APIs, Jenkins/Ansible deployments, SAFe methodology",
        "<strong>Product / Search / E-merchandising</strong> (2019): migrated search engine from Hybris to Algolia, designed a GraphQL API, hexagonal architecture, Example Mapping practice",
        "<strong>Checkout flow</strong> (2018): developed high-traffic e-commerce checkout (cart, shipping, payment, marketplace, gift cards, UX redesign)"
      ],
      bulletsKm: [
        "<strong>ការគ្រប់គ្រង production និង Référent technique</strong> (2019-2021)៖ ទទួលខុសត្រូវលើ production នៃ checkout referent technique ក្រុម គ្រប់គ្រង Hybris monolith (Java 7) និង API Java 8 deployments Jenkins/Ansible វិធីសាស្ត្រ SAFe",
        "<strong>ផលិតផល / ស្វែងរក / E-merchandising</strong> (2019)៖ ផ្លាស់ប្តូរម៉ាស៊ីនស្វែងរកពី Hybris ទៅ Algolia រចនា API GraphQL ស្ថាបត្យកម្មគោលប្រាំមុខ practice Example Mapping",
        "<strong>លំហូរ Checkout</strong> (2018)៖ អភិវឌ្ឍ checkout e-commerce ចរាចរខ្ពស់ (រទេះ ការដឹកជញ្ជូន ការទូទាត់ marketplace កាតអំណោយ ការរចនា UX ឡើងវិញ)"
      ],
      sortOrder: 3
    },
    {
      company: 'INFOTEL (pour Groupe Burrus / DiOT)',
      roleFr: 'Ingénieur logiciels Java',
      roleEn: 'Java Software Engineer',
      roleKm: 'វិស្វករកម្មវិធី Java',
      dateStart: '2016-06',
      dateEnd: '2018-04',
      location: 'Paris',
      bulletsFr: [
        "<strong>Projet SAFE</strong> : application de gestion de flottes (EDF, Fnac-Darty) et plateforme assurance DARVA",
        "Conception et développement avec BPMN 2.0 (Activiti), moteur de règles Drools, SOAP",
        "Stack : Java, Spring, Hibernate, PostgreSQL, Vaadin, Activiti, Drools"
      ],
      bulletsEn: [
        "<strong>SAFE Project</strong>: fleet management application (EDF, Fnac-Darty) and DARVA insurance platform",
        "Design and development with BPMN 2.0 (Activiti), Drools rules engine, SOAP",
        "Stack: Java, Spring, Hibernate, PostgreSQL, Vaadin, Activiti, Drools"
      ],
      bulletsKm: [
        "<strong>គម្រោង SAFE</strong>៖ កម្មវិធីគ្រប់គ្រងកងយានយន្ត (EDF, Fnac-Darty) និងវេទិកាធានារ៉ាប់រង DARVA",
        "រចនា និងអភិវឌ្ឍជាមួយ BPMN 2.0 (Activiti) ម៉ាស៊ីនច្បាប់ Drools SOAP",
        "Stack៖ Java, Spring, Hibernate, PostgreSQL, Vaadin, Activiti, Drools"
      ],
      sortOrder: 4
    },
    {
      company: 'INFOTEL (pour BNP Paribas)',
      roleFr: 'Ingénieur mobile',
      roleEn: 'Mobile Engineer',
      roleKm: 'វិស្វករ Mobile',
      dateStart: '2015-10',
      dateEnd: '2016-06',
      location: 'Bagnolet',
      bulletsFr: [
        "Maintenance et évolution de l'application bancaire \"Mes comptes\" (Android Java)",
        "POC application hybride multi-plateforme (Android/iOS/Windows)",
        "Formation iOS/Swift dispensée par Apple"
      ],
      bulletsEn: [
        "Maintenance and development of the \"Mes comptes\" banking app (Android Java)",
        "Hybrid multi-platform application POC (Android/iOS/Windows)",
        "iOS/Swift training by Apple"
      ],
      bulletsKm: [
        "ថែទាំ និងអភិវឌ្ឍកម្មវិធីធនាគារ \"Mes comptes\" (Android Java)",
        "POC កម្មវិធីកូនកាត់ multi-platform (Android/iOS/Windows)",
        "វគ្គបណ្តុះបណ្តាល iOS/Swift ដោយ Apple"
      ],
      sortOrder: 5
    },
    {
      company: 'miLibris',
      roleFr: 'Ingénieur R&D',
      roleEn: 'R&D Engineer',
      roleKm: 'វិស្វករ R&D',
      dateStart: '2012-10',
      dateEnd: '2015-06',
      location: 'Paris',
      bulletsFr: [
        "<strong>Applications Android natives</strong> : développement complet pour des clients presse exigeants, de l'expression du besoin à la publication Play Store",
        "<strong>Framework hybride iOS/Android</strong> : liseuse numérique avec achats in-app, gestion de bibliothèque, reader interactif",
        "Startup de presse numérique — autonomie totale sur le cycle de vie mobile"
      ],
      bulletsEn: [
        "<strong>Native Android Apps</strong>: end-to-end development for demanding press clients, from requirements to Play Store publication",
        "<strong>Hybrid iOS/Android Framework</strong>: digital reader with in-app purchases, library management, interactive reader",
        "Digital press startup — full ownership of the mobile lifecycle"
      ],
      bulletsKm: [
        "<strong>កម្មវិធី Android ដើម</strong>៖ ការអភិវឌ្ឍពេញលេញសម្រាប់អតិថិជនសារព័ត៌មាន ពីតម្រូវការដល់ការបោះពុម្ពផ្សាយ Play Store",
        "<strong>Framework កូនកាត់ iOS/Android</strong>៖ កម្មវិធីអានឌីជីថលជាមួយការទិញក្នុងកម្មវិធី ការគ្រប់គ្រងបណ្ណាល័យ អ្នកអានអន្តរកម្ម",
        "Startup សារព័ត៌មានឌីជីថល — ភាពស្វ័យភាពពេញលេញលើវដ្តជីវិត mobile"
      ],
      sortOrder: 6
    }
  ])

  // Seed skills
  const skillsData = [
    // Backend & Architecture
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
    // Cloud & Serverless
    { category: 'Cloud & Serverless', name: 'GCP (Cloud Run, Cloud Build)', color: 'cyan', sortOrder: 1 },
    { category: 'Cloud & Serverless', name: 'AWS (SQS, S3)', color: 'cyan', sortOrder: 2 },
    { category: 'Cloud & Serverless', name: 'Docker multi-stage', color: 'cyan', sortOrder: 3 },
    { category: 'Cloud & Serverless', name: 'Kubernetes', color: 'cyan', sortOrder: 4 },
    { category: 'Cloud & Serverless', name: 'Serverless containers', color: 'cyan', sortOrder: 5 },
    { category: 'Cloud & Serverless', name: 'gcloud CLI', color: 'cyan', sortOrder: 6 },
    // Data & Infra
    { category: 'Data & Infra', name: 'PostgreSQL', color: 'blue', sortOrder: 1 },
    { category: 'Data & Infra', name: 'Elasticsearch', color: 'blue', sortOrder: 2 },
    { category: 'Data & Infra', name: 'MongoDB', color: 'blue', sortOrder: 3 },
    { category: 'Data & Infra', name: 'Redis', color: 'blue', sortOrder: 4 },
    { category: 'Data & Infra', name: 'GitLab CI/CD', color: 'blue', sortOrder: 5 },
    { category: 'Data & Infra', name: 'Jenkins / Ansible', color: 'blue', sortOrder: 6 },
    { category: 'Data & Infra', name: 'Keycloak', color: 'blue', sortOrder: 7 },
    { category: 'Data & Infra', name: 'k6 (load testing)', color: 'blue', sortOrder: 8 },
    { category: 'Data & Infra', name: 'Grafana', color: 'blue', sortOrder: 9 },
    // Business Domain
    { category: 'Domaine métier', name: 'Order Management (OMS)', color: 'green', sortOrder: 1 },
    { category: 'Domaine métier', name: 'Payments (Adyen, Mangopay)', color: 'green', sortOrder: 2 },
    { category: 'Domaine métier', name: 'Cart & Checkout', color: 'green', sortOrder: 3 },
    { category: 'Domaine métier', name: 'Multi-tenant SaaS', color: 'green', sortOrder: 4 },
    { category: 'Domaine métier', name: 'E-commerce B2B', color: 'green', sortOrder: 5 },
    { category: 'Domaine métier', name: 'Contract testing', color: 'green', sortOrder: 6 },
    // Management
    { category: 'Management', name: 'Team Lead (5 : devs + QA)', color: 'orange', sortOrder: 1 },
    { category: 'Management', name: '1:1 / Performance Reviews', color: 'orange', sortOrder: 2 },
    { category: 'Management', name: 'Hiring', color: 'orange', sortOrder: 3 },
    { category: 'Management', name: 'People management', color: 'orange', sortOrder: 4 },
    { category: 'Management', name: 'Agile / Scrum', color: 'orange', sortOrder: 5 },
    { category: 'Management', name: 'SAFe', color: 'orange', sortOrder: 6 },
    { category: 'Management', name: 'Kanban', color: 'orange', sortOrder: 7 },
    { category: 'Management', name: 'Incident Management / RCA', color: 'orange', sortOrder: 8 },
    { category: 'Management', name: 'Production Support', color: 'orange', sortOrder: 9 },
    // Frontend
    { category: 'Frontend', name: 'Nuxt 3', color: 'purple', sortOrder: 1 },
    { category: 'Frontend', name: 'Nuxt 4', color: 'purple', sortOrder: 2 },
    { category: 'Frontend', name: 'Vue.js', color: 'purple', sortOrder: 3 },
    { category: 'Frontend', name: 'SvelteKit / Svelte 5', color: 'purple', sortOrder: 4 },
    { category: 'Frontend', name: 'TypeScript strict', color: 'purple', sortOrder: 5 },
    { category: 'Frontend', name: 'Vite / pnpm', color: 'purple', sortOrder: 6 },
    { category: 'Frontend', name: 'SSR / Core Web Vitals', color: 'purple', sortOrder: 7 },
    // Mobile
    { category: 'Mobile', name: 'Android (Kotlin/Java)', color: 'purple', sortOrder: 1 },
    { category: 'Mobile', name: 'iOS (Swift)', color: 'purple', sortOrder: 2 },
    // AI-Augmented Dev
    { category: 'AI-Augmented Dev', name: 'Claude Code (43 commands)', color: 'purple', sortOrder: 1 },
    { category: 'AI-Augmented Dev', name: 'MCP (13 servers)', color: 'purple', sortOrder: 2 },
    { category: 'AI-Augmented Dev', name: '9 Sub-agents', color: 'purple', sortOrder: 3 },
    { category: 'AI-Augmented Dev', name: '4 Pre-tool hooks', color: 'purple', sortOrder: 4 },
    { category: 'AI-Augmented Dev', name: 'Vertex AI / Gemini', color: 'purple', sortOrder: 5 },
    { category: 'AI-Augmented Dev', name: 'LLM integration', color: 'purple', sortOrder: 6 },
    { category: 'AI-Augmented Dev', name: 'Versioned AI workspace', color: 'purple', sortOrder: 7 },
  ]
  await db.insert(skills).values(skillsData)

  // Seed sample projects
  await db.insert(projects).values([
    {
      slug: 'chetana-dev',
      titleFr: 'chetana.dev — Portfolio dynamique',
      titleEn: 'chetana.dev — Dynamic Portfolio',
      titleKm: 'chetana.dev — ផលប័ត្រថាមវន្ត',
      descriptionFr: `## Le projet

Ce site est mon portfolio personnel, mais aussi un terrain d'expérimentation technique. Plutôt que d'utiliser un template, j'ai voulu construire quelque chose de A à Z — du schema de base de données au déploiement continu.

## Stack technique

- **Frontend** : Nuxt 4 (Vue 3.5) + TypeScript — pour le SSR, le routing automatique et les composables
- **Base de données** : Neon PostgreSQL (serverless) + Drizzle ORM — schema typé, migrations simples, connection pooling automatique
- **Déploiement** : Vercel avec auto-deploy sur push to main — zéro config serveur
- **SEO** : @nuxtjs/seo pour sitemap, robots.txt, schema.org (JSON-LD) sur chaque page

## Fonctionnalités

- **Trilingue** : français, anglais et khmer — avec un composable \`useLocale()\` maison et fallback FR
- **Blog dynamique** : articles stockés en base avec rendu markdown, commentaires modérés, tags
- **CV interactif** : page dédiée avec export PDF, alimentée par la base de données
- **Formulaire de contact** : avec honeypot anti-spam et stockage en base
- **Health tracker** : suivi quotidien de pompes style Duolingo avec streaks et calendrier

## Architecture

Le site suit une architecture full-stack unifiée grâce à Nitro (le moteur serveur de Nuxt). Les API REST sont des fichiers dans \`server/api/\`, le schema Drizzle définit les types partagés entre front et back, et tout est déployé comme une seule application serverless.

## Pourquoi ce projet ?

En tant qu'Engineering Manager, je code moins au quotidien qu'avant. Ce portfolio me permet de garder la main sur les technologies modernes, d'expérimenter (Nuxt 4, Drizzle, Neon serverless), et de documenter mes réflexions via le blog. C'est aussi un exercice de product ownership : je suis à la fois le dev, le PM et l'utilisateur final.`,
      descriptionEn: `## The Project

This site is my personal portfolio, but also a technical playground. Rather than using a template, I wanted to build something from scratch — from the database schema to continuous deployment.

## Tech Stack

- **Frontend**: Nuxt 4 (Vue 3.5) + TypeScript — for SSR, automatic routing and composables
- **Database**: Neon PostgreSQL (serverless) + Drizzle ORM — typed schema, simple migrations, automatic connection pooling
- **Deployment**: Vercel with auto-deploy on push to main — zero server config
- **SEO**: @nuxtjs/seo for sitemap, robots.txt, schema.org (JSON-LD) on every page

## Features

- **Trilingual**: French, English and Khmer — with a custom \`useLocale()\` composable and FR fallback
- **Dynamic blog**: articles stored in database with markdown rendering, moderated comments, tags
- **Interactive CV**: dedicated page with PDF export, fed from the database
- **Contact form**: with honeypot anti-spam and database storage
- **Health tracker**: Duolingo-style daily pushup tracker with streaks and calendar

## Architecture

The site follows a unified full-stack architecture thanks to Nitro (Nuxt's server engine). REST APIs are files in \`server/api/\`, the Drizzle schema defines shared types between front and back, and everything deploys as a single serverless application.

## Why This Project?

As an Engineering Manager, I code less daily than I used to. This portfolio lets me keep my hands on modern technologies, experiment (Nuxt 4, Drizzle, Neon serverless), and document my thoughts through the blog. It's also a product ownership exercise: I'm the dev, the PM and the end user all at once.`,
      tags: ['Nuxt 4', 'TypeScript', 'Neon', 'Drizzle', 'Vercel'],
      githubUrl: 'https://github.com/chetana-dev/chetana-dev',
      demoUrl: 'https://chetana.dev',
      type: 'project',
      featured: true
    },
    {
      slug: 'claude-code-skills',
      titleFr: 'Claude Code Skills — Écosystème IA',
      titleEn: 'Claude Code Skills — AI Ecosystem',
      titleKm: 'Claude Code Skills — ប្រព័ន្ធអេកូ AI',
      descriptionFr: `## Le concept

Chez DJUST, j'ai développé un écosystème de **25+ skills personnalisés** pour Claude Code, transformant l'IA d'un simple assistant de code en un véritable membre de l'équipe. Chaque skill est un prompt spécialisé qui encode nos conventions, notre architecture et nos processus métier.

## Cas d'usage concrets

- **Code Review automatisée** : analyse le diff GitLab, vérifie le respect de nos conventions Spring Boot, détecte les problèmes de sécurité et de performance, génère un commentaire structuré
- **Génération de tests E2E** : à partir d'un ticket Jira, génère les scénarios de test adaptés à notre framework, avec les fixtures et les assertions
- **Briefing MEP** : compile automatiquement les changements de la release, identifie les risques, prépare le message Slack pour l'équipe
- **Analyse de bugs** : à partir d'un stack trace ou d'un log, remonte la chaîne causale dans notre codebase multi-modules

## Architecture MCP

L'intégration repose sur le **Model Context Protocol** (MCP), qui permet à Claude Code d'interagir avec nos outils :

- **Slack** : lecture des channels, envoi de messages, création de threads
- **Jira** : lecture des tickets, ajout de commentaires, transitions de statut
- **Notion** : consultation de la documentation technique
- **GitLab** : lecture des merge requests, commentaires de review

## Impact mesuré

Après quelques semaines d'adoption progressive :
- **Temps de code review** : -67% (45min → 15min en moyenne)
- **Temps d'écriture de tests** : -63% (2h → 45min par feature)
- **Couverture de tests** : +40% sur les nouveaux modules
- **Onboarding** : les juniors montent en compétence plus vite grâce aux reviews IA détaillées

## Philosophie

L'IA ne remplace pas le développeur — elle amplifie son expertise. Les skills sont conçus pour que l'humain reste décisionnaire : l'IA propose, le dev dispose. C'est cette approche "human-in-the-loop" qui a permis l'adoption par toute l'équipe.`,
      descriptionEn: `## The Concept

At DJUST, I developed an ecosystem of **25+ custom skills** for Claude Code, transforming AI from a simple code assistant into a true team member. Each skill is a specialized prompt that encodes our conventions, architecture and business processes.

## Concrete Use Cases

- **Automated Code Review**: analyzes the GitLab diff, checks compliance with our Spring Boot conventions, detects security and performance issues, generates a structured comment
- **E2E Test Generation**: from a Jira ticket, generates test scenarios adapted to our framework, with fixtures and assertions
- **Deployment Briefing**: automatically compiles release changes, identifies risks, prepares the Slack message for the team
- **Bug Analysis**: from a stack trace or log, traces the causal chain through our multi-module codebase

## MCP Architecture

The integration relies on the **Model Context Protocol** (MCP), which allows Claude Code to interact with our tools:

- **Slack**: reading channels, sending messages, creating threads
- **Jira**: reading tickets, adding comments, status transitions
- **Notion**: consulting technical documentation
- **GitLab**: reading merge requests, review comments

## Measured Impact

After a few weeks of progressive adoption:
- **Code review time**: -67% (45min → 15min average)
- **Test writing time**: -63% (2h → 45min per feature)
- **Test coverage**: +40% on new modules
- **Onboarding**: juniors ramp up faster thanks to detailed AI reviews

## Philosophy

AI doesn't replace the developer — it amplifies their expertise. Skills are designed so the human remains the decision-maker: AI proposes, the dev decides. This "human-in-the-loop" approach is what enabled adoption by the entire team.`,
      tags: ['Claude Code', 'MCP', 'AI', 'Automation'],
      type: 'project',
      featured: true
    }
  ])

  // Seed sample blog posts
  await db.insert(blogPosts).values([
    {
      slug: 'claude-code-equipe-engineering',
      titleFr: "Comment j'ai intégré Claude Code dans mon équipe d'engineering",
      titleEn: "How I integrated Claude Code into my engineering team",
      titleKm: "របៀបដែលខ្ញុំបានរួមបញ្ចូល Claude Code ក្នុងក្រុមវិស្វកម្មរបស់ខ្ញុំ",
      contentFr: "Voir article complet via db:seed-blog-claude",
      contentEn: "See full article via db:seed-blog-claude",
      contentKm: "មើលអត្ថបទពេញតាមរយៈ db:seed-blog-claude",
      excerptFr: "Comment nous avons gagné +40% de productivité en intégrant Claude Code dans le workflow quotidien de l'équipe.",
      excerptEn: "How we gained +40% productivity by integrating Claude Code into the team's daily workflow.",
      excerptKm: "របៀបដែលយើងបានទទួល +40% ផលិតភាពដោយរួមបញ្ចូល Claude Code ក្នុង workflow ប្រចាំថ្ងៃរបស់ក្រុម។",
      tags: ['AI', 'Claude Code', 'Management', 'Productivity'],
      published: true
    },
    {
      slug: 'nuxt4-neon-drizzle-portfolio',
      titleFr: 'Construire un portfolio dynamique avec Nuxt 4, Neon et Drizzle',
      titleEn: 'Building a dynamic portfolio with Nuxt 4, Neon and Drizzle',
      titleKm: 'បង្កើតផលប័ត្រថាមវន្តជាមួយ Nuxt 4, Neon និង Drizzle',
      contentFr: "Voir article complet via db:seed-blog-nuxt",
      contentEn: "See full article via db:seed-blog-nuxt",
      contentKm: "## ហេតុអ្វីផ្លាស់ប្តូរពី HTML ស្ថិតិ?\n\nCV HTML សុទ្ធរបស់ខ្ញុំដំណើរការល្អ ប៉ុន្តែខ្ញុំចង់បន្ថែមប្លុក គម្រោង និងមតិយោបល់។ ជំនួសឱ្យការបន្ថែម JavaScript vanilla ខ្ញុំបានជ្រើសរើស stack ទំនើប។\n\n## Stack ដែលបានជ្រើសរើស\n\n- **Nuxt 4** សម្រាប់ SSR និង DX\n- **Neon PostgreSQL** សម្រាប់ DB serverless\n- **Drizzle ORM** សម្រាប់ type-safety\n- **Vercel** សម្រាប់ការដាក់ពង្រាយ\n\n## ស្ថាបត្យកម្ម\n\nគេហទំព័រប្រើ server routes របស់ Nuxt (Nitro) ដើម្បីផ្តល់ REST API ដែលសួរ Neon តាមរយៈ Drizzle។ Frontend ជា Vue 3 ជាមួយ composable i18n សម្រាប់ការគាំទ្រពហុភាសា។",
      excerptFr: "Retour d'expérience sur la migration d'un CV HTML statique vers Nuxt 4 + Neon + Drizzle.",
      excerptEn: "Feedback on migrating a static HTML CV to Nuxt 4 + Neon + Drizzle.",
      excerptKm: "បទពិសោធន៍ពីការផ្លាស់ប្តូរ CV HTML ស្ថិតិទៅ Nuxt 4 + Neon + Drizzle។",
      tags: ['Nuxt', 'Neon', 'Drizzle', 'Vue', 'TypeScript'],
      published: true
    }
  ])

  console.log('✅ Database seeded successfully!')
}

seed().catch(console.error)
