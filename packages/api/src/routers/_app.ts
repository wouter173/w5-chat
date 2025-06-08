import { authRouter } from './auth'

import { createTRPCRouter } from '../init'

export const appRouter = createTRPCRouter({
  auth: authRouter,
})

export type AppRouter = typeof appRouter
