import { relations, sql } from 'drizzle-orm'
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const chatTable = sqliteTable('chat_table', {
  id: text().primaryKey(),
  name: text().notNull(),
  userId: text().notNull(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
})

export const chatRelations = relations(chatTable, ({ many }) => ({
  messages: many(chatMessageTable),
}))

export const chatMessageTable = sqliteTable('chat_message_table', {
  id: text().primaryKey(),
  chatId: text()
    .notNull()
    .references(() => chatTable.id, {
      onDelete: 'cascade',
      onUpdate: 'cascade',
    }),
  role: text().notNull(),
  content: text().notNull(),
  createdAt: integer({ mode: 'timestamp_ms' })
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  model: text(),
})

export const chatMessageRelations = relations(chatMessageTable, ({ one }) => ({
  chat: one(chatTable, {
    fields: [chatMessageTable.chatId],
    references: [chatTable.id],
  }),
}))
