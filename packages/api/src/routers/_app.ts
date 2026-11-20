import { authRouter } from './auth.ts'

import { createTRPCRouter } from '../init.ts'
import { chatRouter } from './chat.ts'

export const appRouter = createTRPCRouter({
  auth: authRouter,
  chat: chatRouter,
})

export type AppRouter = typeof appRouter
