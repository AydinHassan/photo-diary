import { drizzle } from 'drizzle-orm/d1'
import { eq, and, inArray } from 'drizzle-orm'
import { places, uploads } from '../db/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  const db = drizzle(event.context.cloudflare.env.photo_diary)
  const userPlaces = await db.select()
    .from(places)
    .where(
      and(
        eq(places.provider, 'github'),
        eq(places.userId, String(session.user.githubId))
      )
    )
    .all()

  if (userPlaces.length === 0) {
    return []
  }

  const placeIds = userPlaces.map(p => p.id)
  const allImages = (await db.select().from(uploads).where(inArray(uploads.placeId, placeIds))).map(img => ({
    ...img,
    url: getPublicUrl(event, img)
  }))

  const grouped = Object.groupBy(allImages, img => img.placeId)

  return userPlaces.map(place => ({
    ...place,
    images: grouped[place.id] || []
  }))
})
