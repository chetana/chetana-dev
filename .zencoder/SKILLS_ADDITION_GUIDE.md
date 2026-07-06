# Guide : Ajouter les Skills avancés à ta DB

## 🎯 Contexte
Ton projet utilise beaucoup de technos avancées qui ne sont probablement pas dans ta table `skills` actuelle. Ce guide montre comment ajouter les skills basés sur **ce que tu as réellement codé**.

---

## 📝 Skills à ajouter

### Par catégorie

#### 🎨 Frontend Advanced (5 skills)
Basés sur le code de `app/pages/projects/health.vue` et la PWA :
- **Web Push API** — Notification.requestPermission(), pushManager.subscribe()
- **Service Workers** — navigator.serviceWorker, event listeners
- **Internationalization (i18n)** — useLocale() composable FR/EN
- **PWA (Progressive Web Apps)** — Manifest, standalone mode, installation native
- **Workbox Caching** — Runtime caching for fonts, auto-update

#### 🔧 Backend Advanced (4 skills)
Basés sur `server/api/` et Nitro :
- **REST API Design** — 17 endpoints bien structurés GET/POST
- **Web Push Protocol (VAPID)** — Signing, encryption, subscription management
- **Event Handler Pattern** — `defineEventHandler`, `readBody`, error handling
- **Server-Side Rendering (SSR)** — Nuxt universale, hydration

#### 🏗️ Architecture (4 skills)
Basés sur la structure globale :
- **Full-Stack TypeScript** — Frontend + API + DB strictement typées
- **Database Schema Design** — 7 tables normalisées, relations, indexes
- **SEO (Schema.org, JSON-LD)** — useSeoMeta(), useSchemaOrg(), sitemap dynamique
- **Bilingual Content Management** — FR/EN/KM dans DB et composants

#### ⚙️ DevOps (5 skills)
Basés sur la déploiement et infra :
- **Serverless (Vercel)** — Nitro preset, auto-deploy, edge functions
- **Neon PostgreSQL** — Serverless DB, connection pooling
- **CI/CD (GitHub → Vercel)** — Auto-deployment on push to main
- **Environment Management** — .env.local, Vercel secrets, VAPID keys
- **Database Migrations** — Drizzle Kit, push, generate, schema versioning

---

## 🚀 Comment ajouter les skills

### Option 1 : Via npm script (RECOMMANDÉ)

**Avant** : s'assurer que tu es connecté à ta Neon DB
```bash
# Vérifier que .env.local a DATABASE_URL
cat .env.local | grep DATABASE_URL
```

**Lancer le seed** :
```bash
npm run db:seed-skills-advanced
```

**Output attendu** :
```
🎯 Seeding advanced skills...
✅ Added: Frontend Advanced → Web Push API
✅ Added: Frontend Advanced → Service Workers
✅ Added: Frontend Advanced → Internationalization (i18n)
...
✨ Seeding complete!
```

### Option 2 : Via Drizzle Studio GUI

**Lancer Drizzle Studio** :
```bash
npm run db:studio
```

**Puis** :
1. Ouvrir http://localhost:3000 dans le navigateur
2. Cliquer sur table `skills`
3. Cliquer **"Insert"** (bouton +)
4. Remplir les champs manuellement

