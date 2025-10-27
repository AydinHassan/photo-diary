import { drizzle } from 'drizzle-orm/d1'
import { places } from '../db/schema'
import { placeSchema } from '~/shared/validation/place'
import { z } from 'zod'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const db = drizzle(event.context.cloudflare.env.photo_diary)
  const body = await readBody(event)

  const parsed = placeSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed',
      data: {
        errors: parsed.error.issues.map(e => ({
          path: e.path.join('.'),
          message: e.message
        }))
      }
    })
  }

  await db.insert(places).values({
    name: parsed.data.name,
    description: parsed.data.description || '',
    tags: parsed.data.tags || [],
    lat: parsed.data.lat ?? 0,
    lng: parsed.data.lng ?? 0,
    userId: String(session.user.githubId),
    provider: 'github',
  })

  return {}
})
