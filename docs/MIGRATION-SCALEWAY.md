# Runbook de migration — chetana-dev (CV/portfolio) → Scaleway

> **But** : sortir de Vercel + Neon + GCP pour consolider sur **Scaleway** (mono-provider, EU, fr-par, scale-to-zero),
> dans le cadre de la migration globale en cours.
> **Domaine cible** : `chetana.fr` en principal, `chetana.dev` → **301** → `chetana.fr`.
> **Audit** : 2026-07-04. **Repo** : `github.com/chetana/chetana-dev`.

---

## ✅ État d'avancement (MAJ en cours de migration globale)

**Contexte acquis** — le reste de l'écosystème perso est DÉJÀ migré sur Scaleway (pattern rodé) :
- Apps migrées + servies sous `chetana.fr` (Serverless Containers, scale-to-zero, TLS auto) : `pushup`, `kh` (khmer-love), `fiancailles`, `lys`, `chetaku` → anciens Cloud Run en **301 redirect** (sauf chetaku, gardé jusqu'à cette migration).
- **Swap GCS→S3 PROUVÉ** sur fiancailles + lys : adaptateur `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner`, endpoint `https://s3.fr-par.scw.cloud`, `forcePathStyle:true`, bucket `chet-lys-coffre` déjà copié (rclone, checksum OK). Pour lys, un adaptateur imite l'API bucket GCS (`file().save/download/delete`, `getFiles`→CommonPrefixes, erreur 404 normalisée en `e.code=404`). **sharp tourne OK sur node:20-alpine.**
- **Vertex/Gemini gardés via le service account** (JWT→OAuth, `GCS_SERVICE_ACCOUNT_JSON`) — marche depuis Scaleway (appels API sortants). Pas besoin de passer par AI Studio API key sauf si on veut sortir 100% de GCP.
- **Coordonnées Scaleway** : registry `rg.fr-par.scw.cloud/chetana-apps` ; container namespace-id `055b4156-c502-43b2-be54-51cc63c9e38e` (region fr-par) ; DNS zone `chetana.fr` gérée chez Scaleway (`scw dns record add` + `scw container domain create`). Clés S3 = `scw config get access-key/secret-key`.
- **CHETAKU_API_URL** cible = `https://chetaku.chetana.fr` (nouveau container Rust déjà live).

**Décisions Chantier 0 tranchées** :
- chetana.fr enregistré chez Scaleway, DNS Scaleway. ✅
- DB → **Serverless SQL** (scale-to-zero). ✅
- de-GCP : on peut le faire **maintenant** (pattern S3 prouvé) plutôt qu'en phase 2. Gemini/Imagen **gardés via service account** (pas AI Studio key pour l'instant).
- ⚠️ **Domaine apex** : la racine `chetana.fr` ne peut pas être un CNAME. Prévoir ALIAS/ANAME côté Scaleway DNS, ou servir sur `www.chetana.fr` + redirection apex.

**Ordre retenu pour ce chantier** : 2 (container, en gardant Neon+GCP) → vérifier live → 1 (DB Neon→Scaleway) → 4 (de-GCP GCS+Vertex) → 3 (DNS apex chetana.fr) → 5 (cutover Vercel, en dernier).

---

## 0. TL;DR — ce qu'on migre vraiment

Ce "CV" est en réalité un **hub portfolio full-stack** (Nuxt 3, compat v4, SSR Nitro) avec :
blog multilingue (fr/en/km), chat IA, coffre photo, galerie d'images IA (imagenie), medialist,
suivi santé/pushups, PWA + push notifications, auth Google.

Trois migrations **indépendantes** + une grosse **phase de-GCP** :

| # | Chantier | Effort | Bloquant prod ? |
|---|----------|--------|-----------------|
| 1 | Neon → Scaleway Serverless Postgres | Moyen (change de driver) | Oui |
| 2 | Vercel → Scaleway Serverless Container | Moyen | Oui |
| 3 | DNS chetana.fr + redirect chetana.dev | Faible | Oui |
| 4 | de-GCP : GCS (~23 fichiers) + Vertex/Gemini/Imagen (~8 fichiers) | **Élevé** | Non (peut rester en phase 2) |
| 5 | Nettoyage Vercel + cutover | Faible | — |

