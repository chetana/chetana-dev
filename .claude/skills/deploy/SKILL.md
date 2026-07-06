---
name: deploy
description: Build, commit, push and deploy chetana.fr to Scaleway Serverless Container
allowed-tools: Bash, WebFetch, Read, Grep
---

# Deploy chetana.fr (Scaleway Serverless Container)

Le portfolio Nuxt est hébergé sur un **Scaleway Serverless Container** (`fr-par`, scale-to-zero, TLS auto),
**plus sur Vercel** (Vercel ne sert que de redirecteur 308 `chetana.dev → chetana.fr`).
Le déploiement = build Docker → push registry → update image du container → deploy.

## Coordonnées

- Registry : `rg.fr-par.scw.cloud/chetana-apps/chetana-dev`
- Namespace : `055b4156-c502-43b2-be54-51cc63c9e38e`
- Container id : `fc4b3d50-1048-4643-917b-3498b591c619`
- Domaine : https://chetana.fr (apex, ALIAS Scaleway)
- Convention de tag : incrémenter (`v6` → `v7` …). Vérifier le tag courant avec la commande ci-dessous.

## Steps

1. **Pre-flight**
   - `git status` — le hook pre-commit lance le build check automatiquement.
   - Récupérer le tag image courant :
     ```bash
     scw container container get fc4b3d50-1048-4643-917b-3498b591c619 -o json | node -e 'console.log(JSON.parse(require("fs").readFileSync(0)).image)'
     ```
     → nouveau tag = tag courant + 1 (ex. `v6` → `v7`).

2. **Commit & Push**
   - Stager les fichiers pertinents (⚠️ jamais de `.env*`).
   - Commit descriptif, **sans `Co-Authored-By`**, auteur perso :
     `git -c user.email=chetana.yin@gmail.com commit -m "…"`
   - `git push origin main`

3. **Build + push (Docker)**
   ⚠️ Docker Desktop peut avoir un socket mort → toujours `docker --context default`.
   ```bash
   TAG=v7   # nouveau tag
   docker --context default build -t rg.fr-par.scw.cloud/chetana-apps/chetana-dev:$TAG . > /tmp/build_cd.log 2>&1 &
   # attendre la fin (poller le PID), puis :
   docker --context default push rg.fr-par.scw.cloud/chetana-apps/chetana-dev:$TAG
   ```

4. **Update image + deploy**
   ```bash
   CID=fc4b3d50-1048-4643-917b-3498b591c619
   scw container container update $CID image=rg.fr-par.scw.cloud/chetana-apps/chetana-dev:$TAG
   scw container container deploy $CID
   # poller jusqu'à ready :
   scw container container get $CID -o json | node -e 'console.log(JSON.parse(require("fs").readFileSync(0)).status)'
   ```
   ⚠️ `container update` fait un PATCH : passer **seulement** `image=` préserve les env/secrets.
   Ne JAMAIS repasser `environment-variables`/`secret-environment-variables` sans les repasser TOUS (sinon la map est écrasée).

5. **Post-deploy verification**
   - `curl -s -o /dev/null -w "%{http_code}" https://chetana.fr` → 200
   - `curl -s -o /dev/null -w "%{http_code}" https://chetana.fr/api/experiences` → 200 (vérifie la DB Neon via chetaku)
   - Si KO : `scw container container get $CID -o json` (champ `error_message`) + logs console Scaleway.

6. **Report** au user.

## Important
- Site : https://chetana.fr — API backend : https://chetaku.chetana.fr (Rust/Axum + Neon)
- GitHub : chetana/chetana-dev — **pas d'auto-deploy** sur push, le cycle build→push→deploy ci-dessus est requis.
- `PORT` est réservé côté Scaleway (injecté via `port=`) — ne jamais le mettre en variable d'env.
