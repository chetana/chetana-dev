# 📚 Documentation chetana.dev

Bienvenue dans la documentation technique du projet **chetana.dev** !

Ce dossier contient des guides détaillés sur les fonctionnalités avancées, l'architecture, et comment maximiser ton projet.

---

## 📖 Guides disponibles

### 🚀 [PWA & Health Tracker](./PWA_AND_HEALTH_TRACKER.md)

Guide complet sur :
- **Installation PWA sur Android** — Comment ajouter l'app à l'écran d'accueil
- **Architecture du Health Tracker** — Suivi quotidien des pompes (streak, calendrier, stats)
- **Web Push Notifications** — Configuration et flux des notifications
- **Dépannage** — Solutions aux problèmes courants
- **Améliorations futures** — Idées pour étendre les fonctionnalités

**Pour qui ?** Tous ceux qui veulent comprendre comment fonctionne le système de tracking et PWA.

**Durée de lecture** : ~15 minutes

---

### 💼 [Ajouter des Skills](./SKILLS_ADDITION.md)

Guide pratique pour ajouter des nouvelles compétences au CV :
- **18 skills avancés** identifiés dans le code
- **3 méthodes d'ajout** (npm script, GUI, SQL direct)
- **Mapping technologie → skill** pour comprendre qui fait quoi
- **Vérification** que l'ajout a fonctionné

**Pour qui ?** Ceux qui veulent enrichir la section "Skills" avec les technologies avancées utilisées.

**Durée de lecture** : ~10 minutes

**Action rapide** :
```bash
npm run db:seed-skills-advanced
```

---

## 🗂️ Documentation existante

Consulte aussi les documents déjà présents :
- [`docs/ARCHITECTURE.md`](../docs/ARCHITECTURE.md) — Architecture globale du projet
- [`docs/DATABASE.md`](../docs/DATABASE.md) — Schéma et relations DB
- [`docs/adr/`](../docs/adr/) — Architecture Decision Records

---

## 🔗 Fichiers clés du projet

### Frontend
- `app/pages/projects/health.vue` — Page du health tracker (622 lignes)
- `app/components/` — Composants réutilisables (Nav, Footer, Cards, etc)
- `app/composables/useLocale.ts` — Système i18n bilingue

### Backend
- `server/api/health/` — Endpoints pour le health tracker
- `server/api/push/` — Notifications push (VAPID, subscriptions)
- `server/api/` — Tous les autres endpoints (blog, projects, etc)

### Database
- `server/db/schema.ts` — Schéma Drizzle (7 tables)
- `server/db/seed-*.ts` — Scripts de seed
- `drizzle.config.ts` — Configuration ORM

### Configuration
- `nuxt.config.ts` — Config PWA, SEO, Nitro preset
- `package.json` — Dépendances et scripts
- `.env.example` — Template variables d'environnement

---

## ⚡ Quick Start

### Développement
```bash
npm install              # Installer les dépendances
cp .env.example .env.local  # Configurer les env vars
npm run db:push          # Pousser le schéma à Neon
npm run db:seed          # Seed les données initiales
npm run dev              # Lancer le dev server (localhost:3000)
```

### Ajouter des skills
```bash
npm run db:seed-skills-advanced
npm run db:studio        # Vérifier dans GUI
```

### Production
```bash
npm run build            # Build Vercel
npm run preview          # Prévisualiser le build
```

---

## 🎯 Prochaines étapes

1. **Lire la section PWA** pour comprendre comment installer l'app sur Android
2. **Lancer le script de skills** pour enrichir ton CV
3. **Vérifier dans DB Studio** que tout s'est bien ajouté
4. **Tester sur ton site live** https://chetana.dev/

---

## 📝 Notes

- Tous les guides sont en **français** 🇫🇷
- Les codes d'exemple sont prêts à copier-coller
- Les fichiers sont versionnés sur GitHub (visible à tous)
- N'hésite pas à contribuer ou améliorer cette documentation !

---

**Dernière mise à jour** : Février 2026

**Questions ?** Consulte les guides spécifiques ou le code source ! 🚀
