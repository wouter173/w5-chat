import { authRouter } from './auth'

import { createTRPCRouter } from '../init'
import { chatRouter } from './chat'

export const appRouter = createTRPCRouter({
  auth: authRouter,
  chat: chatRouter,
})

export type AppRouter = typeof appRouter
