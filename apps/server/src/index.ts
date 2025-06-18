import * as trpcExpress from '@trpc/server/adapters/express'
import { appRouter } from '@w5-chat/api'
import express from 'express'
import { clerkMiddleware, getAuth } from '@clerk/express'
import cors from 'cors'
import morgan from 'morgan'

const PORT = 3000
const app = express()

const allowedOrigins = process.env.CORS_DOMAINS!.split(',')
console.log(allowedOrigins)

app.use(cors({ origin: allowedOrigins, credentials: true }))
app.use(clerkMiddleware())
app.use(morgan('combined'))

const createContext = async ({ req }: trpcExpress.CreateExpressContextOptions) => {
  const auth = getAuth(req)

  console.log('auth', { auth })

  if (!auth.userId) return { auth: null }
  return { auth: { userId: auth.userId } }
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
  console.log(`Server is running on port: ${PORT}`)
})
