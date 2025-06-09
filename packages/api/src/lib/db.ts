import { drizzle } from 'drizzle-orm/libsql'
import * as schema from '../db/schema'

const db = drizzle({ connection: { url: process.env.DB_FILE_NAME! }, casing: 'snake_case', schema })

export { db }
