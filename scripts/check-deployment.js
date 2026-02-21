import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const envPath = path.join(__dirname, '../.env.local')

const envContent = fs.readFileSync(envPath, 'utf-8')
const tokenMatch = envContent.match(/VERCEL_OIDC_TOKEN="?([^"\n]+)"?/)
const token = tokenMatch ? tokenMatch[1] : null

if (!token) {
  console.error('❌ VERCEL_OIDC_TOKEN not found in .env.local')
  process.exit(1)
}

const PROJECT_ID = 'prj_BrYuLeLY4ghfWvEvoTGyu6PRK6b7'

async function checkDeployment() {
  try {
    console.log('🔍 Checking latest deployment...\n')

    const res = await fetch(
      `https://api.vercel.com/v6/deployments?projectId=${PROJECT_ID}&limit=1`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    )

    if (!res.ok) {
      console.error(`❌ API Error: ${res.status} ${res.statusText}`)
      process.exit(1)
    }

    const data = await res.json()
    const deploy = data.deployments?.[0]

    if (!deploy) {
      console.error('❌ No deployments found')
      process.exit(1)
    }

    const isReady = deploy.state === 'READY'
    const statusIcon = isReady ? '✅' : deploy.state === 'BUILDING' ? '⏳' : '❌'
    const sha = deploy.meta?.commit?.slice(0, 7) || 'unknown'
    const date = new Date(deploy.createdAt).toLocaleString('fr-FR')

    console.log(`${statusIcon} State: ${deploy.state}`)
    console.log(`🔗 URL: https://${deploy.url}`)
    console.log(`📝 Commit: ${sha}`)
    console.log(`⏰ Created: ${date}`)

    if (isReady) {
      console.log('\n✅ Deployment successful! Site is live at https://chetana.dev/')
    } else {
      console.log(`\n⏳ Deployment building... Check back in ~2 minutes`)
    }
  } catch (err) {
    console.error('❌ Error:', err.message)
    process.exit(1)
  }
}

checkDeployment()
