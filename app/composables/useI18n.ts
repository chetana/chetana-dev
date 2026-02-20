const translations: Record<string, Record<string, string>> = {
  // Navigation
  'nav.about': { fr: 'A propos', en: 'About' },
  'nav.experience': { fr: 'Expérience', en: 'Experience' },
  'nav.skills': { fr: 'Compétences', en: 'Skills' },
  'nav.education': { fr: 'Formation', en: 'Education' },
  'nav.projects': { fr: 'Projets', en: 'Projects' },
  'nav.blog': { fr: 'Blog', en: 'Blog' },
  'nav.contact': { fr: 'Contact', en: 'Contact' },

  // Hero
  'hero.badge': { fr: 'Ouvert aux opportunités', en: 'Open to opportunities' },
  'hero.desc': {
    fr: "Engineering Manager & hands-on tech lead avec 13 ans d'expérience. Je construis des plateformes e-commerce B2B à l'échelle, et je manage des équipes qui livrent.",
    en: "Engineering Manager & hands-on tech lead with 13 years of experience. I build B2B e-commerce platforms at scale, and I manage teams that deliver."
  },
  'hero.cta1': { fr: 'Me contacter', en: 'Contact me' },
  'hero.cta2': { fr: 'Mon parcours', en: 'My journey' },
  'hero.cta3': { fr: 'CV format ATS', en: 'ATS Resume' },

  // Stats
  'stat.years': { fr: "Années d'expérience", en: 'Years of experience' },
  'stat.engineers': { fr: 'Ingénieurs managés', en: 'Engineers managed' },
  'stat.djust': { fr: 'Années sur la plateforme DJUST', en: 'Years on the DJUST platform' },

  // About
  'about.label': { fr: 'A propos', en: 'About' },
  'about.title': { fr: 'Engineering Manager qui code', en: 'Engineering Manager who codes' },
  'about.p1': {
    fr: "Je ne suis pas le manager qui regarde des dashboards. Je suis dans le code, dans les reviews, dans les incidents. Quand un bug critique tombe en prod un vendredi soir, je suis celui qui ouvre le terminal.",
    en: "I'm not the manager who stares at dashboards. I'm in the code, in the reviews, in the incidents. When a critical bug hits production on a Friday night, I'm the one who opens the terminal."
  },
  'about.p2': {
    fr: "Chez DJUST, je manage l'équipe OMS (Order Management System) de 6 ingénieurs tout en restant le lead technique de la plateforme. Mon scope : gestion des commandes, paiements (Adyen, Mangopay, Lemonway), panier, intégration fournisseurs, et tout ce qui touche au flux transactionnel B2B.",
    en: "At DJUST, I manage the OMS (Order Management System) team of 6 engineers while remaining the platform's technical lead. My scope: order management, payments (Adyen, Mangopay, Lemonway), cart, supplier integrations, and everything related to the B2B transactional flow."
  },
  'about.p3': {
    fr: "Avant le management, j'ai passé 10 ans les mains dans le code : mobile chez miLibris, applications bancaires chez BNP Paribas, tunnel d'achat chez Galeries Lafayette. Mon parcours technique est mon plus grand atout de manager : je comprends les problèmes de mes devs parce que je les vis avec eux.",
    en: "Before management, I spent 10 years hands-on in code: mobile at miLibris, banking apps at BNP Paribas, checkout flow at Galeries Lafayette. My technical background is my greatest asset as a manager: I understand my devs' problems because I live them with them."
  },
  'about.hl1.title': { fr: 'Plateforme e-commerce B2B', en: 'B2B E-commerce Platform' },
  'about.hl1.desc': {
    fr: "Architecture modulaire (15+ modules), multi-tenant, multi-PSP, gérant des millions de transactions pour des clients comme Franprix, Procity, VEJA",
    en: "Modular architecture (15+ modules), multi-tenant, multi-PSP, handling millions of transactions for clients like Franprix, Procity, VEJA"
  },
  'about.hl2.title': { fr: 'Pionnier IA en équipe', en: 'AI Pioneer in team' },
  'about.hl2.desc': {
    fr: "Premier à intégrer Claude Code dans le workflow quotidien de l'équipe : code reviews automatisées, génération de tests E2E, briefings MEP, analyse de bugs",
    en: "First to integrate Claude Code into the team's daily workflow: automated code reviews, E2E test generation, deployment briefings, bug analysis"
  },
  'about.hl3.title': { fr: 'People & delivery', en: 'People & delivery' },
  'about.hl3.desc': {
    fr: "Évaluations, 1:1, recrutement, et en même temps : MEP hebdomadaires, gestion d'incidents prod, coordination cross-équipes",
    en: "Performance reviews, 1:1s, hiring, and at the same time: weekly releases, production incident management, cross-team coordination"
  },
  'about.hl4.title': { fr: 'International', en: 'International' },
  'about.hl4.desc': {
    fr: "Epitech Paris + Master à Beijing (Jiaotong University). Franco-cambodgien, je parle anglais, mandarin et espagnol",
    en: "Epitech Paris + Master's at Beijing (Jiaotong University). French-Cambodian, I speak English, Mandarin and Spanish"
  },

  // Experience
  'exp.label': { fr: 'Parcours', en: 'Journey' },
  'exp.title': { fr: 'Expérience professionnelle', en: 'Professional Experience' },

  // Skills
  'skills.label': { fr: 'Compétences', en: 'Skills' },
  'skills.title': { fr: 'Stack technique', en: 'Tech Stack' },
  'skills.business': { fr: 'Domaine métier', en: 'Business Domain' },
  'skills.recruit': { fr: 'Recrutement', en: 'Hiring' },

  // AI Section
  'ai.p1': {
    fr: "Pionnier dans l'adoption de l'IA comme outil de développement au quotidien. J'ai construit un écosystème complet d'automatisations avec Claude Code : 25+ skills personnalisés, hooks intelligents, mémoire persistante, intégration Slack/Jira/Notion/GitLab.",
    en: "Pioneer in adopting AI as a daily development tool. I built a complete automation ecosystem with Claude Code: 25+ custom skills, smart hooks, persistent memory, Slack/Jira/Notion/GitLab integration."
  },
  'ai.p2': {
    fr: "Mon équipe utilise désormais l'IA pour les code reviews, la génération de tests E2E, les briefings de déploiement, et l'analyse d'incidents. Ce n'est pas du gadget : c'est un multiplicateur de force concret sur la productivité et la qualité.",
    en: "My team now uses AI for code reviews, E2E test generation, deployment briefings, and incident analysis. This isn't a gimmick: it's a concrete force multiplier for productivity and quality."
  },
  'ai.m2': { fr: 'MCP servers intégrés', en: 'Integrated MCP servers' },
  'ai.m3': { fr: "Devs de l'équipe formés", en: 'Team devs trained' },

  // Education
  'edu.label': { fr: 'Formation', en: 'Education' },
  'edu.epitech': { fr: "Expert en Technologies de l'Information (BAC+5)", en: "IT Expert Degree (Master's level)" },
  'edu.beijing.year': { fr: '2011 - 2012 | Beijing, Chine', en: '2011 - 2012 | Beijing, China' },

  // Contact
  'contact.title': { fr: 'Échangeons', en: "Let's talk" },
  'contact.phone': { fr: 'Téléphone', en: 'Phone' },
  'contact.location': { fr: 'Localisation', en: 'Location' },
  'contact.location.value': { fr: 'Paris et périphérie', en: 'Paris area' },
  'contact.name': { fr: 'Votre nom', en: 'Your name' },
  'contact.email': { fr: 'Votre email', en: 'Your email' },
  'contact.message': { fr: 'Votre message', en: 'Your message' },
  'contact.send': { fr: 'Envoyer', en: 'Send' },
  'contact.sent': { fr: 'Message envoyé !', en: 'Message sent!' },

  // Projects page
  'projects.title': { fr: 'Projets', en: 'Projects' },
  'projects.subtitle': { fr: 'Mes projets personnels et expérimentations', en: 'My personal projects and experiments' },
  'projects.view': { fr: 'Voir le projet', en: 'View project' },
  'projects.github': { fr: 'Code source', en: 'Source code' },
  'projects.demo': { fr: 'Démo live', en: 'Live demo' },

  // Blog page
  'blog.title': { fr: 'Blog', en: 'Blog' },
  'blog.subtitle': { fr: 'Articles techniques et retours d\'expérience', en: 'Technical articles and experience reports' },
  'blog.readmore': { fr: 'Lire la suite', en: 'Read more' },

  // Comments
  'comments.title': { fr: 'Commentaires', en: 'Comments' },
  'comments.name': { fr: 'Votre nom', en: 'Your name' },
  'comments.content': { fr: 'Votre commentaire', en: 'Your comment' },
  'comments.submit': { fr: 'Publier', en: 'Submit' },
  'comments.pending': { fr: 'Votre commentaire est en attente de modération.', en: 'Your comment is pending moderation.' },
  'comments.empty': { fr: 'Aucun commentaire pour le moment.', en: 'No comments yet.' },

  // Footer
  'footer.text': { fr: 'Chetana YIN', en: 'Chetana YIN' }
}

export function useLocale() {
  const locale = useState<'fr' | 'en'>('locale', () => 'fr')

  function t(key: string): string {
    const entry = translations[key]
    if (!entry) return key
    return entry[locale.value] || entry.fr || key
  }

  function toggleLocale() {
    locale.value = locale.value === 'fr' ? 'en' : 'fr'
  }

  return { locale, t, toggleLocale }
}
