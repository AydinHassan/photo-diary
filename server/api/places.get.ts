import { drizzle } from 'drizzle-orm/d1'
import { places } from '../db/schema'

export default defineEventHandler(async (event) => {

  const db = drizzle(event.context.cloudflare.env.photo_diary)
  return await db.select().from(places).all()
})
