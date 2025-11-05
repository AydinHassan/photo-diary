import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { uploads } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid image id' })
  }

  const session = await getUserSession(event)
  const db = drizzle(event.context.cloudflare.env.photo_diary)

  const [upload] = await db.select().from(uploads).where(eq(uploads.id, id))
  if (!upload) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  if (upload.userId !== String(session.user.githubId)) {
    throw createError({ statusCode: 404, statusMessage: 'Image not found' })
  }

  const r2 = event.context.cloudflare.env.R2
  try {
    await r2.delete(upload.key)
  } catch {
    //noop
  }

  await db.delete(uploads).where(eq(uploads.id, id))
})
