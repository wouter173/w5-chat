import * as trpcExpress from '@trpc/server/adapters/express'
import { appRouter } from '@w5-chat/api'
import express from 'express'
import { clerkMiddleware, getAuth } from '@clerk/express'
import cors from 'cors'

const PORT = 3000
const app = express()

app.use(
  cors({
    origin: ['http://localhost:3000', 'http://localhost:5173'],
    credentials: true,
  }),
)
app.use(clerkMiddleware())

const createContext = async ({ req }: trpcExpress.CreateExpressContextOptions) => {
  console.log('Request Headers:', req.auth())
  const { userId } = getAuth(req)
  console.log('User ID:', userId)

  if (!userId) return { auth: null }
  return { auth: { userId } }
}

app.use(
  '/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
  }),
)
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/trpc`)
})
