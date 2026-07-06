# chetana.dev — Guide PWA & Health Tracker

## 1️⃣ Installation PWA sur Android

### Pourquoi PWA ?
Ton app est une **Progressive Web App (PWA)** grâce à la config dans `nuxt.config.ts`. Cela signifie qu'elle peut être installée sur Android **comme une app native** sans passer par le Play Store.

### Comment installer sur Android

#### Étape 1 : Ouvrir dans Chrome/Edge/Samsung Browser
1. Va sur https://chetana.fr/projects/health
2. Attends 2-3 secondes (le service worker se charge)

#### Étape 2 : Installer l'app
**Option A — Chrome/Edge (Recommandé)**
- Appuie sur le **menu 3 points** (⋮) en haut à droite
- Sélectionne **"Installer l'app"** ou **"Ajouter à l'écran d'accueil"**
- Valide

**Option B — Samsung Browser**
- Menu 3 points → **"Ajouter à l'écran d'accueil"**

**Option C — Partout (Manuel)**
- Menu 3 points → **"Ajouter à l'écran d'accueil"**

#### Étape 3 : Icône PWA
- L'app aura une icône custom (définie dans `manifest` du nuxt.config)
- Elle s'appelle **"Chetana"** avec couleur de thème `#c4963c`

### Caractéristiques PWA disponibles

| Feature | Status | Description |
|---------|--------|-------------|
| **Installation** | ✅ Activé | App écran d'accueil Android |
| **Standalone** | ✅ Activé | Mode fullscreen (pas de URL bar) |
| **Offline** | ✅ Workbox | Cache des fonts Google (1 an) |
| **Web Push** | ✅ Activé | Notifications push browser |
| **Auto-update** | ✅ Activé | Détecte nouvelles versions |

### Données offline
Une fois l'app installée et les pages chargées :
- ✅ Fonts Google Fonts (cache 1 an)
- ✅ Manifeste PWA
- ⚠️ **API calls** : Nécessitent une connexion (pas de cache)

---

## 2️⃣ Architecture du Health Tracker

### Vue générale
```
User navigates to /projects/health
    ↓
Frontend loads stats + calendar
    ↓
POST /api/health/validate (quand valide le jour)
    ↓
PostgreSQL (Neon) sauvegarde healthEntries
    ↓
Affichage streak, stats, notifications push
```

### 📊 Page `/projects/health` (Frontend)

**Fichier** : `app/pages/projects/health.vue` (622 lignes)

#### Composants UI affichés

| Element | Logique |
|---------|---------|
| **4 Stat Cards** | Récupérées de `/api/health/stats` |
| **Today Card** | Input stepper (1-200 pompes) + Bouton validate |
| **Push Notification Toggle** | Service Worker subscription/unsubscription |
| **Calendar** | Grille dynamique FR/EN, validation status par date |

#### Flows Vue.js

**1. Chargement initial (onMounted)**
```javascript
const stats = await useFetch('/api/health/stats')  // GET stats
const entries = await useFetch('/api/health/entries')  // GET tous les jours
const pushEnabled = await checkServiceWorker()  // Vérifier si push activé
```

**2. Validation du jour (validateToday)**
```javascript
// User saisit nombre de pompes (1-200)
// Appuie sur "VALIDER"
POST /api/health/validate { pushups: 25 }
  → DB insère/update healthEntries
  → Stats recalculées
  → UI affichée "✓ Fait !"
```

**3. Push Notifications**
```javascript
// User clique sur 🔔
navigator.serviceWorker.ready
  → Notification.requestPermission()
  → pushManager.subscribe()
  → POST /api/push/subscribe { endpoint, keys }
  → DB stocke subscription
```

### 🗄️ Base de données

**Table : `health_entries`**
```sql
CREATE TABLE health_entries (
  id SERIAL PRIMARY KEY,
  date VARCHAR(10) UNIQUE,        -- YYYY-MM-DD (ex: 2026-02-21)
  pushups INTEGER,                -- 1-200 pompes
  validated BOOLEAN,              -- true si jour complété
  validated_at TIMESTAMP,         -- Heure de validation
  created_at TIMESTAMP DEFAULT NOW()
)
```

**Exemple de données**
```
date        | pushups | validated | validated_at
2026-02-01  |   20    | true      | 2026-02-01 10:15:00
2026-02-02  |   22    | true      | 2026-02-02 08:30:00
2026-02-03  |   25    | true      | 2026-02-03 07:45:00
2026-02-21  |   0     | false     | NULL
```

