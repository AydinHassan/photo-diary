import { drizzle } from 'drizzle-orm/d1'
import { eq, and } from 'drizzle-orm'
import { places } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const db = drizzle(event.context.cloudflare.env.photo_diary)
  const [place] = await db.select()
    .from(places)
    .where(and(
      eq(places.id, id),
      eq(places.provider, 'github'),
      eq(places.userId, String(session.user.githubId))
    ))
    .limit(1)

  return place || null
})
