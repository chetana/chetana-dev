import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { experiences, skills, projects, blogPosts } from './schema'
import 'dotenv/config'

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seed() {
  console.log('🌱 Seeding database...')

  // Seed experiences from existing CV
  await db.insert(experiences).values([
    {
      company: 'DJUST',
      roleFr: 'Engineering Manager',
      roleEn: 'Engineering Manager',
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
      sortOrder: 1
    },
    {
      company: 'DJUST (via Takima)',
      roleFr: 'Lead Software Engineer',
      roleEn: 'Lead Software Engineer',
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
      sortOrder: 2
    },
    {
      company: 'Galeries Lafayette (via Takima)',
      roleFr: 'Ingénieur Full Stack Java',
      roleEn: 'Full Stack Java Engineer',
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
      sortOrder: 3
    },
    {
      company: 'INFOTEL (pour Groupe Burrus / DiOT)',
      roleFr: 'Ingénieur logiciels Java',
      roleEn: 'Java Software Engineer',
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
      sortOrder: 4
    },
    {
      company: 'INFOTEL (pour BNP Paribas)',
      roleFr: 'Ingénieur mobile',
      roleEn: 'Mobile Engineer',
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
      sortOrder: 5
    },
    {
      company: 'miLibris',
      roleFr: 'Ingénieur R&D',
      roleEn: 'R&D Engineer',
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
      descriptionFr: 'Portfolio/CV personnel construit avec Nuxt 4, Neon PostgreSQL et Drizzle ORM. Déployé sur Vercel avec support bilingue FR/EN.',
      descriptionEn: 'Personal portfolio/CV built with Nuxt 4, Neon PostgreSQL and Drizzle ORM. Deployed on Vercel with bilingual FR/EN support.',
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
      descriptionFr: '25+ skills personnalisés pour Claude Code : code reviews automatisées, génération de tests E2E, briefings MEP, analyse de bugs. Intégration Slack/Jira/Notion/GitLab via MCP.',
      descriptionEn: '25+ custom skills for Claude Code: automated code reviews, E2E test generation, deployment briefings, bug analysis. Slack/Jira/Notion/GitLab integration via MCP.',
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
      contentFr: "## Introduction\n\nEn tant qu'Engineering Manager chez DJUST, j'ai été le premier à introduire Claude Code dans le workflow quotidien de mon équipe de 6 ingénieurs. Voici comment nous avons fait et les résultats obtenus.\n\n## Le problème\n\nLes tâches répétitives (code reviews, tests boilerplate, briefings de déploiement) consommaient 30% du temps de l'équipe.\n\n## La solution\n\nNous avons construit un écosystème de 25+ skills personnalisés qui automatisent ces tâches. Le résultat : +40% de productivité mesurée sur les tâches répétitives.\n\n## Conclusion\n\nL'IA n'est pas un gadget. C'est un multiplicateur de force concret.",
      contentEn: "## Introduction\n\nAs Engineering Manager at DJUST, I was the first to introduce Claude Code into my team's daily workflow of 6 engineers. Here's how we did it and the results we achieved.\n\n## The Problem\n\nRepetitive tasks (code reviews, boilerplate tests, deployment briefings) consumed 30% of the team's time.\n\n## The Solution\n\nWe built an ecosystem of 25+ custom skills that automate these tasks. The result: +40% measured productivity on repetitive tasks.\n\n## Conclusion\n\nAI is not a gimmick. It's a concrete force multiplier.",
      excerptFr: "Comment nous avons gagné +40% de productivité en intégrant Claude Code dans le workflow quotidien de l'équipe.",
      excerptEn: "How we gained +40% productivity by integrating Claude Code into the team's daily workflow.",
      tags: ['AI', 'Claude Code', 'Management', 'Productivity'],
      published: true
    },
    {
      slug: 'nuxt4-neon-drizzle-portfolio',
      titleFr: 'Construire un portfolio dynamique avec Nuxt 4, Neon et Drizzle',
      titleEn: 'Building a dynamic portfolio with Nuxt 4, Neon and Drizzle',
      contentFr: "## Pourquoi migrer d'un HTML statique ?\n\nMon CV en HTML pur fonctionnait bien, mais je voulais ajouter un blog, des projets, et des commentaires. Plutôt que d'empiler du JavaScript vanilla, j'ai opté pour une stack moderne.\n\n## Stack choisie\n\n- **Nuxt 4** pour le SSR et la DX\n- **Neon PostgreSQL** pour la DB serverless\n- **Drizzle ORM** pour le type-safety\n- **Vercel** pour le déploiement\n\n## Architecture\n\nLe site utilise les server routes de Nuxt (Nitro) pour servir une API REST qui interroge Neon via Drizzle. Le frontend est en Vue 3 avec un composable i18n pour le bilingue.",
      contentEn: "## Why migrate from static HTML?\n\nMy pure HTML CV worked fine, but I wanted to add a blog, projects, and comments. Rather than piling on vanilla JavaScript, I opted for a modern stack.\n\n## Stack chosen\n\n- **Nuxt 4** for SSR and DX\n- **Neon PostgreSQL** for serverless DB\n- **Drizzle ORM** for type-safety\n- **Vercel** for deployment\n\n## Architecture\n\nThe site uses Nuxt server routes (Nitro) to serve a REST API that queries Neon via Drizzle. The frontend is Vue 3 with an i18n composable for bilingual support.",
      excerptFr: "Retour d'expérience sur la migration d'un CV HTML statique vers Nuxt 4 + Neon + Drizzle.",
      excerptEn: "Feedback on migrating a static HTML CV to Nuxt 4 + Neon + Drizzle.",
      tags: ['Nuxt', 'Neon', 'Drizzle', 'Vue', 'TypeScript'],
      published: true
    }
  ])

  console.log('✅ Database seeded successfully!')
}

seed().catch(console.error)
