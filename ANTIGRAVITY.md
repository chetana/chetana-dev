# ANTIGRAVITY — chetana-dev

## Stack
- Nuxt 3 / Nitro / H3.
- Vercel (Compte: chetana-yins-projects).

## Deploy
- **`npx vercel deploy --prod`** — **JAMAIS `--prebuilt`**.
- Laisser Vercel builder côté serveur (GCS/Auth issues sinon).
- Requiert `VERCEL_CONFIG_DIR="/c/Users/cheta/AppData/Roaming/com.vercel.cli/Data"`.

## Gemini (Vertex AI)
- Modèles dans `server/utils/vertex.ts`.
- **Désactiver le thinking** : `thinkingConfig: { thinkingBudget: 0 }`.
- GCS bucket `chet-lys-coffre` pour les messages chat/assets.

## Auth Google
- `requireAuth(event)` dans chaque handler.
- Détection `authorLang` côté backend depuis le token (`user.name`).

## Commits
- **PAS de `Co-Authored-By`**.
- Hook pre-commit build obligatoire.
