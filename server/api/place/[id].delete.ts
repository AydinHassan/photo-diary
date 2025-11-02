import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { places } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = drizzle(event.context.cloudflare.env.photo_diary)

  await db.delete(places).where(eq(places.id, id))
  return {}
})
