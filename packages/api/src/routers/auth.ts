import { authProcedure, createTRPCRouter } from '../init.ts'
import { clerkClient } from '../lib/clerk.ts'

export const authRouter = createTRPCRouter({
  me: authProcedure.query(async ({ ctx: { auth } }) => {
    const user = await clerkClient.users.getUser(auth.userId)

    return {
      userId: user.id,
      email: user.primaryEmailAddress,
      name: user.fullName,
      image: user.imageUrl,
    }
  }),
})
