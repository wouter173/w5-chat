import { createClerkClient } from '@clerk/backend'
import { getAuth } from '@hono/clerk-auth'
import type { MiddlewareHandler } from 'hono'
import { createMiddleware } from 'hono/factory'

const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

export const requireAuth = (): MiddlewareHandler => async (c, next) => {
  try {
    const auth = getAuth(c)
    if (!auth?.userId) {
      throw new Error('Unauthorized')
    }
  } catch (error) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  await next()
}
