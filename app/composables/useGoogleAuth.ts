// Google Identity Services composable
// Manages Google ID Token lifecycle for the health page

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void
          prompt: (callback?: (notification: { isNotDisplayed: () => boolean; isSkippedMoment: () => boolean }) => void) => void
          renderButton: (element: HTMLElement, config: object) => void
          disableAutoSelect: () => void
          revoke: (hint: string, callback: () => void) => void
        }
      }
    }
  }
}

const TOKEN_KEY = 'google_id_token'
const USER_EMAIL_KEY = 'google_user_email'
const USER_NAME_KEY = 'google_user_name'

export function useGoogleAuth() {
  const config = useRuntimeConfig()
  const token = ref<string | null>(null)
  const userEmail = ref<string | null>(null)
  const userName = ref<string | null>(null)
  const isReady = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  function loadFromStorage() {
    if (import.meta.server) return
    token.value = localStorage.getItem(TOKEN_KEY)
    userEmail.value = localStorage.getItem(USER_EMAIL_KEY)
    userName.value = localStorage.getItem(USER_NAME_KEY)
  }

  function saveToStorage(idToken: string, email: string, name: string) {
    localStorage.setItem(TOKEN_KEY, idToken)
    localStorage.setItem(USER_EMAIL_KEY, email)
    localStorage.setItem(USER_NAME_KEY, name)
    token.value = idToken
    userEmail.value = email
    userName.value = name
  }

  function clearStorage() {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_EMAIL_KEY)
    localStorage.removeItem(USER_NAME_KEY)
    token.value = null
    userEmail.value = null
    userName.value = null
  }

  function getAuthHeaders(): Record<string, string> {
    if (!token.value) return {}
    return { Authorization: `Bearer ${token.value}` }
  }

  function handleCredentialResponse(response: { credential: string }) {
    try {
      // Decode JWT payload (no verification needed here — server verifies)
      const payload = JSON.parse(atob(response.credential.split('.')[1]))
      saveToStorage(response.credential, payload.email ?? '', payload.name ?? '')
    } catch {
      console.error('[GoogleAuth] Failed to decode token')
    }
  }

  function initGIS(buttonEl?: HTMLElement | null) {
    if (!window.google?.accounts?.id) return

    window.google.accounts.id.initialize({
      client_id: config.public.googleClientId,
      callback: handleCredentialResponse,
      auto_select: true,
      cancel_on_tap_outside: false
    })

    if (buttonEl) {
      window.google.accounts.id.renderButton(buttonEl, {
        type: 'standard',
        shape: 'rectangular',
        theme: 'outline',
        text: 'sign_in_with',
        size: 'large',
        locale: 'en'
      })
    }

    // Show One Tap if not already signed in
    if (!token.value) {
      window.google.accounts.id.prompt()
    }

    isReady.value = true
  }

  function signOut() {
    if (window.google?.accounts?.id && userEmail.value) {
      window.google.accounts.id.disableAutoSelect()
    }
    clearStorage()
  }

  // Call this when a 401 is received — clears token and re-prompts
  function handleUnauthorized() {
    clearStorage()
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt()
    }
  }

  return {
    token,
    userEmail,
    userName,
    isAuthenticated,
    isReady,
    loadFromStorage,
    getAuthHeaders,
    initGIS,
    signOut,
    handleUnauthorized
  }
}
