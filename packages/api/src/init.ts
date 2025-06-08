import { TRPCError, initTRPC } from '@trpc/server'
import superjson from 'superjson'

export type Context = {
  auth: {
    userId: string
  } | null
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const createTRPCRouter = t.router
export const createCallerFactory = t.createCallerFactory

export const baseProcedure = t.procedure

export const authProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.auth) {
    throw new TRPCError({ code: 'UNAUTHORIZED' })
  }

  return next({ ctx: { auth: ctx.auth } })
})
