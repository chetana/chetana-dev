<template>
  <div class="section" style="padding-top: 8rem;">
    <div class="section-label">Contact</div>
    <h1 class="section-title">{{ t('contact.title') }}</h1>

    <div class="contact-layout">
      <!-- Contact info -->
      <div class="contact-info">
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

      <!-- Message form -->
      <form class="contact-form" @submit.prevent="sendMessage">
        <div class="form-group">
          <label>{{ t('contact.name') }}</label>
          <input v-model="form.name" type="text" required maxlength="100" />
        </div>
        <div class="form-group">
          <label>{{ t('contact.email') }}</label>
          <input v-model="form.email" type="email" required maxlength="255" />
        </div>
        <!-- Honeypot -->
        <div class="hp-field">
          <input v-model="form.website" type="text" tabindex="-1" autocomplete="off" />
        </div>
        <div class="form-group">
          <label>{{ t('contact.message') }}</label>
          <textarea v-model="form.content" required maxlength="5000" rows="6" />
        </div>
        <button type="submit" class="btn btn-primary" :disabled="sending">
          {{ t('contact.send') }}
        </button>
        <p v-if="sent" class="success-msg">{{ t('contact.sent') }}</p>
        <p v-if="error" class="error-msg">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, t } = useLocale()

const form = reactive({ name: '', email: '', content: '', website: '' })
const sending = ref(false)
const sent = ref(false)
const error = ref('')

async function sendMessage() {
  sending.value = true
  error.value = ''
  try {
    await $fetch('/api/messages', {
      method: 'POST',
      body: form
    })
    sent.value = true
    form.name = ''
    form.email = ''
    form.content = ''
  } catch (e: any) {
    error.value = e.data?.message || 'An error occurred'
  } finally {
    sending.value = false
  }
}

const description = computed(() => locale.value === 'fr'
  ? 'Contactez Chetana YIN \u2014 Engineering Manager disponible pour de nouvelles opportunit\u00e9s.'
  : 'Contact Chetana YIN \u2014 Engineering Manager open to new opportunities.'
)

useSeoMeta({
  title: 'Contact \u2014 Chetana YIN',
  description,
  ogTitle: 'Contact \u2014 Chetana YIN',
  ogDescription: description,
  ogType: 'website'
})
</script>

<style scoped>
.contact-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  align-items: start;
}

.contact-info { display: flex; flex-direction: column; gap: 1rem; }

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

.contact-form {
  padding: 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.success-msg { color: #48c68b; font-size: 0.9rem; margin-top: 1rem; }
.error-msg { color: #ef4848; font-size: 0.9rem; margin-top: 1rem; }

@media (max-width: 768px) {
  .contact-layout { grid-template-columns: 1fr; }
}
</style>
