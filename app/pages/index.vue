<template>
  <div>
    <!-- Hero -->
    <Hero />

    <!-- Stats -->
    <div class="stats">
      <div class="stat">
        <div class="stat-number">13+</div>
        <div class="stat-label">{{ t('stat.years') }}</div>
      </div>
      <div class="stat">
        <div class="stat-number">6</div>
        <div class="stat-label">{{ t('stat.engineers') }}</div>
      </div>
      <div class="stat">
        <div class="stat-number">4+</div>
        <div class="stat-label">{{ t('stat.djust') }}</div>
      </div>
      <div class="stat">
        <div class="stat-number">B2B</div>
        <div class="stat-label">E-commerce at scale</div>
      </div>
    </div>

    <!-- About -->
    <section id="about" class="section">
      <div class="section-label">{{ t('about.label') }}</div>
      <h2 class="section-title">{{ t('about.title') }}</h2>
      <div class="about-grid">
        <div class="about-text">
          <p><strong>{{ locale === 'fr' ? 'Je ne suis pas le manager qui regarde des dashboards.' : "I'm not the manager who stares at dashboards." }}</strong> {{ t('about.p1').replace(/^[^.]+\.\s*/, '') }}</p>
          <p v-html="t('about.p2')" />
          <p>{{ t('about.p3') }}</p>
        </div>
        <div class="about-highlights">
          <div v-for="i in 4" :key="i" class="highlight">
            <div class="highlight-title">{{ t(`about.hl${i}.title`) }}</div>
            <div class="highlight-desc">{{ t(`about.hl${i}.desc`) }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Experience -->
    <section id="experience" class="section">
      <div class="section-label">{{ t('exp.label') }}</div>
      <h2 class="section-title">{{ t('exp.title') }}</h2>
      <Timeline v-if="experiences" :experiences="experiences" />
    </section>

    <!-- Skills -->
    <section id="skills" class="section">
      <div class="section-label">{{ t('skills.label') }}</div>
      <h2 class="section-title">{{ t('skills.title') }}</h2>
      <div class="skills-grid">
        <SkillCard title="Backend" icon="⚙" :skills="skillsByCategory['Backend'] || []" />
        <SkillCard title="Data & Infra" icon="🗃" :skills="skillsByCategory['Data & Infra'] || []" />
        <SkillCard :title="t('skills.business')" icon="💰" :skills="skillsByCategory['Domaine métier'] || []" />
        <SkillCard title="Management" icon="👥" :skills="skillsByCategory['Management'] || []" />
        <SkillCard title="Frontend & Mobile" icon="🌐" :skills="skillsByCategory['Frontend & Mobile'] || []" />
        <SkillCard title="AI-Augmented Dev" icon="🤖" :skills="skillsByCategory['AI-Augmented Dev'] || []" />
      </div>

      <!-- AI Section -->
      <div class="ai-section">
        <h3>AI-Augmented Engineering</h3>
        <p>{{ t('ai.p1') }}</p>
        <p>{{ t('ai.p2') }}</p>
        <div class="ai-metrics">
          <div class="ai-metric">
            <div class="ai-metric-value">25+</div>
            <div class="ai-metric-label">Custom AI skills</div>
          </div>
          <div class="ai-metric">
            <div class="ai-metric-value">13</div>
            <div class="ai-metric-label">{{ t('ai.m2') }}</div>
          </div>
          <div class="ai-metric">
            <div class="ai-metric-value">6/6</div>
            <div class="ai-metric-label">{{ t('ai.m3') }}</div>
          </div>
          <div class="ai-metric">
            <div class="ai-metric-value">TDD</div>
            <div class="ai-metric-label">AI-assisted workflow</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Education -->
    <section id="education" class="section">
      <div class="section-label">{{ t('edu.label') }}</div>
      <h2 class="section-title">Education</h2>
      <div class="grid-2">
        <div class="edu-card">
          <div class="edu-school">EPITECH</div>
          <div class="edu-degree">{{ t('edu.epitech') }}</div>
          <div class="edu-year">2008 - 2013 | Paris</div>
        </div>
        <div class="edu-card">
          <div class="edu-school">Beijing Jiaotong University</div>
          <div class="edu-degree">Master's degree, Computer Software Engineering</div>
          <div class="edu-year">{{ t('edu.beijing.year') }}</div>
        </div>
      </div>
      <div class="grid-2" style="margin-top: 1.5rem;">
        <div class="edu-card">
          <div class="edu-school">Takima Academy</div>
          <div class="edu-degree">Java, Angular, Spring, Hibernate, Docker, Ansible, Jenkins</div>
          <div class="edu-year">2018</div>
        </div>
        <div class="edu-card">
          <div class="edu-school">Oracle Certified Associate</div>
          <div class="edu-degree">Java SE 8 Programmer</div>
        </div>
      </div>
    </section>

    <!-- Contact (mini) -->
    <section id="contact" class="section">
      <div class="section-label">Contact</div>
      <h2 class="section-title">{{ t('contact.title') }}</h2>
      <div class="contact-grid">
        <a href="mailto:chetana.yin@gmail.com" class="contact-item">
          <span class="contact-icon">✉</span>
          <div>
            <div class="contact-label">Email</div>
            <div class="contact-value">chetana.yin@gmail.com</div>
          </div>
        </a>
        <a href="https://www.linkedin.com/in/chetana-yin-79b36754/" target="_blank" class="contact-item">
          <span class="contact-icon">🔗</span>
          <div>
            <div class="contact-label">LinkedIn</div>
            <div class="contact-value">linkedin.com/in/chetana-yin</div>
          </div>
        </a>
        <a href="tel:+33651253580" class="contact-item">
          <span class="contact-icon">📞</span>
          <div>
            <div class="contact-label">{{ t('contact.phone') }}</div>
            <div class="contact-value">06 51 25 35 80</div>
          </div>
        </a>
        <div class="contact-item">
          <span class="contact-icon">📍</span>
          <div>
            <div class="contact-label">{{ t('contact.location') }}</div>
            <div class="contact-value">{{ t('contact.location.value') }}</div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
const { locale, t } = useLocale()

const { data: experiences } = await useFetch('/api/experiences', { default: () => [] })
const { data: skillsByCategory } = await useFetch<Record<string, Array<{ name: string; color: string }>>>('/api/skills', { default: () => ({}) })

const description = computed(() => locale.value === 'fr'
  ? "Engineering Manager & hands-on tech lead avec 13 ans d'exp\u00e9rience. Portfolio, projets et blog technique."
  : 'Engineering Manager & hands-on tech lead with 13 years of experience. Portfolio, projects and technical blog.'
)

useSeoMeta({
  title: 'Chetana YIN \u2014 Engineering Manager',
  description,
  ogTitle: 'Chetana YIN \u2014 Engineering Manager',
  ogDescription: description,
  ogType: 'website',
  twitterCard: 'summary',
  twitterTitle: 'Chetana YIN \u2014 Engineering Manager',
  twitterDescription: description
})
</script>

<style scoped>
/* Stats */
.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 4rem;
  padding: 0 2rem;
  max-width: 1100px;
  margin-left: auto;
  margin-right: auto;
}

