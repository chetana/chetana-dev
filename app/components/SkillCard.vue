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
  padding: 2rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: all 0.3s;
}

.skill-card:hover { border-color: var(--accent); transform: translateY(-4px); }

.skill-card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon { font-size: 1.3rem; }
</style>
