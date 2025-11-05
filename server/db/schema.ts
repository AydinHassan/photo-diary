import { sqliteTable, integer, real, text } from 'drizzle-orm/sqlite-core'

export const places = sqliteTable('places', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('user_id').notNull(),
  provider: text('provider').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull().default('[]'),
  lat: real('lat'),
  lng: real('lng')
})

export const uploads = sqliteTable('uploads', {
  id: text('id').primaryKey(),
  key: text('key').notNull(),
  userId: text('user_id').notNull(),
  temporary: integer('temporary', { mode: 'boolean' })
    .notNull()
    .default(true),
  createdAt: text('created_at').notNull(),
  committedAt: text('committed_at'),
  placeId: integer('place_id'),
}, (t) => ({
  keyUnique: uniqueIndex('idx_uploads_key').on(t.key),
  tmpCreatedIdx: index('idx_uploads_tmp_created').on(t.temporary, t.createdAt),
}))