### 📡 API Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| **GET** | `/api/health/stats` | Retourne stats (streak, total, etc) |
| **GET** | `/api/health/entries` | Tous les jours avec status |
| **POST** | `/api/health/validate` | Enregistrer le jour |
| **POST** | `/api/push/subscribe` | Ajouter subscription push |
| **POST** | `/api/push/unsubscribe` | Retirer subscription push |
| **GET** | `/api/push/vapid-public-key` | Clé publique VAPID |

#### 1️⃣ GET `/api/health/stats`

**Retour** :
```json
{
  "totalPushups": 15647,
  "totalDays": 52,
  "currentStreak": 5,
  "longestStreak": 12,
  "todayValidated": false,
  "todayTarget": 20
}
```

**Logique backend** (`server/api/health/stats.get.ts`) :
- Parcourt toutes les entries validées
- Calcule streak courant (backwards depuis aujourd'hui)
- Calcule longest streak (forwards depuis 2026-01-01)
- Retourne target dynamique :
  - `2026-02-17+` → 25 pompes
  - Avant → 20 pompes

#### 2️⃣ POST `/api/health/validate`

**Body attendu** :
```json
{
  "pushups": 22
}
```

**Logique** :
- Si entry existe pour aujourd'hui : UPDATE (sinon INSERT)
- Marque `validated = true` + `validated_at = NOW()`
- Sauvegarde le nombre de pompes

**Retour** :
```json
{
  "success": true,
  "alreadyValidated": false,
  "date": "2026-02-21",
  "pushups": 22
}
```

#### 3️⃣ Calendar Calculation (Frontend)

**Logique de coloration des cases** :
```javascript
const calendarCells = computed(() => {
  const validatedDates = new Set(
    entries.filter(e => e.validated).map(e => e.date)
  )
  
  for (let d = 1; d <= lastDay; d++) {
    const dateStr = formatDate(d)
    const validated = validatedDates.has(dateStr)
    const isFuture = dateStr > today
    const isBeforeStart = dateStr < '2026-01-01'
    const missed = !validated && !isFuture && !isBeforeStart
    
    cells.push({ 
      date, 
      validated,  // ✓ vert clair
      missed,     // ✗ rouge clair
      today,      // 🔔 border gold
      future      // grisé
    })
  }
})
```

**CSS Classes** :
- `.cal-cell.validated` → `rgba(196, 150, 60, 0.1)` (gold clair)
- `.cal-cell.missed` → `rgba(220, 60, 60, 0.08)` (rouge clair)
- `.cal-cell.today` → border `2px solid var(--accent)`

---

## 3️⃣ Web Push Notifications

### Architecture

```
Service Worker (push-sw.js)
    ↓
Notification API
    ↓
Android notification system
```

### Comment ça marche

**1. User clique sur 🔔 (ou 🔕)**
```javascript
const permission = await Notification.requestPermission()
// "granted", "denied", ou "default"

if (permission === 'granted') {
  const reg = await navigator.serviceWorker.ready
  const sub = await reg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: VAPID_PUBLIC_KEY
  })
  
  // Envoyer subscription au serveur
  await $fetch('/api/push/subscribe', {
    method: 'POST',
    body: {
      endpoint: sub.endpoint,
      keys: sub.toJSON().keys  // p256dh + auth
    }
  })
}
```

**2. Backend envoie une push (depuis cron)**
```javascript
// POST /api/push/cron.post.ts (Vercel cron job)
const webpush = require('web-push')
webpush.setVapidDetails(
  'mailto:contact@chetana.dev',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

// Pour chaque subscription
await webpush.sendNotification(subscription, {
  title: '💪 N\'oublie pas tes pompes!',
  body: 'Le jour est de retour. À toi de jouer!',
  badge: '/pwa-192x192.png',
  icon: '/pwa-192x192.png'
})
```

**3. Service Worker reçoit le message**
```javascript
// Dans public/push-sw.js
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {}
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: data.icon,
    badge: data.badge
  })
})
```

### VAPID Keys
- **Public** : Partagée au client (dans manifest PWA)
- **Private** : Stockée en env sur Vercel (sécurisée)
- Utilisées pour signer les messages push

---

## 4️⃣ Ajouter des Skills au CV

### Structure des skills

**Table : `skills`**
```sql
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100),    -- "Frontend", "Backend", "Tools"
  name VARCHAR(100),        -- "Vue.js", "PostgreSQL"
  color VARCHAR(20),        -- "purple", "blue", "green"
  sort_order INTEGER DEFAULT 0
)
```

### Skills actuels (à vérifier dans seed.ts)

L'app affiche les skills par catégorie dans `app/pages/index.vue`. Basé sur ta stack existante, voici les skills déjà présents probablement :

#### Frontend (actuels)
- Vue.js 3
- Nuxt 4
- TypeScript
- Responsive CSS
- PWA

#### Backend (actuels)
- Nitro
- Node.js
- Drizzle ORM
- PostgreSQL

#### Tools (actuels)
- Vercel
- Neon
- Drizzle Kit
- Git

### ✨ Skills à AJOUTER basés sur ce qu'on voit dans le code

**Frontend avancé** :
- ✅ **Web Push API** — Utilisé dans health.vue (Notification + ServiceWorker)
- ✅ **Service Workers** — Cache Workbox (push-sw.js)
- ✅ **Internationalization (i18n)** — Système bilingue custom

**Backend/Database** :
- ✅ **REST API Design** — 17 endpoints bien structurés
- ✅ **Web Push Protocol** — VAPID, push subscriptions

**Architecture/Patterns** :
- ✅ **Full-Stack TypeScript** — Frontend + API typées
- ✅ **Database Schema Design** — 7 tables normalisées
- ✅ **SEO/Schema.org** — JSON-LD, sitemap dynamique
- ✅ **Server-Side Rendering (SSR)** — Nuxt universale

**DevOps/Deployment** :
- ✅ **CI/CD (Auto-deploy)** — GitHub → Vercel
- ✅ **Serverless** — Vercel + Neon
- ✅ **Environment Management** — .env, secrets Vercel

### Comment ajouter un skill en DB

**Option 1 : Créer un nouveau seed**
```typescript
// server/db/seed-skills.ts
import { getDB } from '../utils/db'
import { skills } from './schema'

const db = getDB()

await db.insert(skills).values([
  { category: 'Frontend', name: 'Web Push API', color: 'blue', sortOrder: 1 },
  { category: 'Backend', name: 'REST API Design', color: 'green', sortOrder: 5 },
  { category: 'DevOps', name: 'Serverless (Vercel)', color: 'purple', sortOrder: 1 }
])
```

Puis lancer : `npm run db:seed-skills`

**Option 2 : Drizzle Studio GUI**
```bash
npm run db:studio
# Ouvrir http://localhost:3000 (interface visuelle)
# Naviguer vers table "skills"
# Ajouter des rangées manuellement
```

---

## 5️⃣ Améliorations Possibles

### PWA
- [ ] Activer offline API calls avec Service Worker cache
- [ ] Implémenter sync API (background sync si perte connexion)
- [ ] Ajouter shortcut PWA (direct à `/projects/health`)

### Health Tracker
- [ ] Historical streaks (graph monthly)
- [ ] Achievements/badges (25-day streak, etc)
- [ ] Export CSV des données
- [ ] Comparaison mois sur mois
- [ ] Suggestion d'augmentation du target

### Push Notifications
- [ ] Scheduled reminders (9am chaque jour)
- [ ] Celebratory message au 10e/50e jour
- [ ] Deep linking (notif → app → /projects/health)
- [ ] Action buttons ("Mark as done", "Dismiss")

---

## 6️⃣ Dépannage

### PWA n'apparaît pas à l'install
- [ ] Vérifier https:// en production (PWA nécessite SSL)
- [ ] Vérifier `manifest` dans devtools (F12 → Application)
- [ ] Service Worker enregistré ? (Check ServiceWorkers)
- [ ] Vérifier cache Workbox (Application → Cache Storage)

### Push notifications refusées
- [ ] Utilisateur a cliqué "Deny" → vider données site Chrome
- [ ] Notification API non supportée (navigateur ancien?)
- [ ] Service Worker pas installé → rechargement page

### Health tracker ne persiste pas
- [ ] DATABASE_URL configurée ? (Check `.env.local`)
- [ ] Neon connection alive ? (Vérifier dans Neon dashboard)
- [ ] POST /api/health/validate retourne erreur ? (Check console)

### Offline ne fonctionne pas
- [ ] Fonts Google peuvent être cachées 1 an (attendre...)
- [ ] API calls ne sont **pas** cachées (c'est par design)
- [ ] Pour tester offline : DevTools → Network → "Offline"

---

## 📚 Fichiers clés

| File | Purpose |
|------|---------|
| `nuxt.config.ts` | PWA manifest, Workbox config, routes |
| `app/pages/projects/health.vue` | Health tracker UI (622 lignes) |
| `server/api/health/*.ts` | Stats, validate, entries endpoints |
| `server/api/push/*.ts` | Subscribe, VAPID, cron notifications |
| `public/push-sw.js` | Service worker pour push |
| `server/db/schema.ts` | Tables (health_entries, skills, etc) |
| `drizzle.config.ts` | ORM config + migrations |

---

**Résumé** : Ton app est une **véritable PWA produite** avec notifications push, tracking offline (fonts), et installation native Android. Le health tracker est un excellent exemple de **full-stack moderne** avec state persistence, real-time stats, et calendrier interactif. 🚀
