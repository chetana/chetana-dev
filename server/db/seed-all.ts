/**
 * seed-all.ts — Master seed script
 *
 * Toujours utiliser ce script plutôt que seed.ts directement.
 * seed.ts efface toutes les tables → les autres seeds doivent être re-runnés après.
 *
 * Usage: npm run db:seed
 */

import { execSync } from 'child_process'
import { resolve } from 'path'

const dir = resolve(import.meta.dirname)

const seeds = [
  // 1. Base : efface tout, insère experiences + skills + 2 projets stub + 2 articles stub
  'seed.ts',

  // 2. Projets additionnels
  // ⚠️  seed-health.ts est EXCLU intentionnellement — il efface les vraies données utilisateur
  'seed-imagenie.ts',
  'seed-babelduo.ts',

  // 3. Articles de blog (remplacent les stubs ou en ajoutent de nouveaux)
  'seed-blog-claude-code.ts',
  'seed-blog-nuxt-portfolio.ts',
  'seed-blog-aws-gcp.ts',
  'seed-blog-back-foc.ts',
  'seed-blog-coffre-photo.ts',
  'seed-blog-design-first.ts',
  'seed-blog-java-evolution.ts',
  'seed-blog-light.ts',
  'seed-blog-openapi-diff.ts',
  'seed-blog-psp-integration.ts',
  'seed-blog-pushup.ts',
  'seed-blog-qa.ts',

  // 4. Skills additionnels (après seed.ts qui efface les skills)
  'seed-skills-new.ts',
  'seed-skills-advanced.ts',

  // 5. Traductions Khmer en dernier (updates sur données existantes)
  'seed-km.ts',
]

console.log(`\n🌱 Running ${seeds.length} seed files...\n`)

for (const file of seeds) {
  const path = resolve(dir, file)
  console.log(`▶ ${file}`)
  try {
    execSync(`npx tsx "${path}"`, { stdio: 'inherit', cwd: resolve(dir, '../..') })
  }
  catch (e) {
    console.error(`❌ Failed: ${file}`)
    process.exit(1)
  }
}

console.log('\n✅ All seeds complete!')
