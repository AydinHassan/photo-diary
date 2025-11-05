import { drizzle } from 'drizzle-orm/d1'
import { eq } from 'drizzle-orm'
import { uploads } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const db = drizzle(event.context.cloudflare.env.photo_diary)
  const [record] = await db.select().from(uploads).where(eq(uploads.id, id))
  if (!record) {
    throw createError({ statusCode: 404, statusMessage: 'File not found' })
  }

  const r2 = event.context.cloudflare.env.R2
  const file = await r2.get(record.key)
  if (!file) {
    throw createError({
      status: 404,
      statusMessage: "File not found!",
    });
  }

  setHeaders(event, { etag: file.etag });

  return file.body;
})
