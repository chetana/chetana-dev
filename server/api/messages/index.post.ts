import { getDB } from '../../utils/db'
import { messages } from '../../db/schema'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  // Basic validation
  if (!body.name || !body.email || !body.content) {
    throw createError({ statusCode: 400, message: 'name, email and content are required' })
  }

  if (body.name.length > 100) {
    throw createError({ statusCode: 400, message: 'Name too long (max 100 chars)' })
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(body.email)) {
    throw createError({ statusCode: 400, message: 'Invalid email address' })
  }

  if (body.content.length > 5000) {
    throw createError({ statusCode: 400, message: 'Message too long (max 5000 chars)' })
  }

  // Honeypot: if a hidden field is filled, it's a bot
  if (body.website) {
    // Silently accept but don't save
    return { success: true }
  }

  const db = getDB()
  await db.insert(messages).values({
    name: body.name.trim(),
    email: body.email.trim(),
    content: body.content.trim()
  })

  return { success: true }
})
