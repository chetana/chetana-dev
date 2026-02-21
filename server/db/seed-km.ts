import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import { experiences, projects, blogPosts } from './schema'
import { eq } from 'drizzle-orm'
import 'dotenv/config'
import { config } from 'dotenv'
config({ path: '.env.local' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql)

async function seedKm() {
  console.log('🇰🇭 Seeding Khmer translations...')

  // Update experiences
  const expUpdates = [
    {
      company: 'DJUST',
      dateStart: '2023-11',
      roleKm: 'Engineering Manager',
      bulletsKm: [
        'ដឹកនាំក្រុម OMS (៥ នាក់៖ devs + QA)៖ ការជ្រើសរើស ការវាយតម្លៃ ការអភិវឌ្ឍជំនាញ',
        'ទទួលខុសត្រូវលើ Order Management, Payments, Cart នៅលើវេទិកា B2B SaaS',
        'Lead technique៖ ស្ថាបត្យកម្មម៉ូឌុល code reviews ការសម្រេចចិត្តបច្ចេកទេorg សំខាន់ៗ',
        'ដឹកនាំ releases ប្រចាំសប្តាហ៍ ការគ្រប់គ្រង incidents production ការសម្របសម្រួលជាមួយក្រុម Catalog Infra និង Integration',
        'រួមបញ្ចូល AI (Claude Code) ក្នុង workflow របស់ក្រុម៖ +40% ផលិតភាពលើកិច្ចការដដែលៗ'
      ]
    },
    {
      company: 'DJUST (via Takima)',
      dateStart: '2021-10',
      roleKm: 'Lead Software Engineer',
      bulletsKm: [
        'រចនា និងបង្កើតវេទិកា e-commerce B2B ពីដំបូង',
        'ស្ថាបត្យកម្ម multi-tenant multi-PSP (Adyen, Mangopay, Lemonway, Thunes)',
        'Stack៖ Java 17, Spring Boot, PostgreSQL, Elasticsearch, Keycloak, Docker, GCP',
        'ដំឡើង GitLab CI/CD tests E2E និងស្តង់ដារកូដ'
      ]
    },
    {
      company: 'Galeries Lafayette (via Takima)',
      dateStart: '2018-06',
      roleKm: 'វិស្វករ Full Stack Java',
      bulletsKm: [
        '<strong>ការគ្រប់គ្រង production និង Référent technique</strong> (2019-2021)៖ ទទួលខុសត្រូវលើ production នៃ checkout referent technique ក្រុម គ្រប់គ្រង Hybris monolith (Java 7) និង API Java 8 deployments Jenkins/Ansible វិធីសាស្ត្រ SAFe',
        '<strong>ផលិតផល / ស្វែងរក / E-merchandising</strong> (2019)៖ ផ្លាស់ប្តូរម៉ាស៊ីនស្វែងរកពី Hybris ទៅ Algolia រចនា API GraphQL ស្ថាបត្យកម្មគោលប្រាំមុខ practice Example Mapping',
        '<strong>លំហូរ Checkout</strong> (2018)៖ អភិវឌ្ឍ checkout e-commerce ចរាចរខ្ពស់ (រទេះ ការដឹកជញ្ជូន ការទូទាត់ marketplace កាតអំណោយ ការរចនា UX ឡើងវិញ)'
      ]
    },
    {
      company: 'INFOTEL (pour Groupe Burrus / DiOT)',
      dateStart: '2016-06',
      roleKm: 'វិស្វករកម្មវិធី Java',
      bulletsKm: [
        '<strong>គម្រោង SAFE</strong>៖ កម្មវិធីគ្រប់គ្រងកងយានយន្ត (EDF, Fnac-Darty) និងវេទិកាធានារ៉ាប់រង DARVA',
        'រចនា និងអភិវឌ្ឍជាមួយ BPMN 2.0 (Activiti) ម៉ាស៊ីនច្បាប់ Drools SOAP',
        'Stack៖ Java, Spring, Hibernate, PostgreSQL, Vaadin, Activiti, Drools'
      ]
    },
    {
      company: 'INFOTEL (pour BNP Paribas)',
      dateStart: '2015-10',
      roleKm: 'វិស្វករ Mobile',
      bulletsKm: [
        'ថែទាំ និងអភិវឌ្ឍកម្មវិធីធនាគារ "Mes comptes" (Android Java)',
        'POC កម្មវិធីកូនកាត់ multi-platform (Android/iOS/Windows)',
        'វគ្គបណ្តុះបណ្តាល iOS/Swift ដោយ Apple'
      ]
    },
    {
      company: 'miLibris',
      dateStart: '2012-10',
      roleKm: 'វិស្វករ R&D',
      bulletsKm: [
        '<strong>កម្មវិធី Android ដើម</strong>៖ ការអភិវឌ្ឍពេញលេញសម្រាប់អតិថិជនសារព័ត៌មាន ពីតម្រូវការដល់ការបោះពុម្ពផ្សាយ Play Store',
        '<strong>Framework កូនកាត់ iOS/Android</strong>៖ កម្មវិធីអានឌីជីថលជាមួយការទិញក្នុងកម្មវិធី ការគ្រប់គ្រងបណ្ណាល័យ អ្នកអានអន្តរកម្ម',
        'Startup សារព័ត៌មានឌីជីថល — ភាពស្វ័យភាពពេញលេញលើវដ្តជីវិត mobile'
      ]
    }
  ]

  for (const e of expUpdates) {
    await db.update(experiences)
      .set({ roleKm: e.roleKm, bulletsKm: e.bulletsKm })
      .where(eq(experiences.company, e.company))
  }
  console.log('✅ Experiences updated with Km')

  // Update projects
  await db.update(projects)
    .set({ titleKm: 'chetana.dev — ផលប័ត្រថាមវន្ត', descriptionKm: 'ផលប័ត្រ/CV ផ្ទាល់ខ្លួនបង្កើតជាមួយ Nuxt 4, Neon PostgreSQL និង Drizzle ORM។ ដាក់ពង្រាយនៅ Vercel ជាមួយការគាំទ្រភាសា FR/EN/KM។' })
    .where(eq(projects.slug, 'chetana-dev'))

  await db.update(projects)
    .set({ titleKm: 'Claude Code Skills — ប្រព័ន្ធអេកូ AI', descriptionKm: '25+ skills ផ្ទាល់ខ្លួនសម្រាប់ Claude Code៖ code reviews ស្វ័យប្រវត្តិ ការបង្កើត tests E2E ការប្រជុំ deployment ការវិភាគ bugs។ ការរួមបញ្ចូល Slack/Jira/Notion/GitLab តាមរយៈ MCP។' })
    .where(eq(projects.slug, 'claude-code-skills'))

  await db.update(projects)
    .set({ titleKm: 'តាមដានកិច្ចការរាំងដៃប្រចាំថ្ងៃ', descriptionKm: 'កម្មវិធីតាមដានកិច្ចការរាំងដៃប្រចាំថ្ងៃរចនាបែប Duolingo ជាមួយ streak ប្រតិទិន និងការផ្ទៀងផ្ទាត់។ រាំងដៃ ២០ ដង/ថ្ងៃ ចាប់ពីខែមករា 2026 និង ២៥ ដង/ថ្ងៃ ចាប់ពីខែកុម្ភៈ។' })
    .where(eq(projects.slug, 'chet-health-strong'))

  console.log('✅ Projects updated with Km')

  // Update blog posts
  await db.update(blogPosts)
    .set({
      titleKm: 'របៀបដែលខ្ញុំបានរួមបញ្ចូល Claude Code ក្នុងក្រុមវិស្វកម្មរបស់ខ្ញុំ',
      excerptKm: 'របៀបដែលយើងបានទទួល +40% ផលិតភាពដោយរួមបញ្ចូល Claude Code ក្នុង workflow ប្រចាំថ្ងៃរបស់ក្រុម។',
      contentKm: `## សេចក្តីផ្តើម

ក្នុងនាមជា Engineering Manager នៅ DJUST ខ្ញុំជាអ្នកដំបូងគេដែលណែនាំ Claude Code ក្នុង workflow ប្រចាំថ្ងៃរបស់ក្រុម ៥ នាក់របស់ខ្ញុំ។ នេះជារបៀបដែលយើងបានធ្វើ និងលទ្ធផលដែលទទួលបាន។

## បញ្ហា

កិច្ចការដដែលៗ (code reviews, tests boilerplate, ការប្រជុំ deployment) បានប្រើប្រាស់ ៣០% នៃពេលវេលារបស់ក្រុម។

## ដំណោះស្រាយ

យើងបានបង្កើតប្រព័ន្ធអេកូនៃ 25+ skills ផ្ទាល់ខ្លួនដែលស្វ័យប្រវត្តិកម្មកិច្ចការទាំងនេះ។ លទ្ធផល៖ +40% ផលិតភាពលើកិច្ចការដដែលៗ។

## សេចក្តីសន្និដ្ឋាន

AI មិនមែនជារឿងលេងទេ។ វាជាកម្លាំងពង្រីកជាក់ស្តែង។`
    })
    .where(eq(blogPosts.slug, 'claude-code-equipe-engineering'))

  await db.update(blogPosts)
    .set({
      titleKm: 'បង្កើតផលប័ត្រថាមវន្តជាមួយ Nuxt 4, Neon និង Drizzle',
      excerptKm: 'បទពិសោធន៍ពីការផ្លាស់ប្តូរ CV HTML ស្ថិតិទៅ Nuxt 4 + Neon + Drizzle។',
      contentKm: `## ហេតុអ្វីផ្លាស់ប្តូរពី HTML ស្ថិតិ?

CV HTML សុទ្ធរបស់ខ្ញុំដំណើរការល្អ ប៉ុន្តែខ្ញុំចង់បន្ថែមប្លុក គម្រោង និងមតិយោបល់។ ជំនួសឱ្យការបន្ថែម JavaScript vanilla ខ្ញុំបានជ្រើសរើស stack ទំនើប។

## Stack ដែលបានជ្រើសរើស

- **Nuxt 4** សម្រាប់ SSR និង DX
- **Neon PostgreSQL** សម្រាប់ DB serverless
- **Drizzle ORM** សម្រាប់ type-safety
- **Vercel** សម្រាប់ការដាក់ពង្រាយ

## ស្ថាបត្យកម្ម

គេហទំព័រប្រើ server routes របស់ Nuxt (Nitro) ដើម្បីផ្តល់ REST API ដែលសួរ Neon តាមរយៈ Drizzle។ Frontend ជា Vue 3 ជាមួយ composable i18n សម្រាប់ការគាំទ្រពហុភាសា។`
    })
    .where(eq(blogPosts.slug, 'nuxt4-neon-drizzle-portfolio'))

  await db.update(blogPosts)
    .set({
      titleKm: 'ពី dark theme ទៅ light theme៖ ហេតុអ្វីខ្ញុំផ្លាស់ប្តូរបន្ទាប់ពី ១៥ ឆ្នាំ',
      excerptKm: 'បន្ទាប់ពី ១៥ ឆ្នាំនៃ dark theme ខ្ញុំបានផ្លាស់ប្តូរទៅ light។ រូបវិទ្យា វិទ្យាសាស្ត្រ អេក្រង់ទំនើប និងការវិវត្តន៍ផ្ទាល់ខ្លួន៖ ហេតុអ្វីវាមិនមែនជាការក្បត់ ប៉ុន្តែជាភាពចាស់ទុំ។',
      contentKm: `## សេចក្តីផ្តើម

មានប្រធានបទក្នុងពិភពអភិវឌ្ឍន៍កម្មវិធីដែលបង្កើតសង្គ្រាមសាសនា។ Tabs vs spaces។ Vim vs Emacs។ ហើយពិតណាស់៖ **dark theme vs light theme**។

អស់រយៈពេលជិត ១៥ ឆ្នាំ ខ្ញុំជាអ្នកគាំទ្រ dark theme មិនរំកិល។ Terminal ខ្មៅ IDE ខ្មៅ browser ក្នុង dark mode សូម្បីតែទូរស័ព្ទ។ អ្វីៗទាំងអស់ងងឹត។ វាជាអត្តសញ្ញាណអ្នកអភិវឌ្ឍន៍របស់ខ្ញុំ បង្កើតតាំងពីថ្ងៃដំបូងនៅ EPITECH ប្រមាណឆ្នាំ 2008 នៅពេលខ្ញុំមានអាយុ ២០ ឆ្នាំ។

ហើយបន្ទាប់មក ប្រមាណអាយុ ៣៥ ខ្ញុំបានផ្លាស់ប្តូរ។ ទាំងស្រុង។

## សេចក្តីសន្និដ្ឋាន

នៅអាយុ ២០ ខ្ញុំបានជ្រើសរើស dark theme ព្រោះវាជាអ្វីដែលគ្រប់គ្នាធ្វើ។ នៅអាយុ ៣៧ ខ្ញុំបានជ្រើសរើស light theme ព្រោះវាសមស្របនឹងខ្ញុំ។

ការវិវត្តន៍មិនមែនជាការក្បត់ទេ។ វាជាភស្តុតាងថាអ្នកបន្តស្តាប់រាងកាយរបស់អ្នក សួរសំណួរពីទម្លាប់របស់អ្នក និងធ្វើការសម្រេចចិត្តដោយចេតនាជំនួសឱ្យការធ្វើតាមទម្រង់។`
    })
    .where(eq(blogPosts.slug, 'dark-theme-light-theme-transition'))

  console.log('✅ Blog posts updated with Km')
  console.log('🎉 All Khmer translations seeded!')
}

seedKm().catch(console.error)
