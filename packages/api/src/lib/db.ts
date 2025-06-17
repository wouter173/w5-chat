import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../db/schema'

const db = drizzle({
  connection: {
    url: process.env.DB_URL,
    authToken: process.env.DB_TOKEN,
  },
  casing: 'snake_case',
  schema,
})

export { db }
