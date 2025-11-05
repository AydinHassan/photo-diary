import { readMultipartFormData } from 'h3'
import { promises as fs } from 'node:fs'
import { join, extname } from 'node:path'
import { drizzle } from 'drizzle-orm/d1'
import { uploads } from '../../../db/schema'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  const db = drizzle(event.context.cloudflare.env.photo_diary)
  const id = getRouterParam(event, 'id')

  const form = await readMultipartFormData(event)
  if (!form?.length) {
    throw createError({ statusCode: 400, statusMessage: 'No file uploaded' })
  }

  const file = form.find(p => p.type && p.filename)
  if (!file) {
    throw createError({ statusCode: 400, statusMessage: 'Expected a file field' })
  }

  const uid = crypto.randomUUID()
  const ext = extname(file.filename || '').toLowerCase()
  const key = `places/${uid}${ext}`
  const dir = join(process.cwd(), 'public', 'uploads', 'places')
  const filepath = join(dir, `${uid}${ext}`)

  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(filepath, file.data)

  const [upload] = await db.insert(uploads).values({
    id: uid,
    key,
    userId: String(session.user.githubId),
    placeId: Number(id),
    temporary: false,
    createdAt: new Date().toISOString(),
    committedAt: new Date().toISOString(),
  }).returning()

  return { image: upload }
})
