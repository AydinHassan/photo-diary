import { drizzle } from 'drizzle-orm/d1'
import { eq, and } from 'drizzle-orm'
import { places } from '../db/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const db = drizzle(event.context.cloudflare.env.photo_diary)
  return db.select()
    .from(places)
    .where(
      and(
        eq(places.provider, 'github'),
        eq(places.userId, String(session.user.githubId))
      )
    )
    .all()
})