**Champs à remplir** :
- `category` — "Frontend Advanced", "Backend Advanced", etc
- `name` — "Web Push API", "Service Workers", etc
- `color` — "blue", "green", "purple", "orange"
- `sortOrder` — 1, 2, 3, etc (ordre d'affichage)

### Option 3 : Via SQL direct (Neon Console)

**Aller sur** : https://console.neon.tech

**Exécuter** :
```sql
INSERT INTO skills (category, name, color, sort_order) VALUES
('Frontend Advanced', 'Web Push API', 'blue', 1),
('Frontend Advanced', 'Service Workers', 'blue', 2),
('Frontend Advanced', 'Internationalization (i18n)', 'blue', 3),
('Frontend Advanced', 'PWA (Progressive Web Apps)', 'blue', 4),
('Frontend Advanced', 'Workbox Caching', 'blue', 5),
('Backend Advanced', 'REST API Design', 'green', 1),
('Backend Advanced', 'Web Push Protocol (VAPID)', 'green', 2),
('Backend Advanced', 'Event Handler Pattern', 'green', 3),
('Backend Advanced', 'Server-Side Rendering (SSR)', 'green', 4),
('Architecture', 'Full-Stack TypeScript', 'purple', 1),
('Architecture', 'Database Schema Design', 'purple', 2),
('Architecture', 'SEO (Schema.org, JSON-LD)', 'purple', 3),
('Architecture', 'Bilingual Content Management', 'purple', 4),
('DevOps', 'Serverless (Vercel)', 'orange', 1),
('DevOps', 'Neon PostgreSQL', 'orange', 2),
('DevOps', 'CI/CD (GitHub → Vercel)', 'orange', 3),
('DevOps', 'Environment Management', 'orange', 4),
('DevOps', 'Database Migrations', 'orange', 5);
```

---

## ✅ Vérifier que les skills sont ajoutés

### Dans l'app
1. Va sur https://chetana.fr/
2. Scroll vers **"Skills"** section
3. Les nouvelles catégories doivent apparaître
4. Les skills groupés par couleur

### En DB direct
```bash
# Ouvrir Drizzle Studio
npm run db:studio

# Ou via SQL
psql $DATABASE_URL -c "SELECT category, name, color FROM skills ORDER BY category, sort_order;"
```

---

## 📊 Résumé : Qui fait quoi ?

| Technologie | Où elle est utilisée | Skill à ajouter |
|--------------|---------------------|-----------------|
| Notification API | `app/pages/projects/health.vue:154+` | Web Push API |
| navigator.serviceWorker | `health.vue:155+` | Service Workers |
| useLocale() | `app/composables/useLocale.ts` | Internationalization |
| PWA manifest | `nuxt.config.ts:11-23` | PWA |
| Workbox caching | `nuxt.config.ts:24-45` | Workbox Caching |
| REST endpoints | `server/api/` (17 routes) | REST API Design |
| web-push library | `server/api/push/` | VAPID Protocol |
| defineEventHandler | Every `server/api/*.ts` | Event Handler Pattern |
| Nuxt SSR | `nuxt.config.ts` | Server-Side Rendering |
| TypeScript interfaces | Everywhere | Full-Stack TypeScript |
| Drizzle schema | `server/db/schema.ts` | Database Schema Design |
| useSeoMeta, useSchemaOrg | Every page | SEO/JSON-LD |
| Locale-based content | `*Fr`, `*En` in DB | Bilingual Management |
| Vercel deployment | `vercel.json`, auto-push | Serverless + CI/CD |
| Neon connection | `server/utils/db.ts` | Neon PostgreSQL |
| .env secrets | Vercel dashboard | Environment Management |
| Drizzle Kit | `drizzle.config.ts` | Database Migrations |

---

## 🔗 Fichiers créés pour toi

1. **`server/db/seed-skills-advanced.ts`** — Seed script complet
   - 18 skills au total
   - Vérifications doublon (upsert pattern)
   - Logs clairs pour chaque opération

2. **`package.json`** — Script ajouté
   - `npm run db:seed-skills-advanced` → execute le seed

3. **`PWA_HEALTH_TRACKER_GUIDE.md`** — Documentation complète
   - Comment installer PWA sur Android
   - Architecture du health tracker
   - Web push mechanics
   - Dépannage

---

## 🚦 Prochaines étapes

### Immédiat
```bash
# 1. Vérifier la DB est connectée
echo $DATABASE_URL

# 2. Exécuter le seed
npm run db:seed-skills-advanced

# 3. Vérifier l'ajout
npm run db:studio
```

### Court terme
- Actualiser la page d'accueil https://chetana.fr/
- Vérifier que les skills s'affichent correctement
- Tester sur mobile (voir PWA_HEALTH_TRACKER_GUIDE.md)

### Long terme
- Continuer à ajouter des skills au fur et à mesure
- Mettre à jour le seed si nouvelles technos
- Considérer d'autres catégories (Design Systems, Analytics, etc)

---

**Prêt ?** Lance `npm run db:seed-skills-advanced` et profite ! 🚀
