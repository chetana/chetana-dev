import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { experiences, skills, projects, blogPosts, comments } from './schema'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seed() {
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
        "Management de l'équipe OMS (6 ingénieurs) : recrutement, évaluations, montée en compétences",
        "Responsable du périmètre Order Management, Payments, Cart sur une plateforme B2B SaaS",
        "Lead technique : architecture des modules, code reviews, décisions techniques structurantes",
        "Pilotage des MEP hebdomadaires, gestion des incidents prod, coordination avec les équipes Catalog, Infra et Intégration",
        "Intégration de l'IA (Claude Code) dans le workflow de l'équipe : +40% de productivité sur les tâches répétitives"
      ],
      bulletsEn: [
        "Managing the OMS team (6 engineers): hiring, performance reviews, skill development",
        "Responsible for Order Management, Payments, Cart on a B2B SaaS platform",
        "Technical lead: module architecture, code reviews, key technical decisions",
        "Weekly production releases, production incident management, coordination with Catalog, Infra and Integration teams",
        "Integrated AI (Claude Code) into the team's workflow: +40% productivity on repetitive tasks"
      ],
      bulletsKm: [
        "ដឹកនាំក្រុម OMS (វិស្វករ ៦ នាក់)៖ ការជ្រើសរើស ការវាយតម្លៃ ការអភិវឌ្ឍជំនាញ",
        "ទទួលខុសត្រូវលើ Order Management, Payments, Cart នៅលើវេទិកា B2B SaaS",
        "Lead technique៖ ស្ថាបត្យកម្មម៉ូឌុល code reviews ការសម្រេចចិត្តបច្ចេកទេorg សំខាន់ៗ",
        "ដឹកនាំ releases ប្រចាំសប្តាហ៍ ការគ្រប់គ្រង incidents production ការសម្របសម្រួលជាមួយក្រុម Catalog Infra និង Integration",
        "រួមបញ្ចូល AI (Claude Code) ក្នុង workflow របស់ក្រុម៖ +40% ផលិតភាពលើកិច្ចការដដែលៗ"
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
    // Backend
    { category: 'Backend', name: 'Java 17+', color: 'purple', sortOrder: 1 },
    { category: 'Backend', name: 'Spring Boot', color: 'purple', sortOrder: 2 },
    { category: 'Backend', name: 'Spring Security', color: 'purple', sortOrder: 3 },
    { category: 'Backend', name: 'JPA / Hibernate', color: 'purple', sortOrder: 4 },
    { category: 'Backend', name: 'Maven', color: 'purple', sortOrder: 5 },
    { category: 'Backend', name: 'REST API', color: 'purple', sortOrder: 6 },
    { category: 'Backend', name: 'GraphQL', color: 'purple', sortOrder: 7 },
    { category: 'Backend', name: 'OpenAPI / Swagger', color: 'purple', sortOrder: 8 },
    { category: 'Backend', name: 'Node.js', color: 'purple', sortOrder: 9 },
    // Data & Infra
    { category: 'Data & Infra', name: 'PostgreSQL', color: 'blue', sortOrder: 1 },
    { category: 'Data & Infra', name: 'Elasticsearch', color: 'blue', sortOrder: 2 },
    { category: 'Data & Infra', name: 'MongoDB', color: 'blue', sortOrder: 3 },
    { category: 'Data & Infra', name: 'Redis', color: 'blue', sortOrder: 4 },
    { category: 'Data & Infra', name: 'Docker', color: 'blue', sortOrder: 5 },
    { category: 'Data & Infra', name: 'Kubernetes', color: 'blue', sortOrder: 6 },
    { category: 'Data & Infra', name: 'GCP', color: 'blue', sortOrder: 7 },
    { category: 'Data & Infra', name: 'GitLab CI/CD', color: 'blue', sortOrder: 8 },
    { category: 'Data & Infra', name: 'Jenkins / Ansible', color: 'blue', sortOrder: 9 },
    { category: 'Data & Infra', name: 'AWS SQS / S3', color: 'blue', sortOrder: 10 },
    // Business Domain
    { category: 'Domaine métier', name: 'Order Management', color: 'green', sortOrder: 1 },
    { category: 'Domaine métier', name: 'Payments (Adyen, Mangopay)', color: 'green', sortOrder: 2 },
    { category: 'Domaine métier', name: 'Cart & Checkout', color: 'green', sortOrder: 3 },
    { category: 'Domaine métier', name: 'Multi-tenant SaaS', color: 'green', sortOrder: 4 },
    { category: 'Domaine métier', name: 'E-commerce B2B', color: 'green', sortOrder: 5 },
    { category: 'Domaine métier', name: 'Keycloak / Auth', color: 'green', sortOrder: 6 },
    // Management
    { category: 'Management', name: 'Team Lead (6 devs)', color: 'orange', sortOrder: 1 },
    { category: 'Management', name: 'Code Reviews', color: 'orange', sortOrder: 2 },
    { category: 'Management', name: 'Recrutement', color: 'orange', sortOrder: 3 },
    { category: 'Management', name: 'People Review', color: 'orange', sortOrder: 4 },
    { category: 'Management', name: 'Agile / Scrum', color: 'orange', sortOrder: 5 },
    { category: 'Management', name: 'SAFe', color: 'orange', sortOrder: 6 },
    { category: 'Management', name: 'Kanban', color: 'orange', sortOrder: 7 },
    { category: 'Management', name: 'Incident Management', color: 'orange', sortOrder: 8 },
    // Frontend & Mobile
    { category: 'Frontend & Mobile', name: 'Nuxt 4 / Vue', color: 'purple', sortOrder: 1 },
    { category: 'Frontend & Mobile', name: 'TypeScript', color: 'purple', sortOrder: 2 },
    { category: 'Frontend & Mobile', name: 'Android (Java)', color: 'purple', sortOrder: 3 },
    { category: 'Frontend & Mobile', name: 'iOS (Swift)', color: 'purple', sortOrder: 4 },
    // AI-Augmented Dev
    { category: 'AI-Augmented Dev', name: 'Claude Code', color: 'purple', sortOrder: 1 },
    { category: 'AI-Augmented Dev', name: 'MCP Servers', color: 'purple', sortOrder: 2 },
    { category: 'AI-Augmented Dev', name: 'Custom AI Skills', color: 'purple', sortOrder: 3 },
    { category: 'AI-Augmented Dev', name: 'Automated Reviews', color: 'purple', sortOrder: 4 },
    { category: 'AI-Augmented Dev', name: 'AI-Assisted Testing', color: 'purple', sortOrder: 5 },
  ]
  await db.insert(skills).values(skillsData)

  // Seed sample projects
  await db.insert(projects).values([
    {
      slug: 'chetana-dev',
      titleFr: 'chetana.dev — Portfolio dynamique',
      titleEn: 'chetana.dev — Dynamic Portfolio',
      titleKm: 'chetana.dev — ផលប័ត្រថាមវន្ត',
      descriptionFr: 'Portfolio/CV personnel construit avec Nuxt 4, Neon PostgreSQL et Drizzle ORM. Déployé sur Vercel avec support bilingue FR/EN.',
      descriptionEn: 'Personal portfolio/CV built with Nuxt 4, Neon PostgreSQL and Drizzle ORM. Deployed on Vercel with bilingual FR/EN support.',
      descriptionKm: 'ផលប័ត្រ/CV ផ្ទាល់ខ្លួនបង្កើតជាមួយ Nuxt 4, Neon PostgreSQL និង Drizzle ORM។ ដាក់ពង្រាយនៅ Vercel ជាមួយការគាំទ្រភាសា FR/EN/KM។',
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
      descriptionFr: '25+ skills personnalisés pour Claude Code : code reviews automatisées, génération de tests E2E, briefings MEP, analyse de bugs. Intégration Slack/Jira/Notion/GitLab via MCP.',
      descriptionEn: '25+ custom skills for Claude Code: automated code reviews, E2E test generation, deployment briefings, bug analysis. Slack/Jira/Notion/GitLab integration via MCP.',
      descriptionKm: '25+ skills ផ្ទាល់ខ្លួនសម្រាប់ Claude Code៖ code reviews ស្វ័យប្រវត្តិ ការបង្កើត tests E2E ការប្រជុំ deployment ការវិភាគ bugs។ ការរួមបញ្ចូល Slack/Jira/Notion/GitLab តាមរយៈ MCP។',
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
