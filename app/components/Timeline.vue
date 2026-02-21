<template>
  <div class="timeline">
    <div
      v-for="(exp, i) in experiences"
      :key="exp.id"
      class="timeline-item"
      :class="{ current: i === 0 }"
    >
      <div class="timeline-date">{{ formatDate(exp.dateStart) }} - {{ exp.dateEnd ? formatDate(exp.dateEnd) : (locale === 'fr' ? 'Présent' : 'Present') }}</div>
      <div class="timeline-company">{{ exp.company }} - {{ exp.location }}</div>
      <div class="timeline-role">{{ locale === 'fr' ? exp.roleFr : exp.roleEn }}</div>
      <div class="timeline-desc">
        <ul>
          <li
            v-for="(bullet, j) in (locale === 'fr' ? exp.bulletsFr : exp.bulletsEn)"
            :key="j"
            v-html="bullet"
          />
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const { locale } = useLocale()

defineProps<{
  experiences: Array<{
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

function formatDate(d: string): string {
  const [year, month] = d.split('-')
  const months: Record<string, Record<string, string>> = {
    '01': { fr: 'Jan', en: 'Jan' }, '02': { fr: 'Fév', en: 'Feb' },
    '03': { fr: 'Mar', en: 'Mar' }, '04': { fr: 'Avr', en: 'Apr' },
    '05': { fr: 'Mai', en: 'May' }, '06': { fr: 'Juin', en: 'Jun' },
    '07': { fr: 'Juil', en: 'Jul' }, '08': { fr: 'Août', en: 'Aug' },
    '09': { fr: 'Sep', en: 'Sep' }, '10': { fr: 'Oct', en: 'Oct' },
    '11': { fr: 'Nov', en: 'Nov' }, '12': { fr: 'Déc', en: 'Dec' }
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
  background: var(--border);
}

.timeline-item {
  position: relative;
  padding-left: 3rem;
  margin-bottom: 3rem;
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
}

.timeline-item.current::before {
  box-shadow: 0 0 0 4px rgba(196, 150, 60, 0.3);
}

.timeline-date {
  font-size: 0.8rem;
  color: var(--accent-light);
  margin-bottom: 0.3rem;
}

.timeline-company {
  font-size: 0.85rem;
  color: var(--text-dim);
  margin-bottom: 0.2rem;
}

.timeline-role {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.timeline-desc { color: var(--text-muted); font-size: 0.9rem; }

.timeline-desc ul { list-style: none; padding: 0; }

.timeline-desc li {
  position: relative;
  padding-left: 1.2rem;
  margin-bottom: 0.4rem;
}

.timeline-desc li::before {
  content: '>';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-family: monospace;
  font-weight: bold;
}
</style>
