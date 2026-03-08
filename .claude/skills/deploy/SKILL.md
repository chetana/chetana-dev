---
name: deploy
description: Build, commit, push and verify deployment on Vercel
allowed-tools: Bash, WebFetch, Read, Grep, mcp__vercel__get_runtime_logs, mcp__vercel__list_deployments, mcp__vercel__get_deployment
---

# Deploy chetana.dev

Deploy the Nuxt application to Vercel.

⚠️ **chetana-dev ne se déploie PAS automatiquement via git push — `npx vercel deploy --prod` est toujours requis.**

## Steps

1. **Pre-flight checks**
   - Run `git status` to check for uncommitted changes
   - Build check is enforced by the pre-commit hook automatically

2. **Commit & Push**
   - Stage relevant files (never stage `.env*` files)
   - Commit with a descriptive message (no Co-Authored-By)
   - Push to `origin main`

3. **Deploy to Vercel**
   - Run: `npx vercel deploy --prod` (NO `--prebuilt` — Vercel must build server-side)
   - Wait for the command to complete (it outputs the Production URL when done)
   - ⚠️ NEVER use `--prebuilt`: external node_modules not uploaded correctly → 500 on all auth endpoints

4. **Post-deploy verification**
   - Fetch `https://chetana.dev` and verify it loads
   - Check `https://chetana.dev/api/experiences` returns 200
   - If errors, check runtime logs with `mcp__vercel__get_runtime_logs`
   - Project ID: `prj_BrYuLeLY4ghfWvEvoTGyu6PRK6b7`
   - Team ID: `team_P2gbZVxXm3tykn0fOxxIhYXN`

5. **Report** results to the user

## Important
- Always use nvm node: `export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"`
- Site URL: https://chetana.dev
- GitHub repo: chetana/chetana-dev
- NO auto-deploy on push — `npx vercel deploy --prod` is always required after pushing