**Recommandation** : faire 1→2→3→5 pour sortir de Vercel+Neon rapidement (l'app continue d'appeler GCP),
puis 4 en phase 2. **Ne PAS couper Vercel avant propagation DNS complète.**

---

## 1. État constaté (inventaire précis)

### Stack
- Nuxt `^3.16`, `future.compatibilityVersion: 4`, modules `@nuxtjs/seo` + `@vite-pwa/nuxt`.
- **Nitro preset actuel : `vercel`** (`nuxt.config.ts`).
- PWA (`registerType: autoUpdate`, `push-sw.js`), push VAPID.
- `site.url: 'https://chetana.fr'` (à changer → chetana.fr).
- `routeRules` : `/projects/health` → 301 vers `https://pushup.chetana.fr` (⚠️ sous-domaine à reconsidérer).

### Base de données — Neon
- Driver : **`@neondatabase/serverless` + `drizzle-orm/neon-http`** (HTTP, propriétaire Neon).
- **Deux points d'accès à changer** :
  - `server/db/index.ts` → `useDB()`
  - `server/utils/db.ts` → `getDB()`
- Schéma : `server/db/schema.ts`, **9 tables** (petit volume) :
  `projects, blog_posts, comments, messages, experiences, users, health_entries, push_subscriptions, skills`.
  - FK : `comments.post_id → blog_posts.id`, `health_entries.user_id → users.id`.
  - Contrainte unique composite : `health_entries (user_id, date)`.
  - `jsonb` : `tags`, `bullets_fr/en/km`.
- Migrations drizzle : `drizzle/migrations/`, config `drizzle.config.ts` (dialect postgresql, `DATABASE_URL`).

### Dépendances GCP (le gros morceau)
Un **seul service account** (`GCS_SERVICE_ACCOUNT_JSON`) sert à la fois au stockage ET à Vertex.

**a) GCS (Cloud Storage)** — bucket `GCS_BUCKET_NAME`, utilisé par **~23 endpoints** :
- `server/utils/gcs.ts` : client + **signed URLs GOOG4 faits main** (crypto Node, `PUT`/`GET`).
- coffre/ (12) : list, delete, meta.get/post, note.get/post, og-image, preview, reactions.get/post, sign-download, sign-upload.
- imagenie/ (4) : gallery, image, delete, generate.
- chat/ (6) : lessons, lessons-demo.get/post, messages.get/post/delete.
- voyage/cover.get.

**b) Vertex AI / Gemini / Imagen** — `server/utils/vertex.ts` + `imagen.ts` :
- `getAccessToken()` : forge un JWT RS256 depuis le service account → token OAuth `cloud-platform`.
- Modèles Gemini : `gemini-3-flash-preview`, `gemini-2.5-flash` (endpoint global pour 3.x, régional sinon).
- Imagen (génération d'images, `server/api/imagenie/generate.post.ts`).
- Consommateurs Gemini (~8) : chat/transcribe (transcribe+translate audio), chat/suggest, chat/messages.post,
  medialist/chat, add, detail, [id].patch, [id].delete.

**c) Google OAuth** — `server/utils/auth.ts` via `google-auth-library` (`OAuth2Client`, `GOOGLE_CLIENT_ID`).
  → **Identité Google, PAS de l'infra GCP** : gratuit, agnostique. **On garde tel quel.**

**d) chetaku-rs** — `CHETAKU_API_URL` (Cloud Run `europe-west1`). Migration séparée (autre item de ta liste).

### Couplage Vercel dans le code (à retirer)
- `app/plugins/vercel-analytics.ts` → `import { inject } from '@vercel/analytics'`.
- `nuxt.config.ts:103` → `process.env.VERCEL_GIT_COMMIT_SHA`.
- `vercel.json` (vide, `{}`) → à supprimer.
- Dépendance `@vercel/analytics` dans `package.json`.
- Commentaire dans `gcs.ts` : normalisation `\n` du service account = "Vercel env var quirk" (revalider sur Scaleway).

