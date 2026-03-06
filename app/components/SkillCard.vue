<template>
  <div class="skill-card">
    <div class="skill-card-title">
      <span class="icon">{{ icon }}</span> {{ title }}
    </div>
    <div class="tags">
      <span v-for="skill in skills" :key="skill.name" class="tag" :class="skill.color">
        {{ skill.name }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  icon: string
  skills: Array<{ name: string; color: string }>
}>()
</script>

<style scoped>
.skill-card {
  padding: 1.75rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: var(--radius, 14px);
  transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
  box-shadow: var(--shadow-sm);
}

.skill-card:hover {
  border-color: rgba(196,150,60,0.45);
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.skill-card-title {
  font-size: 1.05rem;
  font-weight: 700;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.icon {
  font-size: 1.4rem;
  transition: transform 0.22s ease;
}

.skill-card:hover .icon {
  transform: scale(1.15) rotate(-3deg);
}
</style>
