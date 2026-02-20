<template>
  <div class="cv-page">
    <div class="cv-container">
      <div class="cv-actions">
        <button class="cv-btn" @click="toggleLocale">{{ locale === 'fr' ? 'EN' : 'FR' }}</button>
        <button class="cv-btn" @click="printCV">📄 {{ locale === 'fr' ? 'Télécharger PDF' : 'Download PDF' }}</button>
      </div>

      <div class="cv-header">
        <h1>Chetana YIN</h1>
        <div class="cv-subtitle">Engineering Manager (ex Lead Software Engineer)</div>
        <div class="cv-contact">
          77144 Montevrain | +33 6 51 25 35 80<br>
          chetana.yin@gmail.com<br>
          LinkedIn : <a href="https://www.linkedin.com/in/chetana-yin-79b36754/">linkedin.com/in/chetana-yin</a>
        </div>
      </div>

      <!-- Profile -->
      <div class="cv-section">
        <div class="cv-section-title">{{ locale === 'fr' ? 'Profil' : 'Profile' }}</div>
        <p class="cv-profil">{{ locale === 'fr'
          ? "Engineering Manager hands-on avec 13 ans d'expérience en développement logiciel, dont 4+ années à concevoir et scaler une plateforme e-commerce B2B SaaS. Spécialisé dans l'Order Management System (OMS), les paiements multi-PSP (Adyen, Mangopay, Lemonway) et l'architecture modulaire Java/Spring Boot. Je combine leadership technique et management d'équipe (6 ingénieurs) pour livrer des produits fiables à grande échelle. Pionnier dans l'intégration de l'IA générative (Claude Code) dans le workflow de développement quotidien."
          : "Hands-on Engineering Manager with 13 years of software development experience, including 4+ years designing and scaling a B2B SaaS e-commerce platform. Specialized in Order Management System (OMS), multi-PSP payments (Adyen, Mangopay, Lemonway), and modular Java/Spring Boot architecture. I combine technical leadership and team management (6 engineers) to deliver reliable products at scale. Pioneer in integrating generative AI (Claude Code) into the daily development workflow."
        }}</p>
      </div>

      <!-- Skills -->
      <div class="cv-section">
        <div class="cv-section-title">{{ locale === 'fr' ? 'Compétences' : 'Skills' }}</div>
        <ul class="cv-skills">
          <li><strong>Backend & Architecture :</strong> Java 17+, Spring Boot, Spring Security, JPA/Hibernate, REST API, GraphQL, OpenAPI/Swagger, Maven, Node.js.</li>
          <li><strong>Data & Infrastructure :</strong> PostgreSQL, Elasticsearch, MongoDB, Redis, Docker, Kubernetes, GCP, AWS (SQS, S3), GitLab CI/CD, Jenkins, Ansible, Keycloak.</li>
          <li><strong>{{ locale === 'fr' ? 'Domaine métier' : 'Business Domain' }} :</strong> Order Management (OMS), Payments (Adyen, Mangopay, Lemonway, Thunes), Cart & Checkout, E-commerce B2B SaaS.</li>
          <li><strong>Management :</strong> Team Lead (6 devs), {{ locale === 'fr' ? 'Recrutement' : 'Hiring' }}, People Review, Agile/Scrum, SAFe, Kanban, Incident Management.</li>
          <li><strong>Frontend & Mobile :</strong> Nuxt 4/Vue.js, TypeScript, Android (Java), iOS (Swift).</li>
          <li><strong>AI-Augmented Dev :</strong> Claude Code, MCP Servers, Custom AI Skills, Automated Reviews.</li>
        </ul>
      </div>

      <!-- Experiences -->
      <div class="cv-section">
        <div class="cv-section-title">{{ locale === 'fr' ? 'Expériences professionnelles' : 'Professional Experience' }}</div>
        <div v-for="exp in experiences" :key="exp.id" class="cv-exp">
          <div class="cv-exp-role">{{ locale === 'fr' ? exp.roleFr : exp.roleEn }}</div>
          <div class="cv-exp-company">{{ exp.company }} — {{ exp.dateStart }} - {{ exp.dateEnd || (locale === 'fr' ? 'Présent' : 'Present') }}</div>
          <ul class="cv-exp-bullets">
            <li v-for="(b, i) in (locale === 'fr' ? exp.bulletsFr : exp.bulletsEn)" :key="i" v-html="b" />
          </ul>
        </div>
      </div>

      <!-- Education -->
      <div class="cv-section">
        <div class="cv-section-title">{{ locale === 'fr' ? 'Formation' : 'Education' }}</div>
        <div class="cv-edu">
          <div><strong>2008 - 2013 : {{ locale === 'fr' ? "Expert en Technologies de l'Information (BAC+5)" : "IT Expert Degree (Master's level)" }}</strong><br>
          <span class="cv-edu-school">EPITECH - European Institute of Technology, Paris</span></div>
          <div><strong>2011 - 2012 : Master's degree, Computer Software Engineering</strong><br>
          <span class="cv-edu-school">Beijing Jiaotong University, {{ locale === 'fr' ? 'Pékin (Chine)' : 'Beijing (China)' }}</span></div>
          <div><strong>2018 : Takima Academy</strong><br>
          <span class="cv-edu-school">Java, Angular, Spring, Hibernate, Docker, Ansible, Jenkins</span></div>
          <div><strong>Certification : Oracle Certified Associate, Java SE 8 Programmer</strong></div>
        </div>
      </div>

      <!-- Languages -->
      <div class="cv-section">
        <div class="cv-section-title">{{ locale === 'fr' ? 'Langues & Intérêts' : 'Languages & Interests' }}</div>
        <p>{{ locale === 'fr'
          ? 'Langues : Français (natif), Cambodgien (langue maternelle), Anglais (professionnel - TOEIC), Chinois mandarin (scolaire), Espagnol (scolaire).'
          : 'Languages: French (native), Cambodian (mother tongue), English (professional - TOEIC), Mandarin Chinese (academic), Spanish (academic).'
        }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, toggleLocale } = useLocale()

