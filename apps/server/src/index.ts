import * as trpcExpress from '@trpc/server/adapters/express'
import { appRouter } from '@w5-chat/api'
import express from 'express'
import { clerkMiddleware, getAuth } from '@clerk/express'
import cors from 'cors'

const PORT = 3000
const app = express()

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:5173', 'http://localhost:3001'], credentials: true }))
app.use(clerkMiddleware())

const createContext = async ({ req }: trpcExpress.CreateExpressContextOptions) => {
  const { userId } = getAuth(req)

  if (!userId) return { auth: null }
  return { auth: { userId } }
}

app.use(
  '/api/trpc',
  trpcExpress.createExpressMiddleware({
    router: appRouter,
    createContext,
    onError(opts: any) {
      const { error, type, path, input, ctx, req } = opts
      console.error('Error:', error)
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        // send to bug reporting
      }
    },
  }),
)

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}/trpc`)
})
