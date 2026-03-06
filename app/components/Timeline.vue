<template>
  <div class="timeline">
    <div
      v-for="(exp, i) in experiences"
      :key="exp.id"
      class="timeline-item"
      :class="{ current: i === 0 }"
    >
      <div class="timeline-date">{{ formatDate(exp.dateStart) }} - {{ exp.dateEnd ? formatDate(exp.dateEnd) : (locale === 'fr' ? 'Présent' : locale === 'en' ? 'Present' : 'បច្ចុប្បន្ន') }}</div>
      <div class="timeline-company">{{ exp.company }} - {{ exp.location }}</div>
      <div class="timeline-role">{{ localeField(exp, 'role') }}</div>
      <div class="timeline-desc">
        <ul>
          <li
            v-for="(bullet, j) in localeArrayField(exp, 'bullets')"
            :key="j"
            v-html="bullet"
          />
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale, localeField } = useLocale()

defineProps<{
  experiences: Array<Record<string, any> & {
    id: number
    company: string
    roleFr: string
    roleEn: string
    dateStart: string
    dateEnd: string | null
    location: string | null
    bulletsFr: string[]
    bulletsEn: string[]
  }>
}>()

function localeArrayField(obj: Record<string, any>, field: string): string[] {
  const suffix = locale.value === 'fr' ? 'Fr' : locale.value === 'en' ? 'En' : 'Km'
  return obj[field + suffix] || obj[field + 'Fr'] || []
}

function formatDate(d: string): string {
  const [year, month] = d.split('-')
  const months: Record<string, Record<string, string>> = {
    '01': { fr: 'Jan', en: 'Jan', km: 'មករា' }, '02': { fr: 'Fév', en: 'Feb', km: 'កុម្ភៈ' },
    '03': { fr: 'Mar', en: 'Mar', km: 'មីនា' }, '04': { fr: 'Avr', en: 'Apr', km: 'មេសា' },
    '05': { fr: 'Mai', en: 'May', km: 'ឧសភា' }, '06': { fr: 'Juin', en: 'Jun', km: 'មិថុនា' },
    '07': { fr: 'Juil', en: 'Jul', km: 'កក្កដា' }, '08': { fr: 'Août', en: 'Aug', km: 'សីហា' },
    '09': { fr: 'Sep', en: 'Sep', km: 'កញ្ញា' }, '10': { fr: 'Oct', en: 'Oct', km: 'តុលា' },
    '11': { fr: 'Nov', en: 'Nov', km: 'វិច្ឆិកា' }, '12': { fr: 'Déc', en: 'Dec', km: 'ធ្នូ' }
  }
  const lang = locale.value
  return `${months[month]?.[lang] || month} ${year}`
}
</script>

<style scoped>
.timeline { position: relative; }

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, var(--accent) 0%, var(--border) 100%);
  opacity: 0.5;
}

.timeline-item {
  position: relative;
  padding-left: 3rem;
  margin-bottom: 3rem;
  transition: transform 0.22s ease;
}

.timeline-item:hover {
  transform: translateX(3px);
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -5px;
  top: 8px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  border: 3px solid var(--bg);
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}

.timeline-item:hover::before {
  transform: scale(1.2);
  box-shadow: 0 0 0 4px rgba(196,150,60,0.25);
}

.timeline-item.current::before {
  box-shadow: 0 0 0 4px rgba(196, 150, 60, 0.3);
  animation: pulse 2.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 4px rgba(196,150,60,0.3); }
  50% { box-shadow: 0 0 0 7px rgba(196,150,60,0.12); }
}

.timeline-date {
  font-size: 0.78rem;
  color: var(--accent);
  margin-bottom: 0.3rem;
  font-weight: 600;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

.timeline-company {
  font-size: 0.85rem;
  color: var(--text-dim);
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.timeline-role {
  font-size: 1.15rem;
  font-weight: 700;
  margin-bottom: 0.6rem;
  color: var(--text);
}

.timeline-desc { color: var(--text-muted); font-size: 0.9rem; }

.timeline-desc ul { list-style: none; padding: 0; }

.timeline-desc li {
  position: relative;
  padding-left: 1.2rem;
  margin-bottom: 0.4rem;
  line-height: 1.6;
}

.timeline-desc li::before {
  content: '›';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-size: 1.1rem;
  line-height: 1.55;
  font-weight: bold;
}
</style>
