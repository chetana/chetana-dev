<template>
  <div class="comments-section">
    <h3>{{ t('comments.title') }}</h3>

    <!-- Comment form -->
    <form class="comment-form" @submit.prevent="submitComment">
      <div class="form-group">
        <label>{{ t('comments.name') }}</label>
        <input v-model="form.authorName" type="text" required maxlength="100" />
      </div>
      <div class="form-group">
        <label>{{ t('comments.content') }}</label>
        <textarea v-model="form.content" required maxlength="2000" rows="4" />
      </div>
      <button type="submit" class="btn btn-primary" :disabled="submitting">
        {{ t('comments.submit') }}
      </button>
      <p v-if="submitted" class="success-msg">{{ t('comments.pending') }}</p>
    </form>

    <!-- Comments list -->
    <div v-if="comments.length" class="comments-list">
      <div v-for="comment in comments" :key="comment.id" class="comment">
        <div class="comment-header">
          <strong>{{ comment.authorName }}</strong>
          <span class="comment-date">{{ new Date(comment.createdAt).toLocaleDateString() }}</span>
        </div>
        <p>{{ comment.content }}</p>
      </div>
    </div>
    <p v-else class="empty-msg">{{ t('comments.empty') }}</p>
  </div>
</template>

<script setup lang="ts">
const { t } = useLocale()

const props = defineProps<{ postId: number }>()

const form = reactive({ authorName: '', content: '' })
const submitting = ref(false)
const submitted = ref(false)

const { data: comments, refresh } = await useFetch<Array<{
  id: number
  authorName: string
  content: string
  createdAt: string
}>>(`/api/comments/${props.postId}`, { default: () => [] })

async function submitComment() {
  submitting.value = true
  try {
    await $fetch('/api/comments', {
      method: 'POST',
      body: { postId: props.postId, ...form }
    })
    submitted.value = true
    form.authorName = ''
    form.content = ''
    await refresh()
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.comments-section { margin-top: 4rem; }

h3 { font-size: 1.3rem; margin-bottom: 2rem; }

.comment-form { margin-bottom: 2rem; }

.comments-list { display: flex; flex-direction: column; gap: 1rem; }

.comment {
  padding: 1.5rem;
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.comment-date { font-size: 0.8rem; color: var(--text-muted); }

.comment p { color: var(--text-muted); font-size: 0.9rem; }

.success-msg { color: #48c68b; font-size: 0.9rem; margin-top: 1rem; }
.empty-msg { color: var(--text-dim); font-size: 0.9rem; }
</style>
