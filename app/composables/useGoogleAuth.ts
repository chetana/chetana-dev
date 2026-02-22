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
const REFRESH_MARGIN_MS = 5 * 60 * 1000 // refresh 5 min before expiry

export function useGoogleAuth() {
  const config = useRuntimeConfig()
  const token = ref<string | null>(null)
  const userEmail = ref<string | null>(null)
  const userName = ref<string | null>(null)
  const isReady = ref(false)

  const isAuthenticated = computed(() => !!token.value)

  let refreshTimer: ReturnType<typeof setTimeout> | null = null

  // Decode exp (unix seconds) from JWT payload
  function getTokenExpiry(jwt: string): number {
    try {
      const base64 = jwt.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const payload = JSON.parse(new TextDecoder().decode(bytes))
      return payload.exp ?? 0
    } catch {
      return 0
    }
  }

  function scheduleRefresh(expSec: number) {
    if (refreshTimer) clearTimeout(refreshTimer)
    const msUntilRefresh = expSec * 1000 - Date.now() - REFRESH_MARGIN_MS
    if (msUntilRefresh <= 0) {
      // Already expired or about to — prompt immediately
      silentRefresh()
      return
    }
    refreshTimer = setTimeout(silentRefresh, msUntilRefresh)
  }

  function silentRefresh() {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.prompt()
    }
  }

  function loadFromStorage() {
    if (import.meta.server) return
    const stored = localStorage.getItem(TOKEN_KEY)
    if (!stored) return

    // Check if already expired
    const exp = getTokenExpiry(stored)
    if (exp && exp * 1000 < Date.now()) {
      // Token expired — clear and re-prompt after GIS is ready
      localStorage.removeItem(TOKEN_KEY)
      localStorage.removeItem(USER_EMAIL_KEY)
      localStorage.removeItem(USER_NAME_KEY)
      return
    }

    token.value = stored
    userEmail.value = localStorage.getItem(USER_EMAIL_KEY)
    userName.value = localStorage.getItem(USER_NAME_KEY)

    if (exp) scheduleRefresh(exp)
  }

  function saveToStorage(idToken: string, email: string, name: string) {
    localStorage.setItem(TOKEN_KEY, idToken)
    localStorage.setItem(USER_EMAIL_KEY, email)
    localStorage.setItem(USER_NAME_KEY, name)
    token.value = idToken
    userEmail.value = email
    userName.value = name

    const exp = getTokenExpiry(idToken)
    if (exp) scheduleRefresh(exp)
  }

  function clearStorage() {
    if (refreshTimer) { clearTimeout(refreshTimer); refreshTimer = null }
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
      const base64 = response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
      const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0))
      const payload = JSON.parse(new TextDecoder().decode(bytes))
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
