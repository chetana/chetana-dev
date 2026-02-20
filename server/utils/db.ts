import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from '../db/schema'

let _db: ReturnType<typeof drizzle> | null = null

export function getDB() {
  if (!_db) {
    const config = useRuntimeConfig()
    const sql = neon(config.databaseUrl)
    _db = drizzle(sql, { schema })
  }
  return _db
}
