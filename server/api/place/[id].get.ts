import {drizzle} from "drizzle-orm/d1";
import {eq} from "drizzle-orm";
import { places } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = Number(getRouterParam(event, 'id'))
  const db = drizzle(event.context.cloudflare.env.photo_diary)
  const [place] = await db.select().from(places).where(eq(places.id, id)).limit(1)
  return place || null
})
