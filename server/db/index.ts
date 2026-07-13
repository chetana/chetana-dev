import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

// Scaleway Serverless SQL (et Neon) via node-postgres.
// search_path forcé à public : Serverless SQL a un search_path vide par défaut.
let _pool: Pool | null = null

export function useDB() {
  if (!_pool) {
    const config = useRuntimeConfig()
    _pool = new Pool({ connectionString: config.databaseUrl, max: 3 })
    _pool.on('connect', (client) => { client.query('SET search_path TO public') })
  }
  return drizzle(_pool, { schema })
}
