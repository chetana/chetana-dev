# 💼 Skills Addition — 18 Advanced Skills Guide

**Date** : 21 février 2026  
**Version** : 1.0.0

---

## 📖 Table des matières

1. [📋 Skills Overview](#skills-overview)
2. [🎯 18 Advanced Skills — Détail complet](#18-advanced-skills--détail-complet)
3. [🛠️ Techniques d'ajout](#techniques-dajout)
4. [🗄️ Schema et structure DB](#schema-et-structure-db)
5. [🔍 Comment vérifier l'ajout](#comment-vérifier-lajout)
6. [📱 Affichage sur le site](#affichage-sur-le-site)

---

## 📋 Skills Overview

### Qu'est-ce qu'un "Skill" ?

Un **skill** représente une compétence ou technologie maîtrisée. Organisé en **catégories** :

```
Frontend Basic (5)         Backend Basic (4)       Database (2)
├─ Vue.js                  ├─ Node.js               ├─ PostgreSQL
├─ TypeScript              ├─ REST API              └─ Drizzle ORM
├─ Nuxt                    ├─ Express
├─ TailwindCSS             └─ GraphQL
└─ HTML/CSS

... et maintenant :

Frontend Advanced (5)      Backend Advanced (4)    Architecture (4)        DevOps (5)
├─ Web Push API            ├─ REST API Design      ├─ Full-Stack TS         ├─ Serverless
├─ Service Workers         ├─ Web Push Protocol    ├─ DB Schema Design      ├─ Neon
├─ Internationalization    ├─ Event Handler        ├─ SEO (JSON-LD)         ├─ CI/CD
├─ PWA                      └─ Server-Side Render   └─ i18n Content Mgmt     ├─ Environment
└─ Workbox Caching                                                           └─ Migrations
```

### Pourquoi ajouter ces skills ?

✅ **Montrer les compétences avancées** — Au-delà des basics  
✅ **Authentique** — Reflète ce qu'on a vraiment code  
✅ **Visible sur le portfolio** — Les recruteurs voient toutes tes competences  
✅ **Organisé par catégorie** — Facile à naviguer  

---

## 🎯 18 Advanced Skills — Détail complet

### 1️⃣ Frontend Advanced (5 skills)

| Skill | Catégorie | Couleur | Description |
|-------|-----------|---------|-------------|
| **Web Push API** | Frontend Advanced | `blue` | Notifications push natives du navigateur, implémentées dans health tracker |
| **Service Workers** | Frontend Advanced | `blue` | Cache offline, background sync, fondation de la PWA |
| **Internationalization (i18n)** | Frontend Advanced | `blue` | Système i18n custom (useLocale), support FR/EN |
| **PWA (Progressive Web Apps)** | Frontend Advanced | `blue` | Installation app, offline mode, manifest, service workers |
| **Workbox Caching** | Frontend Advanced | `blue` | Stratégies de cache (runtime, static), asset optimization |

**Justification** :
- ✅ Health tracker utilise Web Push API + Service Workers
- ✅ PWA manifest configuré dans `nuxt.config.ts`
- ✅ Workbox intégré pour le caching
- ✅ i18n custom implémenté (pas useI18n de Nuxt, conflict avec seo)

**Code evidence** :
```typescript
// Web Push + Service Workers
server/api/push/subscribe.ts
server/api/push/unsubscribe.ts
public/service-worker.js

// i18n
app/composables/useLocale.ts
useLocale() utilisé partout

// PWA
nuxt.config.ts → pwa: { ... }
public/manifest.json

// Workbox
nuxt.config.ts → vite-pwa configuration
```

---

### 2️⃣ Backend Advanced (4 skills)

| Skill | Catégorie | Couleur | Description |
|-------|-----------|---------|-------------|
| **REST API Design** | Backend Advanced | `green` | Endpoint conventions, status codes, error handling |
| **Web Push Protocol (VAPID)** | Backend Advanced | `green` | VAPID keys, signature, authenticated push notifications |
| **Event Handler Pattern** | Backend Advanced | `green` | Nitro event handlers, middleware, async patterns |
| **Server-Side Rendering (SSR)** | Backend Advanced | `green` | Nuxt SSR, hydration, universal components |

**Justification** :
- ✅ REST API bien structuré (`server/api/health/*.ts`)
- ✅ VAPID implémenté pour push notifications
- ✅ Nitro event handlers partout (defineEventHandler)
- ✅ Nuxt SSR activé par défaut (full-stack framework)

**Code evidence** :
```typescript
// REST API
server/api/health/stats.ts
server/api/health/validate.ts
server/api/health/entries.ts

// VAPID
.env.local → VAPID_PRIVATE_KEY, VAPID_PUBLIC_KEY
server/api/push/subscribe.ts

// Event Handlers
defineEventHandler(async (event) => { ... })

// SSR
nuxt.config.ts → ssr: true (par défaut)
```

---

### 3️⃣ Architecture (4 skills)

| Skill | Catégorie | Couleur | Description |
|-------|-----------|---------|-------------|
| **Full-Stack TypeScript** | Architecture | `purple` | Type safety end-to-end, frontend + backend typé |
| **Database Schema Design** | Architecture | `purple` | Drizzle schema, migrations, relationships, constraints |
| **SEO (Schema.org, JSON-LD)** | Architecture | `purple` | Rich snippets, structured data, sitemap, robots.txt |
| **Bilingual Content Management** | Architecture | `purple` | Content handling FR/EN, locale switching, translations |

**Justification** :
- ✅ TypeScript 5.7 partout (frontend + backend)
- ✅ Drizzle ORM avec schema type-safe
- ✅ @nuxtjs/seo avec sitemap, robots, JSON-LD
- ✅ i18n custom + contenu FR/EN dynamique

**Code evidence** :
```typescript
// Full-Stack TS
app/pages/projects/health.vue → <script lang="ts">
server/api/health/stats.ts → defineEventHandler<...>
tsconfig.json → compilerOptions.strict: true

// DB Schema
server/db/schema.ts → drizzle schema
drizzle.config.ts → migrations
server/db/migrations/*.sql

// SEO
nuxt.config.ts → @nuxtjs/seo config
useSchemaOrg() → JSON-LD
useSeoMeta() → meta tags

// i18n
app/composables/useLocale.ts
pages avec useSeoMeta() pour FR/EN
```

---

### 4️⃣ DevOps (5 skills)

| Skill | Catégorie | Couleur | Description |
|-------|-----------|---------|-------------|
| **Serverless (Vercel)** | DevOps | `orange` | Deployment Vercel, edge functions, auto-scaling |
| **Neon PostgreSQL** | DevOps | `orange` | Managed PostgreSQL, serverless, autoscaling |
| **CI/CD (GitHub → Vercel)** | DevOps | `orange` | Auto-deployment, GitHub webhooks, build pipeline |
| **Environment Management** | DevOps | `orange` | .env.local, Vercel env vars, secrets management |
| **Database Migrations** | DevOps | `orange` | Drizzle migrations, schema versioning, rollbacks |

**Justification** :
- ✅ Déployé sur Vercel (serverless)
- ✅ Neon PostgreSQL pour la DB
- ✅ CI/CD automatisé (push → Vercel build)
- ✅ Environment management robuste (.env.local, Vercel)
- ✅ Migrations Drizzle bien organisées

**Code evidence** :
```typescript
// Serverless
vercel.json → config
nuxt.config.ts → preset: 'vercel'

// Neon
.env.local → DATABASE_URL
server/utils/db.ts → connection pool

// CI/CD
.github/workflows/*.yml (si présent)
Vercel auto-deployment sur push

// Environment
.env.example
.env.local → gitignored
nuxt.config.ts → runtimeConfig

// Migrations
drizzle/ → migrations SQL
drizzle.config.ts
npm run db:push / db:generate
```

---

## 🛠️ Techniques d'ajout

### ✅ Méthode 1 : Script npm (Recommandé)

C'est la **plus rapide et la plus sûre**.

**Commande** :
```bash
npm run db:seed-skills-advanced
```

**Qu'est-ce que ça fait** :
1. Connecte à la DB (DATABASE_URL)
2. Insère les 18 skills en une transaction
3. Affiche un log pour chaque skill ajouté
4. Terminaison avec succès ou erreur

**Output attendu** :
```
🎯 Seeding advanced skills...

✅ Added: Frontend Advanced → Web Push API
✅ Added: Frontend Advanced → Service Workers
✅ Added: Frontend Advanced → Internationalization (i18n)
✅ Added: Frontend Advanced → PWA (Progressive Web Apps)
✅ Added: Frontend Advanced → Workbox Caching

✅ Added: Backend Advanced → REST API Design
✅ Added: Backend Advanced → Web Push Protocol (VAPID)
✅ Added: Backend Advanced → Event Handler Pattern
✅ Added: Backend Advanced → Server-Side Rendering (SSR)

✅ Added: Architecture → Full-Stack TypeScript
✅ Added: Architecture → Database Schema Design
✅ Added: Architecture → SEO (Schema.org, JSON-LD)
✅ Added: Architecture → Bilingual Content Management

✅ Added: DevOps → Serverless (Vercel)
✅ Added: DevOps → Neon PostgreSQL
✅ Added: DevOps → CI/CD (GitHub → Vercel)
✅ Added: DevOps → Environment Management
✅ Added: DevOps → Database Migrations

✨ Seeding complete! 18 skills added.
```

**Prérequis** :
```bash
✅ npm install (dependencies)
✅ .env.local avec DATABASE_URL
✅ Neon PostgreSQL accessible
✅ Table `skills` existe (created by db:push)
```

**Troubleshoot** :

```bash
# Si erreur "Cannot find module"
npm install

# Si erreur "connection refused"
# Vérifier DATABASE_URL dans .env.local
grep DATABASE_URL .env.local

# Si erreur "table doesn't exist"
npm run db:push

# Si données déjà existent (contrainte unique)
# Les skills sont idempotent — pas de problème à re-run
```

---

### ✅ Méthode 2 : Drizzle Studio GUI

Interface graphique pour ajouter manuellement.

**Commande** :
```bash
npm run db:studio
```

**Étapes** :
1. `npm run db:studio` lance l'interface
2. Ouvre http://localhost:3000 (URL affichée)
3. Cherche la table "skills"
4. Clique "+ Add row"
5. Remplis les colonnes :
   - `category` : "Frontend Advanced", "Backend Advanced", etc
   - `name` : "Web Push API", "Service Workers", etc
   - `color` : "blue", "green", "purple", "orange"
   - `sort_order` : numéro pour trier (optionnel)
6. Save
7. Répète pour les 18 skills

**Avantages** :
- ✅ Visuel
- ✅ Pas besoin de script
- ✅ Validation en temps réel

**Inconvénients** :
- ❌ Manuel (tedious pour 18 skills)
- ❌ Risque d'erreur (typos)
- ❌ Plus lent

---

### ✅ Méthode 3 : SQL Direct

Exécute du SQL brut pour ajouter les skills.

**Command** :
```bash
psql $DATABASE_URL << EOF
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
EOF
```

**Avantages** :
- ✅ Rapide
- ✅ Scriptable
- ✅ Reproducible

**Inconvénients** :
- ❌ Besoin de psql
- ❌ Syntaxe SQL (erreurs faciles)
- ❌ Windows WSL peut avoir des problèmes

---

## 🗄️ Schema et structure DB

### Table `skills`

```sql
CREATE TABLE skills (
  id SERIAL PRIMARY KEY,
  category VARCHAR(100) NOT NULL,   -- Catégorie (Frontend Advanced, etc)
  name VARCHAR(100) NOT NULL,        -- Nom du skill
  color VARCHAR(20),                 -- Code couleur (blue, green, purple, orange)
  sort_order INTEGER DEFAULT 0       -- Ordre de tri
)
```

**Columns** :

| Column | Type | Note |
|--------|------|------|
| `id` | SERIAL | Auto-increment, PK |
| `category` | VARCHAR(100) | "Frontend Advanced", "Backend Advanced", "Architecture", "DevOps" |
| `name` | VARCHAR(100) | "Web Push API", "Service Workers", etc |
| `color` | VARCHAR(20) | "blue", "green", "purple", "orange", "gold", etc |
| `sort_order` | INTEGER | Défaut: 0 (pour trier les skills) |

**Exemple de données** :

```sql
id | category            | name                      | color  | sort_order
---|---------------------|-----------------------------|--------|------------
1  | Frontend Advanced   | Web Push API               | blue   | 1
2  | Frontend Advanced   | Service Workers            | blue   | 2
3  | Frontend Advanced   | Internationalization (i18n)| blue   | 3
...
```

### Drizzle Schema

**Fichier** : `server/db/schema.ts`

```typescript
export const skills = pgTable('skills', {
  id: serial('id').primaryKey(),
  category: varchar('category', { length: 100 }).notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  color: varchar('color', { length: 20 }),
  sortOrder: integer('sort_order').default(0),
})
```

---

## 🔍 Comment vérifier l'ajout

### Option 1 : Drizzle Studio

```bash
npm run db:studio
# Ouvre interface GUI
# Table "skills" → vérifier 18 rows
```

**Affichage** :
```
✅ Table: skills
   ├─ id: 1, category: "Frontend Advanced", name: "Web Push API"
   ├─ id: 2, category: "Frontend Advanced", name: "Service Workers"
   ...
   └─ id: 18, category: "DevOps", name: "Database Migrations"
```

---

### Option 2 : SQL Query directe

```bash
psql $DATABASE_URL << EOF
SELECT category, name, color FROM skills ORDER BY category, sort_order;
EOF
```

**Output** :
```
category            | name                          | color
--------------------|-------------------------------|--------
Architecture        | Bilingual Content Management  | purple
Architecture        | Database Schema Design        | purple
Architecture        | Full-Stack TypeScript         | purple
Architecture        | SEO (Schema.org, JSON-LD)     | purple
Backend Advanced    | Event Handler Pattern         | green
Backend Advanced    | REST API Design               | green
Backend Advanced    | Server-Side Rendering (SSR)   | green
Backend Advanced    | Web Push Protocol (VAPID)     | green
DevOps              | CI/CD (GitHub → Vercel)       | orange
DevOps              | Database Migrations           | orange
DevOps              | Environment Management        | orange
DevOps              | Neon PostgreSQL               | orange
DevOps              | Serverless (Vercel)           | orange
Frontend Advanced   | Internationalization (i18n)   | blue
Frontend Advanced   | PWA (Progressive Web Apps)    | blue
Frontend Advanced   | Service Workers               | blue
Frontend Advanced   | Web Push API                  | blue
Frontend Advanced   | Workbox Caching               | blue
(18 rows)
```

---

### Option 3 : Vérifier sur le site

Après déploiement :

1. Va sur https://chetana.dev/
2. Scroll vers la section "Skills"
3. Tu devrais voir :
   - ✅ 5 catégories avancées (Frontend Advanced, Backend Advanced, Architecture, DevOps)
   - ✅ 18 skills avec les bonnes couleurs

**Visual check** :

```
Skills
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Frontend Advanced
  🔵 Web Push API
  🔵 Service Workers
  🔵 Internationalization (i18n)
  🔵 PWA (Progressive Web Apps)
  🔵 Workbox Caching

Backend Advanced
  🟢 REST API Design
  🟢 Web Push Protocol (VAPID)
  🟢 Event Handler Pattern
  🟢 Server-Side Rendering (SSR)

Architecture
  🟣 Full-Stack TypeScript
  🟣 Database Schema Design
  🟣 SEO (Schema.org, JSON-LD)
  🟣 Bilingual Content Management

DevOps
  🟠 Serverless (Vercel)
  🟠 Neon PostgreSQL
  🟠 CI/CD (GitHub → Vercel)
  🟠 Environment Management
  🟠 Database Migrations
```

---

### Option 4 : API endpoint

```bash
curl https://chetana.dev/api/skills | jq .
```

**Response** :
```json
[
  {
    "id": 1,
    "category": "Frontend Advanced",
    "name": "Web Push API",
    "color": "blue"
  },
  ...
]
```

---

## 📱 Affichage sur le site

### Où sont affichés les skills ?

**Page d'accueil** : `app/pages/index.vue`

```vue
<section id="skills" class="skills-section">
  <h2>Skills</h2>
  
  <div v-for="category in groupedSkills" :key="category" class="category">
    <h3>{{ category }}</h3>
    
    <div class="skills-grid">
      <div
        v-for="skill in skillsByCategory[category]"
        :key="skill.id"
        class="skill-card"
        :style="{ '--color': skill.color }"
      >
        {{ skill.name }}
      </div>
    </div>
  </div>
</section>
```

### Composant Skills

**Fichier** : `app/components/SkillsSection.vue` (si existant)

**Features** :
- 📊 Groupé par catégorie
- 🎨 Couleur selon le skill
- 📱 Responsive grid
- 🔍 Searchable (optionnel)

### API endpoint pour les skills

**Route** : `server/api/skills.ts`

```typescript
export default defineEventHandler(async (event) => {
  const db = useDB()
  const skills = await db.select().from(skillsTable).orderBy(skillsTable.category)
  return skills
})
```

**Réponse** :
```json
[
  {
    "id": 1,
    "category": "Frontend Advanced",
    "name": "Web Push API",
    "color": "blue",
    "sortOrder": 1
  },
  ...
]
```

### Couleurs utilisées

| Couleur | Hex | Utilisation |
|---------|-----|-------------|
| `blue` | `#3B82F6` | Frontend |
| `green` | `#10B981` | Backend |
| `purple` | `#8B5CF6` | Architecture |
| `orange` | `#F97316` | DevOps |
| `gold` | `#FBBF24` | Misc |
| `red` | `#EF4444` | Autre |

---

## 🎓 Intégration avec le reste du site

### Résumé de la page d'accueil

Après l'ajout des skills, l'affichage sur chetana.dev sera :

```
┌─────────────────────────────────────────┐
│ chetana.dev                             │
├─────────────────────────────────────────┤
│ [Header]                                │
├─────────────────────────────────────────┤
│ [Hero]                                  │
├─────────────────────────────────────────┤
│ Projects Section                        │
│ ├─ Health Tracker                       │
│ ├─ Blog                                 │
│ └─ CV                                   │
├─────────────────────────────────────────┤
│ Skills Section  ← 18 NEW SKILLS HERE!   │
│ ├─ Frontend Advanced (5)                │
│ ├─ Backend Advanced (4)                 │
│ ├─ Architecture (4)                     │
│ └─ DevOps (5)                           │
├─────────────────────────────────────────┤
│ [Contact Form]                          │
├─────────────────────────────────────────┤
│ [Footer + Version + Commit]             │
└─────────────────────────────────────────┘
```

---

## 🐛 Troubleshoot

### Les skills n'apparaissent pas après le seed

**Solutions** :

1. **Vérifier que le seed a runné**
   ```bash
   npm run db:seed-skills-advanced
   # Attendre le "✨ Seeding complete!"
   ```

2. **Vérifier en DB**
   ```bash
   npm run db:studio
   # Table "skills" → doit avoir 18+ rows
   ```

3. **Clearer le cache du navigateur**
   ```bash
   Ctrl+Shift+Delete → Clear all
   ```

4. **Rebuild et redeploy**
   ```bash
   npm run build
   npm run preview
   # Ou push to main pour Vercel
   ```

---

### Erreur "INSERT failed"

**Cause possible** : Skills déjà existent

**Solution** :
```bash
# Si besoin de supprimer les anciens
psql $DATABASE_URL << EOF
DELETE FROM skills WHERE category IN (
  'Frontend Advanced', 'Backend Advanced', 'Architecture', 'DevOps'
);
EOF

# Puis re-run le seed
npm run db:seed-skills-advanced
```

---

### Erreur "Cannot connect to database"

**Vérifier** :
```bash
# 1. .env.local existe ?
ls -la .env.local

# 2. DATABASE_URL est correct ?
grep DATABASE_URL .env.local | head -c 50

# 3. Neon est accessible ?
# Vérifier depuis Neon dashboard : https://console.neon.tech/
```

---

## 📊 Checklist avant déploiement

- [ ] `npm run db:seed-skills-advanced` a runné sans erreur
- [ ] 18 skills existent en DB (vérifier Drizzle Studio)
- [ ] Skills s'affichent sur http://localhost:3000/ (dev)
- [ ] Couleurs sont correctes
- [ ] Catégories sont les bonnes
- [ ] `npm run build` réussit
- [ ] Push to main → Vercel build starts
- [ ] Vérifier https://chetana.dev/ après ~2-3 min
- [ ] Skills visibles sur le site live

---

## 📚 Prochaines étapes

### Court terme (1-2 semaines)
- [x] Ajouter les 18 skills avancés
- [ ] Vérifier l'affichage sur le site
- [ ] Ajouter plus de skills au fur et à mesure

### Moyen terme (1-2 mois)
- [ ] Ajouter des "Level" (junior, senior, expert)
- [ ] Ajouter des "Projects" par skill (quels projets utilisent ce skill)
- [ ] UI pour filtrer par catégorie

### Long terme (3+ mois)
- [ ] Skill endorsement system (autres endorsent tes skills)
- [ ] Skill timeline (quand appris chaque skill)
- [ ] Skill graph (dependency graph)

---

## 📞 Support

**Questions** :
- Vérifier COMPLETE_SETUP.md → Troubleshooting
- Consulter README.md → Par tâche
- Explorer `app/components/` pour voir comment les skills s'affichent

---

**Status** : ✅ Ready to add 18 skills!  
**Last updated** : 21/02/2026
