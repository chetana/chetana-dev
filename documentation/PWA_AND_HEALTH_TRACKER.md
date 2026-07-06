# 📱 PWA & Health Tracker — Installation & Architecture

**Date** : 21 février 2026  
**Version** : 1.0.0

---

## 📖 Table des matières

1. [📱 Installation PWA](#installation-pwa)
2. [🏗️ Architecture du Health Tracker](#architecture-du-health-tracker)
3. [📊 Fichiers et structure](#fichiers-et-structure)
4. [💾 Base de données](#base-de-données)
5. [🔌 API Endpoints](#api-endpoints)
6. [🔔 Web Push Notifications](#web-push-notifications)
7. [🎨 UI/UX & Composants](#uiux--composants)
8. [🐛 Dépannage](#dépannage)

---

## 📱 Installation PWA

### Qu'est-ce qu'une PWA ?

Une **Progressive Web App** est une application web qui :

- ✅ S'installe sur le téléphone comme une app native
- ✅ Fonctionne offline (service worker cache)
- ✅ A une icône sur l'écran d'accueil
- ✅ Supporte les notifications push
- ✅ A une barre de status personnalisée
- ✅ Se lance en fullscreen (sans URL bar)

**Avantages** :
- 📦 Pas besoin de l'App Store
- ⚡ Très rapide au démarrage
- 🔄 Mise à jour automatique
- 📴 Fonctionne offline

---

### Comment installer sur Android

#### 📋 Prérequis

- ✅ Android 5.0+
- ✅ Chrome, Edge, ou navigateur compatible
- ✅ Connexion internet (pour le premier téléchargement)

#### 🚀 Installation (4 étapes)

**Étape 1 : Ouvrir l'app**

```
1. Ouvre https://chetana.fr/ dans ton navigateur
2. Clique sur le projet "Health" (cards avec les 4 cartes)
3. La page se charge → tu vois le tracker de pompes
```

**Étape 2 : Attendre le service worker**

```
1. La page a besoin de 5-10 secondes pour charger
2. Le service worker s'enregistre en arrière-plan
3. Tu peux checker la console du navigateur (F12)
4. Tu devrais voir : "Service Worker registered"
```

**Étape 3 : Menu d'installation**

```
Android Chrome :
1. Menu 3 points (⋮) en haut à droite
2. Cherche "Installer l'application" ou "Ajouter à l'écran d'accueil"
3. Android Edge :
   Menu 3 points (⋮) → "Installer cette application"
4. Appuyer sur "Installer" ou "Ajouter"
```

**Étape 4 : Vérifier l'installation**

```
1. L'app apparaît sur l'écran d'accueil (icône "Health")
2. Clique sur l'icône
3. L'app se lance en fullscreen (pas de URL bar)
4. Tu vois le tracker de pompes avec :
   - 4 cartes de stats (streak, total, jours, best)
   - Stepper pour les pompes
   - Calendar interactif
   - Toggle pour les notifications push
```

---

### Installation sur iOS/iPad

#### 📋 Prérequis

- ✅ iOS 14.7+
- ✅ Safari (à partir de iOS 15.1 pour les notifications push)
- ✅ Pas besoin de jailbreak

#### 🚀 Installation

**Étape 1 : Ouvrir Safari**

```
1. Ouvre Safari (pas Chrome)
2. Va sur https://chetana.fr/
3. Clique sur le projet "Health"
4. Attends 5-10 secondes (service worker)
```

**Étape 2 : Menu de partage**

```
1. Bouton "Partager" (carré avec flèche) en bas
2. Scroll down
3. Appuie sur "Ajouter à l'écran d'accueil"
4. Tu vas à l'écran de personnalisation
5. Change le nom si tu veux, puis "Ajouter"
```

**Étape 3 : L'app est prête**

```
1. L'app apparaît sur l'écran d'accueil (icône "Health")
2. Clique pour lancer
3. Se lance en fullscreen
4. Notifications push supportées (iOS 15.1+)
```

---

### Vérifier que la PWA fonctionne

**Dans le navigateur (F12)** :

```
1. Appuie sur F12 (DevTools)
2. Onglet "Application" (Chrome) ou "Storage" (Firefox)
3. Section "Service Workers"
4. Tu devrais voir : "Service Worker registered" ✅
```

**Offline mode** :

```
1. Installe l'app sur le téléphone
2. Éteins la WiFi et les données mobiles
3. Ouvre l'app
4. Tu peux voir les données précédentes (cached)
5. Certaines features offline peuvent être limitées
```

**Notifications push** :

```
1. Dans l'app, tu vois un toggle "Push Notifications"
2. Clique pour s'abonner
3. L'app demande la permission
4. Si activé, tu reçois les notifications

Note : Faut que le serveur soit activé pour recevoir
```

---

## 🏗️ Architecture du Health Tracker

### Vue d'ensemble

Le Health Tracker est un système complet pour tracker les pompes quotidiennement :

```
┌─────────────────────────────────────────┐
│ Frontend (Vue.js)                       │
│ app/pages/projects/health.vue          │
│ - 4 Stats Cards (streak, total, etc)   │
│ - Stepper (1-200 pompes)               │
│ - Calendar interactif                  │
│ - Push notification toggle             │
└────────────┬────────────────────────────┘
             │ API calls
             ↓
┌─────────────────────────────────────────┐
│ Backend (Nitro)                         │
│ server/api/health/*.ts                 │
│ - GET /api/health/stats                │
│ - GET /api/health/entries              │
│ - POST /api/health/validate            │
│ - Push notification endpoints          │
└────────────┬────────────────────────────┘
             │ Drizzle ORM
             ↓
┌─────────────────────────────────────────┐
│ Database (PostgreSQL - Neon)            │
│ table: health_entries                  │
│ - date, pushups, validated, timestamps │
└─────────────────────────────────────────┘
```

### Data Flow (utilisateur valide son jour)

```
1. Utilisateur sélectionne nombre de pompes (stepper)
2. Clique sur "Valider"
3. Frontend envoie POST /api/health/validate
4. Backend :
   - Créé ou update health_entries pour la date d'aujourd'hui
   - Calcule les stats (streak, total, etc)
   - Retourne les nouvelles stats en JSON
5. Frontend met à jour l'état (React)
6. 4 stats cards se mettent à jour
7. Calendar se rafraîchit

Durée totale : ~200-500ms
```

---

## 📊 Fichiers et structure

### 🎨 Frontend

#### `app/pages/projects/health.vue`

**Taille** : 622 lignes (template + script + style)

**Sections** :

```vue
<template>
  <div class="health-container">
    <!-- Header avec titre -->
    <section class="health-header">...</section>

    <!-- 4 Stats Cards -->
    <section class="stats-grid">
      <StatCard v-for="stat in stats" :key="stat.label" :stat="stat" />
    </section>

    <!-- Stepper (1-200 pompes) -->
    <section class="input-section">
      <button @click="decrementCount">−</button>
      <input v-model.number="pompeCount" type="number" />
      <button @click="incrementCount">+</button>
      <button @click="validateDay" class="validate-btn">Valider</button>
    </section>

    <!-- Push Notifications Toggle -->
    <section class="push-section">
      <input
        v-model="pushEnabled"
        type="checkbox"
        @change="handlePushToggle"
      />
      <span>{{ pushEnabled ? 'Push activé' : 'Notifications désactivées' }}</span>
    </section>

    <!-- Calendar interactif (FR/EN) -->
    <section class="calendar-section">
      <Calendar
        :entries="entries"
        :locale="locale"
        @day-selected="onDaySelected"
      />
    </section>
  </div>
</template>

<script setup lang="ts">
  // Composable pour i18n (FR/EN)
  const { locale } = useLocale()

  // État réactif
  const pompeCount = ref(0)
  const stats = ref({ streak: 0, total: 0, days: 0, best: 0 })
  const entries = ref([])
  const pushEnabled = ref(false)

  // Charger les données au montage
  onMounted(async () => {
    await fetchStats()
    await fetchEntries()
    await checkPushStatus()
  })

  // Fonctions
  const fetchStats = async () => {
    const response = await $fetch('/api/health/stats')
    stats.value = response
  }

  const validateDay = async () => {
    const response = await $fetch('/api/health/validate', {
      method: 'POST',
      body: { pompeCount: pompeCount.value },
    })
    stats.value = response
    pompeCount.value = 0
  }

  const handlePushToggle = async () => {
    if (pushEnabled.value) {
      await subscribeToPush()
    } else {
      await unsubscribeFromPush()
    }
  }
</script>

<style scoped>
  /* Responsive grid, transitions, animations */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin: 2rem 0;
  }

  .validate-btn {
    /* Styling interactif avec hover, active, disabled */
  }
</style>
```

**Dépendances** :

- `useLocale()` — i18n composable (FR/EN)
- `$fetch` — Nuxt fetch pour API calls
- `ref`, `computed`, `onMounted` — Vue 3 reactivity

**State management** :

- `pompeCount` — Nombre de pompes sélectionnées (0-200)
- `stats` — 4 stats calculées en temps réel
- `entries` — Historique complet des pompes
- `pushEnabled` — Toggle pour notifications push

---

### 🖥️ Backend (Nitro)

#### `server/api/health/stats.ts`

```typescript
export default defineEventHandler(async (event) => {
  const db = useDB()
  const today = new Date().toISOString().split('T')[0]

  // Récupérer toutes les entrées validées
  const entries = await db.select().from(healthEntries).where(
    eq(healthEntries.validated, true)
  )

  // Calculer les stats
  const totalPompes = entries.reduce((sum, e) => sum + e.pushups, 0)
  const daysCount = entries.length
  const bestDay = Math.max(...entries.map(e => e.pushups), 0)

  // Calculer le streak
  let streak = 0
  let currentDate = new Date(today)
  for (let i = 0; i < 365; i++) {
    const dateStr = currentDate.toISOString().split('T')[0]
    const entry = entries.find(e => e.date === dateStr && e.validated)
    if (entry) {
      streak++
      currentDate.setDate(currentDate.getDate() - 1)
    } else {
      break
    }
  }

  return { streak, total: totalPompes, days: daysCount, best: bestDay }
})
```

**Logique** :

1. Connecte à PostgreSQL (Neon)
2. Récupère toutes les entrées validées
3. Calcule 4 stats :
   - **streak** : nombre de jours consécutifs (en arrière)
   - **total** : somme totale de toutes les pompes
   - **days** : nombre de jours avec entrées
   - **best** : meilleur jour (max pompes)
4. Retourne JSON

**Performance** :

- Query N+1 optimisée (une seule requête DB)
- Calcul du streak en O(n) (itération une seule fois)
- Caching possible à ajouter plus tard

---

#### `server/api/health/validate.ts`

```typescript
export default defineEventHandler(async (event) => {
  const db = useDB()
  const body = await readBody(event)
  const { pompeCount } = body

  // Valider input
  if (!pompeCount || pompeCount < 1 || pompeCount > 200) {
    throw createError({
      statusCode: 400,
      message: 'Invalid pushups count (1-200)',
    })
  }

  const today = new Date().toISOString().split('T')[0]

  // Chercher si déjà existe pour aujourd'hui
  const existing = await db
    .select()
    .from(healthEntries)
    .where(eq(healthEntries.date, today))
    .limit(1)

  if (existing.length) {
    // Update
    await db
      .update(healthEntries)
      .set({
        pushups: pompeCount,
        validated: true,
        validated_at: new Date(),
      })
      .where(eq(healthEntries.date, today))
  } else {
    // Insert
    await db.insert(healthEntries).values({
      date: today,
      pushups: pompeCount,
      validated: true,
      validated_at: new Date(),
      created_at: new Date(),
    })
  }

  // Retourner les nouvelles stats
  const stats = await fetchStats() // appel fonction stats.ts
  return stats
})
```

**Logique** :

1. Lit le nombre de pompes depuis le body POST
2. Valide le nombre (1-200)
3. Cherche une entrée pour aujourd'hui
4. Si existe → update | Si n'existe pas → insert
5. Retourne les stats mises à jour

**Sécurité** :

- ✅ Validation input (1-200)
- ✅ Date garantie à "aujourd'hui"
- ✅ Pas de SQL injection (Drizzle ORM)

---

#### `server/api/health/entries.ts`

```typescript
export default defineEventHandler(async (event) => {
  const db = useDB()

  const entries = await db
    .select()
    .from(healthEntries)
    .orderBy(desc(healthEntries.date))

  return entries.map(e => ({
    date: e.date,
    pushups: e.pushups,
    validated: e.validated,
  }))
})
```

**Logique** :

1. Récupère TOUTES les entrées (history complet)
2. Trie par date (plus récent d'abord)
3. Retourne pour affichage (calendar, graphiques, etc)

**Performance** :

- O(n) où n = nombre de jours avec données
- Pour 1 an : ~365 rows → très rapide
- Si besoin : ajouter pagination

---

### 💾 Base de données

#### Table `health_entries`

```sql
CREATE TABLE health_entries (
  id SERIAL PRIMARY KEY,
  date VARCHAR(10) UNIQUE NOT NULL,        -- YYYY-MM-DD
  pushups INTEGER NOT NULL DEFAULT 0,       -- 0-200
  validated BOOLEAN NOT NULL DEFAULT FALSE, -- Entrée vérifiée ?
  validated_at TIMESTAMP,                   -- Quand validée
  created_at TIMESTAMP DEFAULT NOW(),       -- Création
  updated_at TIMESTAMP DEFAULT NOW()        -- Dernière modif
)
```

**Index** :

```sql
CREATE UNIQUE INDEX idx_health_entries_date ON health_entries(date)
-- Garantit une seule entrée par jour
```

**Contraintes** :

- `date` est **UNIQUE** (max 1 entrée par jour)
- `date` est **VARCHAR(10)** au format `YYYY-MM-DD`
- `pushups` est entre 0-200 (validé en backend)
- `validated` est `BOOLEAN` (entrée finalisée)

**Exemple de données** :

```sql
date       | pushups | validated | validated_at          | created_at
-----------|---------|-----------|----------------------|------------------------
2026-02-21 | 50      | true      | 2026-02-21 12:30:45 | 2026-02-21 12:30:45
2026-02-20 | 75      | true      | 2026-02-20 18:15:00 | 2026-02-20 18:15:00
2026-02-19 | 60      | true      | 2026-02-19 19:00:00 | 2026-02-19 19:00:00
...
```

---

## 🔌 API Endpoints

### Summary

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health/stats` | GET | 4 stats (streak, total, days, best) |
| `/api/health/entries` | GET | Historique complet (date, pompes, validated) |
| `/api/health/validate` | POST | Valider/créer entrée pour aujourd'hui |
| `/api/push/subscribe` | POST | S'abonner aux notifications push |
| `/api/push/unsubscribe` | POST | Se désabonner |

---

### `GET /api/health/stats`

**Description** : Récupère les 4 stats principales

**Request** :
```
GET /api/health/stats
```

**Response** (200 OK) :
```json
{
  "streak": 15,
  "total": 1250,
  "days": 42,
  "best": 150
}
```

**Erreurs** :
- Aucune erreur possible (retourne toujours un résultat)

---

### `GET /api/health/entries`

**Description** : Récupère l'historique complet

**Request** :
```
GET /api/health/entries
```

**Response** (200 OK) :
```json
[
  {
    "date": "2026-02-21",
    "pushups": 50,
    "validated": true
  },
  {
    "date": "2026-02-20",
    "pushups": 75,
    "validated": true
  }
]
```

**Pagination** : À ajouter si > 1000 entrées

---

### `POST /api/health/validate`

**Description** : Valider/créer entrée pour aujourd'hui

**Request** :
```
POST /api/health/validate
Content-Type: application/json

{
  "pompeCount": 50
}
```

**Response** (200 OK) :
```json
{
  "streak": 15,
  "total": 1250,
  "days": 42,
  "best": 150
}
```

**Erreurs** :

```json
// 400 Bad Request
{
  "statusCode": 400,
  "message": "Invalid pushups count (1-200)"
}
```

---

### `POST /api/push/subscribe`

**Description** : S'abonner aux notifications push

**Request** :
```
POST /api/push/subscribe
Content-Type: application/json

{
  "subscription": {
    "endpoint": "https://...",
    "keys": {
      "p256dh": "...",
      "auth": "..."
    }
  }
}
```

**Response** (201 Created) :
```json
{
  "success": true,
  "message": "Subscribed to push notifications"
}
```

**Détails** :

- L'objet `subscription` vient du navigateur (Service Worker)
- Stocké en DB (optionnel)
- Utilisé pour envoyer les notifications

---

### `POST /api/push/unsubscribe`

**Description** : Se désabonner des notifications push

**Request** :
```
POST /api/push/unsubscribe
Content-Type: application/json

{
  "endpoint": "https://..."
}
```

**Response** (200 OK) :
```json
{
  "success": true,
  "message": "Unsubscribed from push notifications"
}
```

---

## 🔔 Web Push Notifications

### Comment ça marche ?

**Architecture** :

```
1. Frontend (Browser)
   - Service Worker enregistré
   - L'utilisateur clique sur "Enable Push"
   - Browser génère un `subscription` unique

2. Frontend → Backend
   - POST /api/push/subscribe avec le subscription

3. Backend
   - Stocke le subscription en DB (ou en mémoire)
   - Peut envoyer des push notifications plus tard

4. Serveur push (Web Push Protocol)
   - Backend envoie notification via VAPID
   - Browser reçoit et affiche la notification

5. Service Worker
   - Détecte la notification push
   - Affiche l'alerte utilisateur
   - Peut éxécuter du code en arrière-plan
```

---

### Configuration VAPID

**VAPID** = Voluntary Application Server Identification

C'est comment le serveur prove qu'il est l'owner de l'app.

**Générer les clés** (une seule fois) :

```bash
# Utiliser une libraire comme web-push
npm install -g web-push

web-push generate-vapid-keys
# Output :
# Public Key: BJVB...
# Private Key: U...
```

**Configuration (.env.local)** :

```bash
VAPID_PRIVATE_KEY=U...   # Secret (ne jamais partager)
VAPID_PUBLIC_KEY=BJVB... # Public (dans manifest.json)
```

**Dans nuxt.config.ts** :

```typescript
pwa: {
  manifest: {
    name: 'chetana.dev',
    short_name: 'chetana',
    publicVapidKey: process.env.VAPID_PUBLIC_KEY
  }
}
```

---

### Envoyer une notification (Backend)

```typescript
import { sendNotification } from 'web-push'

export default defineEventHandler(async (event) => {
  const subscription = {
    endpoint: '...', // reçu de l'utilisateur
    keys: {
      p256dh: '...',
      auth: '...'
    }
  }

  const notificationPayload = {
    title: 'Daily reminder!',
    body: 'Have you logged your pushups today?',
    icon: '/icon-192.png',
    badge: '/badge-72.png',
    tag: 'health-reminder',
    requireInteraction: false
  }

  try {
    await sendNotification(subscription, JSON.stringify(notificationPayload))
    return { success: true }
  } catch (error) {
    console.error('Push notification failed:', error)
    return { success: false, error: error.message }
  }
})
```

---

### Recevoir une notification (Frontend/Service Worker)

**Dans le Service Worker** :

```javascript
self.addEventListener('push', (event) => {
  const data = event.data.json()

  const options = {
    title: data.title,
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    requireInteraction: data.requireInteraction,
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'close', title: 'Close' }
    ]
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  if (event.action === 'open') {
    clients.openWindow('https://chetana.fr/projects/health')
  }
})
```

---

## 🎨 UI/UX & Composants

### Stats Cards

**Component** : Inliné dans `health.vue`

**Affichage** :

```
┌───────────────┐  ┌───────────────┐
│   Streak 🔥   │  │   Total 💪    │
│      15       │  │    1,250      │
│    jours      │  │    pompes     │
└───────────────┘  └───────────────┘

┌───────────────┐  ┌───────────────┐
│   Days 📅     │  │   Best 🏆     │
│      42       │  │     150       │
│ avec données  │  │   en un jour  │
└───────────────┘  └───────────────┘
```

**Props** :

```typescript
interface Stat {
  label: string        // "Streak", "Total", etc
  value: number        // 15, 1250, etc
  unit: string         // "jours", "pompes", etc
  icon: string         // 🔥, 💪, 📅, 🏆
  color: string        // "gold", "blue", "green"
  percentage?: number  // Pour une barre de progression (optionnel)
}
```

---

### Stepper (Input)

**Affichage** :

```
    [−] [50] [+]      [Valider]
     │    │   │
     │    │   └─ Increment
     │    └───── Nombre (editable)
     └────────── Decrement
```

**Features** :

- 🔢 Input numérique (1-200)
- `−` et `+` buttons
- Édition directe au clavier
- Min: 1, Max: 200
- Validation avant submit

**Code** :

```typescript
const pompeCount = ref(0)

const incrementCount = () => {
  if (pompeCount.value < 200) pompeCount.value++
}

const decrementCount = () => {
  if (pompeCount.value > 1) pompeCount.value--
}

const validateDay = async () => {
  if (pompeCount.value >= 1 && pompeCount.value <= 200) {
    await $fetch('/api/health/validate', {
      method: 'POST',
      body: { pompeCount: pompeCount.value }
    })
    pompeCount.value = 0
  }
}
```

---

### Calendar Interactif

**Affichage** :

```
     Février 2026
Lu Ma Me Je Ve Sa Di
               1  2
 3  4  5  6  7  8  9
10 11 12 13 14 15 16
17 18 19 20 21 22 23
24 25 26 27 28

Legend:
🟢 = Validé
🟡 = Partiellement validé
🔴 = Manqué
⚪ = Pas de données
```

**Features** :

- 📅 Navigation par mois (prev/next)
- 🌍 Bilingue FR/EN (noms mois/jours)
- 🎨 Couleurs par status
- 📊 Affiche pompes au hover
- ✅ Cliquable pour voir détails

**Code** :

```typescript
const Calendar = {
  props: {
    entries: Array,
    locale: String // 'fr' ou 'en'
  },

  computed: {
    monthName() {
      const months = {
        fr: [...],
        en: [...]
      }
      return months[this.locale][this.currentMonth]
    }
  },

  methods: {
    getDayStatus(date) {
      const entry = this.entries.find(e => e.date === date)
      if (!entry) return 'empty'
      if (entry.pushups >= 50) return 'validated'
      if (entry.pushups > 0) return 'partial'
      return 'missed'
    }
  }
}
```

---

### Push Notifications Toggle

**Affichage** :

```
🔔 Notifications push
[Toggle: OFF/ON]

Status: "Notifications désactivées" ou "Push activé"
```

**Fonctionnalité** :

```typescript
const pushEnabled = ref(false)

const handlePushToggle = async () => {
  try {
    if (pushEnabled.value) {
      // S'abonner
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicVapidKey
      })
      await $fetch('/api/push/subscribe', {
        method: 'POST',
        body: { subscription }
      })
    } else {
      // Se désabonner
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await $fetch('/api/push/unsubscribe', {
          method: 'POST',
          body: { endpoint: subscription.endpoint }
        })
      }
    }
  } catch (error) {
    console.error('Push toggle failed:', error)
    pushEnabled.value = !pushEnabled.value
  }
}
```

---

## 🐛 Dépannage

### Le bouton "Installer l'app" n'apparaît pas

**Causes possibles** :

1. **Service Worker non enregistré**
   ```bash
   # Vérifier en DevTools (F12)
   Application → Service Workers
   # Doit afficher "Service Worker registered"
   ```

2. **PWA manifest invalide**
   ```bash
   # Vérifier le manifest
   DevTools → Application → Manifest
   # Doit avoir: name, short_name, icons, start_url, display: 'standalone'
   ```

3. **HTTPS requis**
   ```bash
   # La PWA ne fonctionne qu'en HTTPS
   https://chetana.fr/  ✅
   http://localhost:3000 ✅ (localhost autorisé)
   ```

4. **Service Worker en cache**
   ```bash
   # Clearer le cache
   DevTools → Application → Clear Storage
   # Ou : Ctrl+Shift+Delete → Clear all
   ```

---

### Les notifications push ne s'affichent pas

**Causes possibles** :

1. **Pas d'abonnement à Push**
   ```bash
   # Vérifier dans DevTools
   Application → Service Workers → Push
   # Doit afficher l'endpoint
   ```

2. **Permission refusée**
   ```bash
   # Sur Android :
   Settings → Apps → Chrome → Notifications
   # chetana.dev doit être autorisé
   ```

3. **Service Worker broken**
   ```bash
   # Chercher dans la console
   F12 → Console
   # Doit afficher "Service Worker registered"
   # Pas d'erreurs JS
   ```

4. **Backend env var manquante**
   ```bash
   # Vérifier .env.local
   grep VAPID_PRIVATE_KEY .env.local
   # Doit afficher la clé
   ```

---

### L'app ralentit sur le téléphone

**Solutions** :

1. **Clearer le cache du navigateur**
   ```bash
   Settings → Apps → Chrome → Storage → Clear Cache
   ```

2. **Recharger le service worker**
   ```bash
   DevTools → Application → Service Workers → Unregister
   # Puis : Reload la page
   ```

3. **Vérifier la connexion BD**
   ```bash
   # Si lent :
   npm run dev
   # Vérifier la latence DB dans console (Network tab)
   ```

---

### Stats ne se mettent pas à jour

**Solutions** :

1. **Vérifier la réponse API**
   ```bash
   DevTools → Network → /api/health/validate
   # Doit retourner 200 OK avec les nouvelles stats
   ```

2. **Recharger la page**
   ```bash
   F5 ou pull-to-refresh sur téléphone
   ```

3. **Vérifier la BD**
   ```bash
   npm run db:studio
   # Table health_entries → doit avoir l'entrée du jour
   ```

---

### Calendar ne montre pas les données

**Solutions** :

1. **Vérifier que les entrées existent**
   ```bash
   npm run db:studio
   # Table health_entries → doit avoir des entrées validées
   ```

2. **Recharger les données**
   ```bash
   DevTools → Network → /api/health/entries
   # Doit retourner un array d'entrées
   ```

3. **Vérifier le locale (FR/EN)**
   ```bash
   # Calendar dépend du locale
   # Si locale n'est pas défini, il affiche rien
   useLocale() doit retourner { locale: 'fr' ou 'en' }
   ```

---

## 📞 Support

**Besoin d'aide ?**

- Voir la section COMPLETE_SETUP.md → 🐛 Troubleshooting
- Consulter les console logs (F12 → Console)
- Vérifier .env.local pour les secrets manquants

---

**Status** : ✅ PWA ready for deployment!  
**Last updated** : 21/02/2026
