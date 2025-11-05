import { promises as fs } from 'node:fs'
import { join, resolve } from 'node:path'
import { uploads } from '../../db/schema'
import {drizzle} from "drizzle-orm/d1";
import { eq } from 'drizzle-orm'


export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const db = drizzle(event.context.cloudflare.env.photo_diary)
  const [record] = await db.select().from(uploads).where(eq(uploads.id, id)).limit(1)

  if (!record) {
    throw createError({ statusCode: 400, statusMessage: 'File not found' })
  }

  const dir = resolve('public/uploads/temp')
  const filePath = join(process.cwd(), 'public', 'uploads', record.key)

  try {
    await fs.unlink(filePath)
  } catch {
    // ignore if file already gone
  }

  await db.delete(uploads).where(eq(uploads.id, id))
})
