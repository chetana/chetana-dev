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
  'hero.role1': { fr: 'Engineering Manager', en: 'Engineering Manager', km: 'Engineering Manager' },
  'hero.role2': { fr: 'AI Tech Lead', en: 'AI Tech Lead', km: 'AI Tech Lead' },
  'hero.desc': {
    fr: "Engineering Manager & hands-on tech lead avec <strong>13 ans d'expérience</strong>. Après avoir structuré et fait grandir la plateforme e-commerce B2B de DJUST, je pilote aujourd'hui une équipe IA sur un <strong>copilote commercial propulsé par des LLM</strong>.",
    en: "Engineering Manager & hands-on tech lead with <strong>13 years of experience</strong>. After structuring and growing DJUST's B2B e-commerce platform, I now lead an AI team building an <strong>LLM-powered sales copilot</strong>.",
    km: "Engineering Manager & hands-on tech lead ជាមួយ<strong>បទពិសោធន៍ ១៣ ឆ្នាំ</strong>។ បន្ទាប់ពីរចនាសម្ព័ន្ធ និងពង្រីកវេទិកា e-commerce B2B របស់ DJUST ឥឡូវនេះខ្ញុំដឹកនាំក្រុម IA លើ <strong>copilot ពាណិជ្ជកម្មដំណើរការដោយ LLM</strong>។"
  },
  'hero.cta1': { fr: 'Me contacter', en: 'Contact me', km: 'ទាក់ទងខ្ញុំ' },
  'hero.cta2': { fr: 'Mon parcours', en: 'My journey', km: 'ដំណើរកម្មរបស់ខ្ញុំ' },
  'hero.cta3': { fr: 'CV format ATS', en: 'ATS Resume', km: 'ប្រវត្តិរូប ATS' },

  // Hero — cockpit terminal mockup
  'hero.term1': { fr: "Vérifie l'isolation RLS avant le merge de la migration multi-tenant.", en: 'Check RLS isolation before merging the multi-tenant migration.', km: 'ពិនិត្យភាពឯកជនភាព RLS មុន merge migration multi-tenant។' },
  'hero.term2': { fr: 'agent · claude-code · session sales-copilot', en: 'agent · claude-code · sales-copilot session', km: 'agent · claude-code · session sales-copilot' },
  'hero.term4': { fr: '3 policies trouvées, 1 sans <span class="term-key">tenant_id</span> filter', en: '3 policies found, 1 missing a <span class="term-key">tenant_id</span> filter', km: 'រកឃើញ policies ៣ មួយគ្មាន <span class="term-key">tenant_id</span> filter' },
  'hero.term5': { fr: 'patch appliqué — RLS conforme sur <span class="term-key">&quot;accounts&quot;</span>', en: 'patch applied — RLS compliant on <span class="term-key">&quot;accounts&quot;</span>', km: 'patch អនុវត្តរួច — RLS ត្រឹមត្រូវលើ <span class="term-key">&quot;accounts&quot;</span>' },
  'hero.term6': { fr: 'coût session · 0,14 $ · 2 outils · 41s', en: 'session cost · $0.14 · 2 tools · 41s', km: 'ថ្លៃដើម session · $0.14 · ឧបករណ៍ 2 · 41s' },
  'hero.term7': { fr: 'Prêt pour la prochaine tâche', en: 'Ready for the next task', km: 'ត្រៀមរួចសម្រាប់ភារកិច្ចបន្ទាប់' },
  'hero.tag1': { fr: 'Jira · GitLab · coût — inspecté en live', en: 'Jira · GitLab · cost — inspected live', km: 'Jira · GitLab · ថ្លៃដើម — ត្រួតពិនិត្យផ្ទាល់' },
  'hero.tag2': { fr: 'Multi-tab · sessions parallèles', en: 'Multi-tab · parallel sessions', km: 'Multi-tab · sessions ស្របគ្នា' },
  'hero.terminalAria': {
    fr: "Aperçu de djust-cockpit, l'IDE que Chetana a conçu pour piloter ses sessions Claude Code : un prompt demandant de vérifier l'isolation multi-tenant RLS, suivi d'un appel d'outil et d'une réponse validée.",
    en: 'Preview of djust-cockpit, the IDE Chetana built to drive his Claude Code sessions: a prompt asking to check multi-tenant RLS isolation, followed by a tool call and a validated response.',
    km: 'ទិដ្ឋភាព djust-cockpit IDE ដែល Chetana បង្កើតសម្រាប់ដឹកនាំ sessions Claude Code។'
  },

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
    fr: "Je suis arrivé chez DJUST en 2021 comme dev senior, pour aider à structurer une startup naissante — j'ai conçu la plateforme e-commerce B2B from scratch. Devenu tech lead, puis Engineering Manager en 2023 de l'équipe OMS (Order Management System, 5 personnes), j'ai gardé un pied dans le code à chaque étape. Depuis juin 2026, je suis toujours EM, mais d'une équipe IA plus resserrée, entièrement dédiée à un copilote commercial B2B propulsé par des LLM (djust-sales) — un retour à un rôle plus hands-on, entre architecture Python/LLM et management.",
    en: "I joined DJUST in 2021 as a senior developer, to help structure an early-stage startup — I designed the B2B e-commerce platform from scratch. I grew into tech lead, then became Engineering Manager in 2023 of the OMS (Order Management System) team (5 people), staying hands-on in the code at every step. Since June 2026, I'm still an EM, but of a smaller AI team fully dedicated to an LLM-powered B2B sales copilot (djust-sales) — a return to a more hands-on role, split between Python/LLM architecture and management.",
    km: "ខ្ញុំចូលរួម DJUST ក្នុងឆ្នាំ 2021 ជា dev senior ដើម្បីជួយរចនាសម្ព័ន្ធ startup ដំបូង — ខ្ញុំបានរចនាវេទិកា e-commerce B2B ពីដំបូង។ បន្ទាប់មកក្លាយជា tech lead រួចជា Engineering Manager ក្នុងឆ្នាំ 2023 នៃក្រុម OMS (៥ នាក់)។ ចាប់ពីខែមិថុនា 2026 ខ្ញុំនៅតែជា EM ប៉ុន្តែក្រុម IA តូចជាង ឧទ្ទិសទាំងស្រុងចំពោះ copilot ពាណិជ្ជកម្ម B2B ដំណើរការដោយ LLM (djust-sales) — តួនាទី hands-on ច្រើនជាងមុន។"
  },
  'about.p3': {
    fr: "Avant le management, j'ai passé 10 ans les mains dans le code : mobile chez miLibris, applications bancaires chez BNP Paribas, tunnel d'achat chez Galeries Lafayette. Mon parcours technique est mon plus grand atout de manager : je comprends les problèmes de mes devs parce que je les vis avec eux.",
    en: "Before management, I spent 10 years hands-on in code: mobile at miLibris, banking apps at BNP Paribas, checkout flow at Galeries Lafayette. My technical background is my greatest asset as a manager: I understand my devs' problems because I live them with them.",
    km: "មុនពេលដឹកនាំ ខ្ញុំបានចំណាយ ១០ ឆ្នាំក្នុងកូដ៖ mobile នៅ miLibris កម្មវិធីធនាគារនៅ BNP Paribas លំហូរទិញនៅ Galeries Lafayette។ សាវតាបច្ចេកទេសរបស់ខ្ញុំជាទ្រព្យសម្បត្តិធំបំផុតក្នុងការដឹកនាំ៖ ខ្ញុំយល់ពីបញ្ហារបស់ devs របស់ខ្ញុំព្រោះខ្ញុំរស់ជាមួយពួកគេ។"
  },
  'about.p4': {
    fr: "Je pousse l'AI-augmented development plus loin qu'un simple outillage d'équipe : j'ai conçu et développé <strong>djust-cockpit</strong>, un IDE Electron local pour piloter mes sessions Claude Code — terminaux multi-onglets, vue chat live, inspecteur Jira/GitLab/coûts, radar des worktrees oubliés. 70 MR livrées en quelques mois, en parallèle de mon rôle de manager.",
    en: "I push AI-augmented development further than simple team tooling: I designed and built <strong>djust-cockpit</strong>, a local Electron IDE to drive my Claude Code sessions — multi-tab terminals, live chat view, Jira/GitLab/cost inspector, forgotten-worktree radar. 70 MRs shipped in a few months, alongside my manager role.",
    km: "ខ្ញុំជម្រុញ AI-augmented development លើសពីឧបករណ៍ក្រុមធម្មតា៖ ខ្ញុំបានរចនា និងបង្កើត <strong>djust-cockpit</strong> ជា IDE Electron មូលដ្ឋានសម្រាប់ដឹកនាំ sessions Claude Code — terminals ច្រើន tabs, chat live, inspecteur Jira/GitLab/ថ្លៃដើម។ 70 MR ក្នុងរយៈពេលពីរបីខែ ស្របគ្នាជាមួយតួនាទីអ្នកគ្រប់គ្រងរបស់ខ្ញុំ។"
  },
  'about.hl1.title': { fr: 'Plateforme e-commerce B2B', en: 'B2B E-commerce Platform', km: 'វេទិកា E-commerce B2B' },
  'about.hl1.desc': {
    fr: "Architecture modulaire (15+ modules), multi-tenant, multi-PSP, gérant des millions de transactions pour des clients comme Franprix, Eiffage (Blueon), VEJA",
    en: "Modular architecture (15+ modules), multi-tenant, multi-PSP, handling millions of transactions for clients like Franprix, Eiffage (Blueon), VEJA",
    km: "ស្ថាបត្យកម្មម៉ូឌុល (15+ modules) multi-tenant multi-PSP គ្រប់គ្រងប្រតិបត្តិការរាប់លានសម្រាប់អតិថិជនដូចជា Franprix Eiffage (Blueon) VEJA"
  },
  'about.hl2.title': { fr: 'Pionnier IA en équipe', en: 'AI Pioneer in team', km: 'អ្នកត្រួសត្រាយ AI ក្នុងក្រុម' },
  'about.hl2.desc': {
    fr: "Premier à intégrer Claude Code dans le workflow quotidien de l'équipe : 63 skills custom, 9 sous-agents, 15 MCP servers, 6/6 membres formés — jusqu'à construire mon propre IDE Electron (djust-cockpit) pour piloter mes sessions IA",
    en: "First to integrate Claude Code into the team's daily workflow: 63 custom skills, 9 sub-agents, 15 MCP servers, 6/6 team members trained — up to building my own Electron IDE (djust-cockpit) to drive my AI sessions",
    km: "ដំបូងគេដែលរួមបញ្ចូល Claude Code ក្នុង workflow ប្រចាំថ្ងៃរបស់ក្រុម៖ 63 skills 9 sous-agents 15 MCP servers 6/6 សមាជិកបានបណ្តុះបណ្តាល — រហូតដល់បង្កើត IDE Electron ផ្ទាល់ខ្លួន (djust-cockpit)"
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
    fr: "Pas juste utilisateur d'outils IA — je conçois et déploie une stack IA locale, souveraine et intégrée dans chaque étape du cycle de dev. 63 custom skills Claude Code, 15 MCP servers, 9 agents spécialisés, 11 hooks — le tout versionné sur GitHub. Toute la stack tourne on-device sur GPU/NPU AMD : aucune donnée propriétaire ne sort de la machine.",
    en: "Not just an AI tool user — I design and deploy a sovereign, local AI stack integrated into every stage of the dev cycle. 63 custom Claude Code skills, 15 MCP servers, 9 specialized agents, 11 hooks — all versioned on GitHub. The entire stack runs on-device on AMD GPU/NPU: zero proprietary data leaves the machine.",
    km: "មិនមែនគ្រាន់តែប្រើឧបករណ៍ AI ទេ — ខ្ញុំរចនា និងដាក់ពង្រាយ stack AI មូលដ្ឋាន អធិបតេយ្យ និងរួមបញ្ចូលក្នុងរាល់ដំណាក់កាលនៃវដ្តអភិវឌ្ឍន៍។ 63 custom skills 15 MCP servers 9 agents 11 hooks — ទាំងអស់ versioned នៅ GitHub។ Stack ទាំងមូលដំណើរការនៅលើ GPU/NPU AMD៖ សូន្យទិន្នន័យចេញពីម៉ាស៊ីន។"
  },
  'ai.p2': {
    fr: "Prévention (contexte projet injecté avant de coder), détection (quality gate post-commit en < 5s), review (pré-analyse LLM avant code review humain). Mon équipe de 6 utilise désormais l'IA au quotidien : code reviews, tests E2E, briefings MEP, analyse d'incidents — +40% productivité mesurée.",
    en: "Prevention (project context injected before coding), detection (post-commit quality gate in < 5s), review (LLM pre-analysis before human code review). My team of 6 now uses AI daily: code reviews, E2E tests, deployment briefings, incident analysis — +40% measured productivity.",
    km: "ការបង្ការ (contexte project មុនសរសេរកូដ) ការរកឃើញ (quality gate post-commit ក្នុង < 5s) review (ការវិភាគ LLM មុន code review មនុស្ស)។ ក្រុម ៦ នាក់របស់ខ្ញុំប្រើ AI ប្រចាំថ្ងៃ៖ code reviews tests E2E briefings MEP ការវិភាគ incidents — +40% ផលិតភាព។"
  },
  'ai.m2': { fr: 'MCP servers intégrés', en: 'Integrated MCP servers', km: 'MCP servers រួមបញ្ចូល' },
  'ai.m3': { fr: "Devs de l'équipe formés", en: 'Team devs trained', km: 'Devs ក្នុងក្រុមបានបណ្តុះបណ្តាល' },
  'ai.m4': { fr: 'Inference 100% on-device', en: '100% on-device inference', km: 'Inference 100% នៅលើម៉ាស៊ីន' },

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