### Variables d'environnement (matrice complète)
| Var | Usage | Après migration |
|-----|-------|-----------------|
| `DATABASE_URL` | Neon | → connection string Scaleway Serverless Postgres |
| `GOOGLE_CLIENT_ID` | OAuth login | inchangé (Google Identity) |
| `VAPID_PRIVATE_KEY` / `VAPID_PUBLIC_KEY` | push | inchangé |
| `CRON_SECRET` | protège un endpoint (cron) | recréer cron côté Scaleway |
| `GCS_BUCKET_NAME` | stockage | phase 4 → bucket Object Storage |
| `GCS_SERVICE_ACCOUNT_JSON` | stockage **+ Vertex** | phase 4 → creds S3 + clé Gemini |
| `RAWG_API_KEY` / `TMDB_API_KEY` | medialist (externes) | inchangé |
| `CHETAKU_API_URL` / `CHETAKU_API_KEY` | backend Rust | MAJ après migration chetaku-rs |
| `MEDIALIST_OWNER_EMAIL` | medialist | inchangé |

### État Vercel au 2026-07-04
- ✅ 5 projets morts supprimés (chet_lys, chet-lys-2026, web, retro-board, vuepress).
- Restent : `chetana-cv` (**prod**, domaine chetana.dev) et `chetana-dev` (**doublon** même repo, `.vercel.app` → à supprimer).

---

## 2. Chantier 1 — DB : Neon → Scaleway Serverless Postgres

### 2.1 Provisionner
- Choix : **Serverless SQL Database** (scale-to-zero, PostgreSQL 15/16 compatible) — recommandé, cohérent avec le reste.
  Alternative : **Managed Database for PostgreSQL** (toujours allumé, ~pricing fixe) si scale-to-zero pose souci de cold start.
- Région : `fr-par`. Récupérer la **connection string** (format `postgresql://user:pwd@host:port/db?sslmode=require`).
```bash
# templates — vérifier les noms exacts avec `scw --help`
scw init                                   # config CLI + clés API
scw sdb-sql database create name=chetana-portfolio region=fr-par   # Serverless SQL
# ou : scw rdb instance create ...          # Managed PostgreSQL
```

### 2.2 Changer le driver (code)
Le driver `neon-http` ne parle **qu'à** Neon → passage à `postgres-js` (recommandé, léger) :
```bash
npm rm @neondatabase/serverless
npm i postgres
```
`server/db/index.ts` et `server/utils/db.ts` — remplacer :
```ts
// AVANT
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
const sql = neon(dbUrl)
const db = drizzle(sql, { schema })

// APRÈS
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
const client = postgres(dbUrl, { ssl: 'require', max: 5 })   // pool adapté au scale-to-zero
const db = drizzle(client, { schema })
```
> ⚠️ Vérifier chaque requête drizzle (transactions, `jsonb`, `returning()`), comportement identique
> entre neon-http et postgres-js sauf sur le batching HTTP. Tester `db:studio`.

### 2.3 Migrer le schéma + données (downtime ~0, petit volume)
```bash
# 1. Recréer le schéma sur Scaleway
DATABASE_URL="$SCALEWAY_URL" npx drizzle-kit push

# 2. Dump data-only depuis Neon + restore
pg_dump --data-only --no-owner --no-privileges --disable-triggers "$NEON_URL" > data.sql
psql "$SCALEWAY_URL" < data.sql

# 3. Vérifier les comptages table par table
for t in projects blog_posts comments messages experiences users health_entries push_subscriptions skills; do
  echo -n "$t: "; psql "$SCALEWAY_URL" -tAc "select count(*) from $t"
done
```
- Vérifier que les **séquences `serial`** sont réalignées (`setval`) après un restore data-only.
- Recheck FK + contrainte unique `health_entries_user_date`.

### 2.4 Bascule
- Mettre `DATABASE_URL` (secret Scaleway) → connection string Scaleway.
- MAJ `.env.example` (retirer la mention Neon).

---