const { data: experiences } = await useFetch('/api/experiences', { default: () => [] })

function printCV() {
  window.print()
}

useSeoMeta({
  title: 'CV Chetana YIN - Engineering Manager',
  robots: 'noindex, nofollow'
})

defineRouteRules({
  robots: false
})
</script>

<style scoped>
.cv-page {
  padding-top: 5rem;
  background: var(--bg);
  min-height: 100vh;
}

.cv-container {
  max-width: 210mm;
  margin: 0 auto;
  padding: 2rem;
  background: #fff;
  color: #1a1a1a;
  font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;
  font-size: 10.5pt;
  line-height: 1.5;
}

.cv-actions {
  float: right;
  display: flex;
  gap: 6px;
}

.cv-btn {
  padding: 8px 16px;
  background: #1a1a1a;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 10pt;
  cursor: pointer;
  font-family: inherit;
}

.cv-btn:hover { background: #333; }

.cv-header h1 { font-size: 22pt; font-weight: 700; color: #000; }
.cv-subtitle { font-size: 12pt; font-weight: 700; color: #333; margin-bottom: 4px; }
.cv-contact { font-size: 9.5pt; color: #444; line-height: 1.6; }
.cv-contact a { color: #1a0dab; }

.cv-section { margin-top: 16px; }
.cv-section-title {
  font-size: 11.5pt;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #000;
  border-bottom: 1.5px solid #000;
  padding-bottom: 3px;
  margin-bottom: 10px;
}

.cv-profil { text-align: justify; color: #333; }
.cv-skills { padding-left: 18px; }
.cv-skills li { margin-bottom: 3px; }
.cv-skills li :deep(strong) { color: #000; }

.cv-exp { margin-bottom: 14px; }
.cv-exp-role { font-size: 11pt; font-weight: 700; color: #000; }
.cv-exp-company { font-size: 10pt; color: #444; margin-bottom: 4px; }
.cv-exp-bullets { padding-left: 18px; }
.cv-exp-bullets li { margin-bottom: 2px; text-align: justify; }
.cv-exp-bullets li :deep(strong) { color: #000; }

.cv-edu { display: flex; flex-direction: column; gap: 8px; }
.cv-edu-school { color: #444; font-size: 10pt; }

@media print {
  .cv-page { padding-top: 0; background: #fff; }
  .cv-actions { display: none; }
  .cv-container { padding: 10mm 15mm; }
}

@page { size: A4; margin: 10mm 15mm; }
</style>
