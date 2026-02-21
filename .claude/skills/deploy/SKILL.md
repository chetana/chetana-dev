---
name: deploy
description: Build, commit, push and verify deployment on Vercel
allowed-tools: Bash, WebFetch, Read, Grep, mcp__vercel__get_runtime_logs, mcp__vercel__list_deployments, mcp__vercel__get_deployment
---

# Deploy chetana.dev

Deploy the Nuxt application to Vercel via git push (auto-deploy enabled).

## Steps

1. **Pre-flight checks**
   - Run `git status` to check for uncommitted changes
   - Run `npm run build` to verify no build errors

2. **Commit & Push**
   - Stage relevant files (never stage `.env*` files)
   - Commit with a descriptive message
   - Push to `origin main`

3. **Wait for Vercel deployment**
   - Wait ~45 seconds for Vercel to build
   - Use `mcp__vercel__list_deployments` to check deployment status
   - Project ID: `prj_BrYuLeLY4ghfWvEvoTGyu6PRK6b7`
   - Team ID: `team_P2gbZVxXm3tykn0fOxxIhYXN`

4. **Post-deploy verification**
   - Fetch `https://chetana.dev` and verify it loads
   - Check `https://chetana.dev/api/experiences` returns 200
   - Check `https://chetana.dev/api/blog` returns 200
   - If errors, check runtime logs with `mcp__vercel__get_runtime_logs`

5. **Report** results to the user

## Important
- Always use nvm node: `export NVM_DIR="$HOME/.nvm" && [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"`
- Site URL: https://chetana.dev
- GitHub repo: chetana/chetana-dev