## 3. Chantier 2 — Hébergement : Vercel → Serverless Container

### 3.1 Adapter Nitro
`nuxt.config.ts` :
```ts
nitro: {
  preset: 'node-server',          // était 'vercel'
  // retirer les routeRules spécifiques Vercel si besoin
}
...
runtimeConfig.public.commitSha:  process.env.COMMIT_SHA || 'local'   // était VERCEL_GIT_COMMIT_SHA
```

### 3.2 Dockerfile (multi-stage)
```dockerfile
FROM node:24-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ENV NUXT_TELEMETRY_DISABLED=1
RUN npm run build                 # -> .output/ (server node)

FROM node:24-alpine
WORKDIR /app
ENV NODE_ENV=production PORT=8080 HOST=0.0.0.0
COPY --from=build /app/.output ./.output
EXPOSE 8080
CMD ["node", ".output/server/index.mjs"]
```
> `sharp` nécessite parfois des libs natives sur alpine — si build KO, passer sur `node:24-slim` (Debian).

### 3.3 Build + push registry + déploiement
```bash
# Container Registry Scaleway
scw registry namespace create name=chetana region=fr-par
docker build -t rg.fr-par.scw.cloud/chetana/portfolio:latest .
docker push rg.fr-par.scw.cloud/chetana/portfolio:latest

# Serverless Container (scale-to-zero, comme phnom-jump)
scw container namespace create name=chetana region=fr-par
scw container container create \
  namespace-id=<ns-id> name=portfolio \
  registry-image=rg.fr-par.scw.cloud/chetana/portfolio:latest \
  port=8080 min-scale=0 max-scale=2 memory-limit=512 \
  region=fr-par
# injecter les secrets (voir matrice §1) via --secret-environment-variables ou la console
```

### 3.4 Cron
`CRON_SECRET` protège un endpoint (probablement un cron Vercel `vercel.json`/dashboard, à confirmer côté Vercel).
→ recréer avec un **Scaleway Serverless Job/Cron** (ou Trigger) qui `curl` l'endpoint avec le header secret.

### 3.5 CI/CD (remplace les preview deployments Vercel)
- GitHub Actions : au push sur `main` → build image → push registry → `scw container container deploy`.
- (Optionnel) déploiement par branche → containers éphémères pour retrouver un équivalent "preview".

---

## 4. Chantier 3 — DNS & domaine

1. **Prérequis** : chetana.fr enregistré ? DNS géré où (Scaleway Domains / Cloudflare) ? → à confirmer (§7).
2. Pointer **chetana.fr** vers le endpoint du Serverless Container (CNAME/ALIAS + custom domain Scaleway, TLS Let's Encrypt auto).
3. **chetana.dev → 301 → chetana.fr** — même pattern que tes autres projets. Deux options :
   - **DNS/edge** : redirect au niveau du registrar/Scaleway.
   - **Nitro** : `routeRules` global ou middleware :
     ```ts
     // server/middleware/redirect-dev.ts
     export default defineEventHandler((event) => {
       const host = getHeader(event, 'host')
       if (host === 'chetana.dev') {
         return sendRedirect(event, `https://chetana.fr${event.node.req.url}`, 301)
       }
     })
     ```
4. `nuxt.config.ts` → `site.url: 'https://chetana.fr'` (SEO / sitemap `/api/__sitemap__/urls` / OG).
5. Reconsidérer `/projects/health` → `pushup.chetana.fr` (sous-domaine à re-router vers `.fr` ?).

---

## 5. Chantier 4 — de-GCP (phase 2, gros morceau)

### 5.1 GCS → Scaleway Object Storage (S3-compatible)
- Bucket Object Storage `fr-par`, clés API S3.
- Réécrire `server/utils/gcs.ts` :
  - `@google-cloud/storage` → `@aws-sdk/client-s3`.
  - Les **signed URLs GOOG4 faites main** → `@aws-sdk/s3-request-presigner` (`getSignedUrl` PUT/GET).
  - Endpoint S3 Scaleway : `https://s3.fr-par.scw.cloud`.