.stat {
  text-align: center;
  padding: 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 800;
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label { color: var(--text-muted); font-size: 0.9rem; margin-top: 0.3rem; }

/* About */
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

.about-text p { color: var(--text-muted); margin-bottom: 1.2rem; }
.about-text p :deep(strong) { color: var(--text); }

.about-highlights { display: grid; gap: 1rem; }

.highlight {
  padding: 1.2rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  transition: all 0.3s;
}

.highlight:hover { border-color: var(--accent); transform: translateX(4px); }
.highlight-title { font-weight: 600; margin-bottom: 0.2rem; }
.highlight-desc { font-size: 0.85rem; color: var(--text-muted); }

/* Skills grid */
.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* AI section */
.ai-section {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 3rem;
  margin-top: 2rem;
}

.ai-section h3 { font-size: 1.3rem; margin-bottom: 1rem; }
.ai-section p { color: var(--text-muted); margin-bottom: 1rem; }

.ai-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
}

.ai-metric { padding: 1rem; background: var(--bg); border-radius: 8px; text-align: center; }
.ai-metric-value { font-size: 1.5rem; font-weight: 700; color: var(--accent-light); }
.ai-metric-label { font-size: 0.8rem; color: var(--text-muted); }

/* Education */
.edu-card {
  padding: 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.edu-school { font-weight: 600; font-size: 1.1rem; margin-bottom: 0.3rem; }
.edu-degree { color: var(--text-muted); font-size: 0.9rem; }
.edu-year { color: var(--text-dim); font-size: 0.85rem; margin-top: 0.5rem; }

/* Contact grid */
.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.2rem 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  text-decoration: none;
  color: var(--text);
  transition: all 0.3s;
}

.contact-item:hover { border-color: var(--accent); transform: translateY(-2px); }
.contact-icon { font-size: 1.5rem; }
.contact-label { font-size: 0.8rem; color: var(--text-muted); }
.contact-value { font-size: 0.95rem; }

@media (max-width: 768px) {
  .about-grid { grid-template-columns: 1fr; }
  .stats { padding: 0 1.5rem; }
}
</style>
