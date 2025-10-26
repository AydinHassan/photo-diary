import { sqliteTable, integer, real, text } from 'drizzle-orm/sqlite-core'

export const places = sqliteTable('places', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default('[]'),
  lat: real('lat'),
  lng: real('lng')
})