- Les ~23 endpoints consommateurs utilisent `getGcsBucket()` → si on garde la même signature de fonction utilitaire,
  l'impact se concentre dans `gcs.ts` (bien isoler l'abstraction).
- Migrer les objets existants : `rclone copy gcs:bucket scw-s3:bucket` (config rclone GCS→S3).
- MAJ des URLs stockées en DB si elles contiennent `storage.googleapis.com`.

### 5.2 Vertex/Gemini/Imagen → découpler du service account GCP
Deux stratégies :
- **Garder Gemini/Imagen mais via Google AI Studio API** (`generativelanguage.googleapis.com`, **simple clé API**,
  pas d'infra GCP ni de service account JWT). → supprime `getAccessToken()`/JWT, remplace par header `x-goog-api-key`.
  C'est le chemin le plus court pour "sortir de l'infra GCP" tout en gardant les modèles.
- **OU remplacer par Scaleway Generative APIs** (modèles open — Llama/Mistral/…). Impacte la qualité transcribe/translate
  et la génération d'images (pas d'Imagen équivalent). À évaluer feature par feature.
- Fichiers touchés : `server/utils/vertex.ts`, `imagen.ts` + les ~8 consommateurs (transcribe, suggest, messages.post, medialist).

### 5.3 Google OAuth — **on garde** (gratuit, agnostique).

### 5.4 chetaku-rs — dépend de sa propre migration → MAJ `CHETAKU_API_URL`.

---

## 6. Chantier 5 — Nettoyage & cutover

1. Supprimer le projet Vercel **chetana-dev** (doublon) :
   `curl -X DELETE https://api.vercel.com/v9/projects/chetana-dev -H "Authorization: Bearer $VERCEL_TOKEN"`
2. Retirer du code : `app/plugins/vercel-analytics.ts`, dépendance `@vercel/analytics`, `vercel.json`, réf `VERCEL_GIT_COMMIT_SHA`.
3. **Après** prod OK sur Scaleway + DNS chetana.fr propagé + chetana.dev→301 vérifié :
   supprimer `chetana-cv` de Vercel, puis fermer le compte Vercel si vide.

---

## 7. Décisions à trancher (Chantier 0)

- [ ] **chetana.fr** enregistré ? DNS géré où (Scaleway Domains / Cloudflare / registrar) ?
- [ ] DB : **Serverless SQL** (scale-to-zero, reco) vs **Managed PostgreSQL** (cold-start nul) ?
- [ ] de-GCP maintenant (phase 4 en même temps) ou **phase 2** après sortie Vercel+Neon (reco) ?
- [ ] Gemini/Imagen : passer sur **Google AI Studio API key** (garde les modèles, sort de l'infra GCP)
      ou basculer sur **Scaleway Generative APIs** (change de modèles) ?
- [ ] Sous-domaine `pushup.chetana.fr` : re-router vers `.fr` ou garder ?

---

## 8. Ordre d'exécution recommandé
`0 (décisions)` → `1 (DB)` → `2 (container)` → `3 (DNS)` → `5 (cleanup Vercel)` → `4 (de-GCP, phase 2)`

## 9. Risques / points d'attention
- **Driver DB** : neon-http (HTTP, stateless) → postgres-js (connexions TCP). Attention au pooling avec scale-to-zero
  (cold start + reconnexion). Tester transactions et `jsonb`.
- **Séquences serial** non réalignées après restore data-only → inserts en collision. `setval` à faire.
- **sharp** sur alpine (libvips) : prévoir fallback `node:slim`.
- **Push notifications + scale-to-zero** : cold start au réveil, OK pour un portfolio.
- **Feature imagenie/transcribe** reste couplée GCP tant que Chantier 4 non fait.
- **Ne jamais couper `chetana-cv` (Vercel) avant** propagation DNS complète de chetana.fr.
- **`GCS_SERVICE_ACCOUNT_JSON`** est un secret sensible réutilisé pour Vertex — le régénérer/révoquer en fin de de-GCP.

---
_Généré le 2026-07-04 après audit du repo. Fichier à intégrer à la liste de migration globale._
