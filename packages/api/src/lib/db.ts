import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../db/schema'

console.log('Connecting to database at:', process.env.DB_URL)

const db = drizzle({
  connection: {
    source: process.env.DB_URL,
  },
  casing: 'snake_case',
  schema,
})

export { db }
