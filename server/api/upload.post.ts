import { readMultipartFormData } from 'h3'
import { promises as fs } from 'node:fs'
import { join, extname } from 'node:path'
import {drizzle} from "drizzle-orm/d1";
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

  const id = crypto.randomUUID()
  const ext = extname(file.filename || '').toLowerCase() || ''
  const key = `temp/${id}${ext}`
  const dir = join(process.cwd(), 'public', 'uploads', 'temp')
  const filepath = join(dir, `${id}${ext}`)

  await fs.mkdir(dir, { recursive: true })
  await fs.writeFile(filepath, file.data)


  const db = drizzle(event.context.cloudflare.env.photo_diary)
  await db.insert(uploads).values({
    id,
    key,
    userId: String(session.user.githubId),
    temporary: true,
    createdAt: new Date().toISOString(),
  })

  return { id }
})
