/**
 * seed-cv.ts — Upsert intelligent des experiences et skills.
 * - Compare par company+dateStart (experiences) et category+name (skills)
 * - Ajoute les nouvelles entrées, met à jour celles qui existent
 * - Ne supprime RIEN
 * - Ne touche PAS aux autres tables (blog_posts, comments, projects, users, etc.)
 */
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { experiences, skills } from './schema'
import { eq, and } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

// ── Data ──────────────────────────────────────────────────────────────────

const experiencesData = [
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
  { category: 'Cloud & Serverless', name: 'GCP (Cloud Run, Cloud Build)', color: 'cyan', sortOrder: 1 },
  { category: 'Cloud & Serverless', name: 'AWS (SQS, S3)', color: 'cyan', sortOrder: 2 },
  { category: 'Cloud & Serverless', name: 'Docker multi-stage', color: 'cyan', sortOrder: 3 },
  { category: 'Cloud & Serverless', name: 'Kubernetes', color: 'cyan', sortOrder: 4 },
  { category: 'Cloud & Serverless', name: 'Serverless containers', color: 'cyan', sortOrder: 5 },
  { category: 'Cloud & Serverless', name: 'gcloud CLI', color: 'cyan', sortOrder: 6 },
  { category: 'Data & Infra', name: 'PostgreSQL', color: 'blue', sortOrder: 1 },
  { category: 'Data & Infra', name: 'Elasticsearch', color: 'blue', sortOrder: 2 },
  { category: 'Data & Infra', name: 'MongoDB', color: 'blue', sortOrder: 3 },
  { category: 'Data & Infra', name: 'Redis', color: 'blue', sortOrder: 4 },
  { category: 'Data & Infra', name: 'GitLab CI/CD', color: 'blue', sortOrder: 5 },
  { category: 'Data & Infra', name: 'Jenkins / Ansible', color: 'blue', sortOrder: 6 },
  { category: 'Data & Infra', name: 'Keycloak', color: 'blue', sortOrder: 7 },
  { category: 'Data & Infra', name: 'k6 (load testing)', color: 'blue', sortOrder: 8 },
  { category: 'Data & Infra', name: 'Grafana', color: 'blue', sortOrder: 9 },
  { category: 'Domaine métier', name: 'Order Management (OMS)', color: 'green', sortOrder: 1 },
  { category: 'Domaine métier', name: 'Payments (Adyen, Mangopay)', color: 'green', sortOrder: 2 },
  { category: 'Domaine métier', name: 'Cart & Checkout', color: 'green', sortOrder: 3 },
  { category: 'Domaine métier', name: 'Multi-tenant SaaS', color: 'green', sortOrder: 4 },
  { category: 'Domaine métier', name: 'E-commerce B2B', color: 'green', sortOrder: 5 },
  { category: 'Domaine métier', name: 'Contract testing', color: 'green', sortOrder: 6 },
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
  { category: 'AI-Augmented Dev', name: 'Claude Code (43 commands)', color: 'purple', sortOrder: 1 },
  { category: 'AI-Augmented Dev', name: 'MCP (13 servers)', color: 'purple', sortOrder: 2 },
  { category: 'AI-Augmented Dev', name: '9 Sub-agents', color: 'purple', sortOrder: 3 },
  { category: 'AI-Augmented Dev', name: '4 Pre-tool hooks', color: 'purple', sortOrder: 4 },
  { category: 'AI-Augmented Dev', name: 'Vertex AI / Gemini', color: 'purple', sortOrder: 5 },
  { category: 'AI-Augmented Dev', name: 'LLM integration', color: 'purple', sortOrder: 6 },
  { category: 'AI-Augmented Dev', name: 'Versioned AI workspace', color: 'purple', sortOrder: 7 },
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

  console.log('🎉 Done! (blog_posts, comments, projects, users untouched)')
}

seedCV().catch(console.error)
