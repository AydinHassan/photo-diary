import { drizzle } from 'drizzle-orm/d1'
import { eq, and } from 'drizzle-orm'
import { places, uploads } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const id = Number(getRouterParam(event, 'id'))

  const db = drizzle(event.context.cloudflare.env.photo_diary)
  const [place] = await db
    .select()
    .from(places)
    .where(
      and(
        eq(places.id, id),
        eq(places.provider, 'github'),
        eq(places.userId, String(session.user.githubId))
      )
    )
    .limit(1)

  if (!place) {
    throw createError({ statusCode: 404, statusMessage: 'Place not found' })
  }

  const images = await db.select().from(uploads).where(eq(uploads.placeId, id))

  const imagesWithUrls = images.map(img => ({
    ...img,
    url: getPublicUrl(event, img)
  }))

  return { ...place, images: imagesWithUrls }
})
