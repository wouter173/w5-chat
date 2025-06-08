import { authProcedure, createTRPCRouter } from '../init'
import { clerkClient } from '../lib/clerk'

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
