const translations: Record<string, Record<string, string>> = {
  // Navigation
  'nav.about': { fr: 'A propos', en: 'About', km: 'អំពី' },
  'nav.experience': { fr: 'Expérience', en: 'Experience', km: 'បទពិសោធន៍' },
  'nav.skills': { fr: 'Compétences', en: 'Skills', km: 'ជំនាញ' },
  'nav.education': { fr: 'Formation', en: 'Education', km: 'ការអប់រំ' },
  'nav.projects': { fr: 'Projets', en: 'Projects', km: 'គម្រោង' },
  'nav.blog': { fr: 'Blog', en: 'Blog', km: 'ប្លុក' },
  'nav.contact': { fr: 'Contact', en: 'Contact', km: 'ទំនាក់ទំនង' },
  'nav.passions': { fr: 'Passions', en: 'Passions', km: 'ចំណូលចិត្ត' },

  // Hero
  'hero.badge': { fr: 'Ouvert aux opportunités', en: 'Open to opportunities', km: 'បើកទទួលឱកាស' },
  'hero.desc': {
    fr: "Engineering Manager & hands-on tech lead avec 13 ans d'expérience. Je construis des plateformes e-commerce B2B à l'échelle, et je manage des équipes qui livrent.",
    en: "Engineering Manager & hands-on tech lead with 13 years of experience. I build B2B e-commerce platforms at scale, and I manage teams that deliver.",
    km: "Engineering Manager & hands-on tech lead ជាមួយបទពិសោធន៍ ១៣ ឆ្នាំ។ ខ្ញុំបង្កើតវេទិកា e-commerce B2B ទ្រង់ទ្រាយធំ ហើយខ្ញុំដឹកនាំក្រុមដែលផ្តល់លទ្ធផល។"
  },
  'hero.cta1': { fr: 'Me contacter', en: 'Contact me', km: 'ទាក់ទងខ្ញុំ' },
  'hero.cta2': { fr: 'Mon parcours', en: 'My journey', km: 'ដំណើរកម្មរបស់ខ្ញុំ' },
  'hero.cta3': { fr: 'CV format ATS', en: 'ATS Resume', km: 'ប្រវត្តិរូប ATS' },

  // Stats
  'stat.years': { fr: "Années d'expérience", en: 'Years of experience', km: 'ឆ្នាំនៃបទពិសោធន៍' },
  'stat.engineers': { fr: 'Ingénieurs managés', en: 'Engineers managed', km: 'វិស្វករដែលបានដឹកនាំ' },
  'stat.djust': { fr: 'Années sur la plateforme DJUST', en: 'Years on the DJUST platform', km: 'ឆ្នាំនៅលើវេទិកា DJUST' },

  // About
  'about.label': { fr: 'A propos', en: 'About', km: 'អំពី' },
  'about.title': { fr: 'Engineering Manager qui code', en: 'Engineering Manager who codes', km: 'Engineering Manager ដែលសរសេរកូដ' },
  'about.p1': {
    fr: "Je ne suis pas le manager qui regarde des dashboards. Je suis dans le code, dans les reviews, dans les incidents. Quand un bug critique tombe en prod un vendredi soir, je suis celui qui ouvre le terminal.",
    en: "I'm not the manager who stares at dashboards. I'm in the code, in the reviews, in the incidents. When a critical bug hits production on a Friday night, I'm the one who opens the terminal.",
    km: "ខ្ញុំមិនមែនជា manager ដែលមើល dashboards ទេ។ ខ្ញុំនៅក្នុងកូដ នៅក្នុង reviews នៅក្នុង incidents។ នៅពេល bug ធ្ងន់ដល់ production នៅយប់សុក្រ ខ្ញុំជាអ្នកបើក terminal។"
  },
  'about.p2': {
    fr: "Chez DJUST, je manage l'équipe OMS (Order Management System) de 5 personnes (devs + QA) tout en restant le lead technique de la plateforme. Mon scope : gestion des commandes, paiements (Adyen, Mangopay, Lemonway), panier, intégration fournisseurs, et tout ce qui touche au flux transactionnel B2B.",
    en: "At DJUST, I manage the OMS (Order Management System) team of 5 people (devs + QA) while remaining the platform's technical lead. My scope: order management, payments (Adyen, Mangopay, Lemonway), cart, supplier integrations, and everything related to the B2B transactional flow.",
    km: "នៅ DJUST ខ្ញុំដឹកនាំក្រុម OMS (Order Management System) មាន ៥ នាក់ (devs + QA) ខណៈពេលដែលនៅជា lead technique នៃវេទិកា។ វិសាលភាពរបស់ខ្ញុំ៖ ការគ្រប់គ្រងការបញ្ជាទិញ ការទូទាត់ (Adyen, Mangopay, Lemonway) រទេះ ការរួមបញ្ចូលអ្នកផ្គត់ផ្គង់ និងអ្វីទាំងអស់ដែលទាក់ទងនឹងលំហូរប្រតិបត្តិការ B2B។"
  },
  'about.p3': {
    fr: "Avant le management, j'ai passé 10 ans les mains dans le code : mobile chez miLibris, applications bancaires chez BNP Paribas, tunnel d'achat chez Galeries Lafayette. Mon parcours technique est mon plus grand atout de manager : je comprends les problèmes de mes devs parce que je les vis avec eux.",
    en: "Before management, I spent 10 years hands-on in code: mobile at miLibris, banking apps at BNP Paribas, checkout flow at Galeries Lafayette. My technical background is my greatest asset as a manager: I understand my devs' problems because I live them with them.",
    km: "មុនពេលដឹកនាំ ខ្ញុំបានចំណាយ ១០ ឆ្នាំក្នុងកូដ៖ mobile នៅ miLibris កម្មវិធីធនាគារនៅ BNP Paribas លំហូរទិញនៅ Galeries Lafayette។ សាវតាបច្ចេកទេសរបស់ខ្ញុំជាទ្រព្យសម្បត្តិធំបំផុតក្នុងការដឹកនាំ៖ ខ្ញុំយល់ពីបញ្ហារបស់ devs របស់ខ្ញុំព្រោះខ្ញុំរស់ជាមួយពួកគេ។"
  },
  'about.hl1.title': { fr: 'Plateforme e-commerce B2B', en: 'B2B E-commerce Platform', km: 'វេទិកា E-commerce B2B' },
  'about.hl1.desc': {
    fr: "Architecture modulaire (15+ modules), multi-tenant, multi-PSP, gérant des millions de transactions pour des clients comme Franprix, Eiffage (Blueon), VEJA",
    en: "Modular architecture (15+ modules), multi-tenant, multi-PSP, handling millions of transactions for clients like Franprix, Eiffage (Blueon), VEJA",
    km: "ស្ថាបត្យកម្មម៉ូឌុល (15+ modules) multi-tenant multi-PSP គ្រប់គ្រងប្រតិបត្តិការរាប់លានសម្រាប់អតិថិជនដូចជា Franprix Eiffage (Blueon) VEJA"
  },
  'about.hl2.title': { fr: 'Pionnier IA en équipe', en: 'AI Pioneer in team', km: 'អ្នកត្រួសត្រាយ AI ក្នុងក្រុម' },
  'about.hl2.desc': {
    fr: "Premier à intégrer Claude Code dans le workflow quotidien de l'équipe : code reviews automatisées, génération de tests E2E, briefings MEP, analyse de bugs",
    en: "First to integrate Claude Code into the team's daily workflow: automated code reviews, E2E test generation, deployment briefings, bug analysis",
    km: "ដំបូងគេដែលរួមបញ្ចូល Claude Code ក្នុង workflow ប្រចាំថ្ងៃរបស់ក្រុម៖ code reviews ស្វ័យប្រវត្តិ ការបង្កើត tests E2E ការប្រជុំ deployment ការវិភាគ bugs"
  },
  'about.hl3.title': { fr: 'People & delivery', en: 'People & delivery', km: 'មនុស្ស និងការផ្តល់' },
  'about.hl3.desc': {
    fr: "Évaluations, 1:1, recrutement, et en même temps : MEP hebdomadaires, gestion d'incidents prod, coordination cross-équipes",
    en: "Performance reviews, 1:1s, hiring, and at the same time: weekly releases, production incident management, cross-team coordination",
    km: "ការវាយតម្លៃ 1:1 ការជ្រើសរើស និងក្នុងពេលតែមួយ៖ releases ប្រចាំសប្តាហ៍ ការគ្រប់គ្រង incidents production ការសម្របសម្រួលឆ្លងក្រុម"
  },
  'about.hl4.title': { fr: 'International', en: 'International', km: 'អន្តរជាតិ' },
  'about.hl4.desc': {
    fr: "Epitech Paris + Master à Beijing (Jiaotong University). Franco-cambodgien, je parle anglais, mandarin et espagnol",
    en: "Epitech Paris + Master's at Beijing (Jiaotong University). French-Cambodian, I speak English, Mandarin and Spanish",
    km: "Epitech Paris + Master នៅ Beijing (Jiaotong University)។ បារាំង-កម្ពុជា ខ្ញុំនិយាយភាសាអង់គ្លេស ចិន និងអេស្ប៉ាញ"
  },

  // Experience
  'exp.label': { fr: 'Parcours', en: 'Journey', km: 'ដំណើរកម្ម' },
  'exp.title': { fr: 'Expérience professionnelle', en: 'Professional Experience', km: 'បទពិសោធន៍វិជ្ជាជីវៈ' },

  // Skills
  'skills.label': { fr: 'Compétences', en: 'Skills', km: 'ជំនាញ' },
  'skills.title': { fr: 'Stack technique', en: 'Tech Stack', km: 'បច្ចេកវិទ្យា' },
  'skills.business': { fr: 'Domaine métier', en: 'Business Domain', km: 'វិស័យអាជីវកម្ម' },
  'skills.recruit': { fr: 'Recrutement', en: 'Hiring', km: 'ការជ្រើសរើស' },

  // AI Section
  'ai.p1': {
    fr: "Pas juste utilisatrice d'outils IA — je conçois et déploie une stack IA locale, souveraine et intégrée dans chaque étape du cycle de dev. 63 custom skills Claude Code, 15 MCP servers, 9 agents spécialisés, 11 hooks — le tout versionné sur GitHub. Toute la stack tourne on-device sur GPU/NPU AMD : aucune donnée propriétaire ne sort de la machine.",
    en: "Not just an AI tool user — I design and deploy a sovereign, local AI stack integrated into every stage of the dev cycle. 63 custom Claude Code skills, 15 MCP servers, 9 specialized agents, 11 hooks — all versioned on GitHub. The entire stack runs on-device on AMD GPU/NPU: zero proprietary data leaves the machine.",
    km: "មិនមែនគ្រាន់តែប្រើឧបករណ៍ AI ទេ — ខ្ញុំរចនា និងដាក់ពង្រាយ stack AI មូលដ្ឋាន អធិបតេយ្យ និងរួមបញ្ចូលក្នុងរាល់ដំណាក់កាលនៃវដ្តអភិវឌ្ឍន៍។ 63 custom skills 15 MCP servers 9 agents 11 hooks — ទាំងអស់ versioned នៅ GitHub។ Stack ទាំងមូលដំណើរការនៅលើ GPU/NPU AMD៖ សូន្យទិន្នន័យចេញពីម៉ាស៊ីន។"
  },
  'ai.p2': {
    fr: "Prévention (contexte Mempalace injecté avant de coder), détection (quality gate post-commit en < 5s), review (pré-analyse LLM avant code review humain). Mon équipe de 6 utilise désormais l'IA au quotidien : code reviews, tests E2E, briefings MEP, analyse d'incidents — +40% productivité mesurée.",
    en: "Prevention (Mempalace context injected before coding), detection (post-commit quality gate in < 5s), review (LLM pre-analysis before human code review). My team of 6 now uses AI daily: code reviews, E2E tests, deployment briefings, incident analysis — +40% measured productivity.",
    km: "ការបង្ការ (Mempalace context មុនសរសេរកូដ) ការរកឃើញ (quality gate post-commit ក្នុង < 5s) review (ការវិភាគ LLM មុន code review មនុស្ស)។ ក្រុម ៦ នាក់របស់ខ្ញុំប្រើ AI ប្រចាំថ្ងៃ៖ code reviews tests E2E briefings MEP ការវិភាគ incidents — +40% ផលិតភាព។"
  },
  'ai.m2': { fr: 'MCP servers intégrés', en: 'Integrated MCP servers', km: 'MCP servers រួមបញ្ចូល' },
  'ai.m3': { fr: "Devs de l'équipe formés", en: 'Team devs trained', km: 'Devs ក្នុងក្រុមបានបណ្តុះបណ្តាល' },
  'ai.m4': { fr: 'Inference 100% on-device', en: '100% on-device inference', km: 'Inference 100% នៅលើម៉ាស៊ីន' },
  'ai.m5': { fr: 'Drawers indexés (Mempalace)', en: 'Indexed drawers (Mempalace)', km: 'Drawers បានដាក់សន្ទស្សន៍ (Mempalace)' },

  // Education
  'edu.label': { fr: 'Formation', en: 'Education', km: 'ការអប់រំ' },
  'edu.epitech': { fr: "Expert en Technologies de l'Information (BAC+5)", en: "IT Expert Degree (Master's level)", km: "សញ្ញាបត្រជំនាញបច្ចេកវិទ្យាព័ត៌មាន (BAC+5)" },
  'edu.beijing.year': { fr: '2011 - 2012 | Beijing, Chine', en: '2011 - 2012 | Beijing, China', km: '2011 - 2012 | Beijing ចិន' },

  // Contact
  'contact.title': { fr: 'Échangeons', en: "Let's talk", km: 'មកនិយាយគ្នា' },
  'contact.phone': { fr: 'Téléphone', en: 'Phone', km: 'ទូរស័ព្ទ' },
  'contact.location': { fr: 'Localisation', en: 'Location', km: 'ទីតាំង' },
  'contact.location.value': { fr: 'Paris et périphérie', en: 'Paris area', km: 'តំបន់ Paris' },
  'contact.name': { fr: 'Votre nom', en: 'Your name', km: 'ឈ្មោះរបស់អ្នក' },
  'contact.email': { fr: 'Votre email', en: 'Your email', km: 'អ៊ីមែលរបស់អ្នក' },
  'contact.message': { fr: 'Votre message', en: 'Your message', km: 'សាររបស់អ្នក' },
  'contact.send': { fr: 'Envoyer', en: 'Send', km: 'ផ្ញើ' },
  'contact.sent': { fr: 'Message envoyé !', en: 'Message sent!', km: 'សារបានផ្ញើ!' },

  // Projects page
  'projects.title': { fr: 'Projets', en: 'Projects', km: 'គម្រោង' },
  'projects.subtitle': { fr: 'Mes projets personnels et expérimentations', en: 'My personal projects and experiments', km: 'គម្រោងផ្ទាល់ខ្លួន និងការពិសោធន៍របស់ខ្ញុំ' },
  'projects.view': { fr: 'Voir le projet', en: 'View project', km: 'មើលគម្រោង' },
  'projects.github': { fr: 'Code source', en: 'Source code', km: 'កូដប្រភព' },
  'projects.demo': { fr: 'App', en: 'App', km: 'App' },

  // Blog page
  'blog.title': { fr: 'Blog', en: 'Blog', km: 'ប្លុក' },
  'blog.subtitle': { fr: 'Articles techniques et retours d\'expérience', en: 'Technical articles and experience reports', km: 'អត្ថបទបច្ចេកទេស និងរបាយការណ៍បទពិសោធន៍' },
  'blog.readmore': { fr: 'Lire la suite', en: 'Read more', km: 'អានបន្ថែម' },

  // Comments
  'comments.title': { fr: 'Commentaires', en: 'Comments', km: 'មតិយោបល់' },
  'comments.name': { fr: 'Votre nom', en: 'Your name', km: 'ឈ្មោះរបស់អ្នក' },
  'comments.content': { fr: 'Votre commentaire', en: 'Your comment', km: 'មតិយោបល់របស់អ្នក' },
  'comments.submit': { fr: 'Publier', en: 'Submit', km: 'បញ្ជូន' },
  'comments.pending': { fr: 'Votre commentaire est en attente de modération.', en: 'Your comment is pending moderation.', km: 'មតិយោបល់របស់អ្នកកំពុងរង់ចាំការត្រួតពិនិត្យ។' },
  'comments.empty': { fr: 'Aucun commentaire pour le moment.', en: 'No comments yet.', km: 'មិនទាន់មានមតិយោបល់ទេ។' },

  // Footer
  'footer.text': { fr: 'Chetana YIN', en: 'Chetana YIN', km: 'Chetana YIN' }
}

export function useLocale() {
  const locale = useState<'fr' | 'en' | 'km'>('locale', () => 'fr')

  function t(key: string): string {
    const entry = translations[key]
    if (!entry) return key
    return entry[locale.value] || entry.fr || key
  }

  function toggleLocale() {
    const cycle: Record<string, 'fr' | 'en' | 'km'> = { fr: 'en', en: 'km', km: 'fr' }
    locale.value = cycle[locale.value] || 'fr'
  }

  function localeField(obj: Record<string, any>, field: string): string {
    const suffix = locale.value === 'fr' ? 'Fr' : locale.value === 'en' ? 'En' : 'Km'
    return obj[field + suffix] || obj[field + 'Fr'] || ''
  }

  return { locale, t, toggleLocale, localeField }
}
