import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../db/schema'

let _db: ReturnType<typeof drizzle> | null = null

export function getDB() {
  if (!_db) {
    const config = useRuntimeConfig()
    const dbUrl = config.databaseUrl || process.env.DATABASE_URL || ''
    const sql = neon(dbUrl)
    _db = drizzle(sql, { schema })
  }
  return _db
}
