import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

export function useDB() {
  const config = useRuntimeConfig()
  const sql = neon(config.databaseUrl)
  return drizzle(sql, { schema })
}
