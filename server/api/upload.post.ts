import { readMultipartFormData } from 'h3'
import { extname } from 'node:path'
import { drizzle } from 'drizzle-orm/d1'
import { uploads } from '../db/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const form = await readMultipartFormData(event)
  if (!form?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const file = form.find(p => p.type && p.filename)
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'Expected a file field' })
  }

  const uid = crypto.randomUUID()
  const ext = extname(file.filename || '').toLowerCase() || ''
  const userId = String(session.user.githubId)
  const key = `uploads/${userId}/${uid}${ext}`

  const arrayBuffer = file.data.buffer.slice(
    file.data.byteOffset,
    file.data.byteOffset + file.data.byteLength
  )

  const r2 = event.context.cloudflare.env.R2
  await r2.put(key, arrayBuffer, {
    httpMetadata: { contentType: file.type },
  })

  const db = drizzle(event.context.cloudflare.env.photo_diary)
  await db.insert(uploads).values({
    id: uid,
    key,
    userId,
    temporary: true,
    createdAt: new Date().toISOString(),
  })

  return { uid }
})
