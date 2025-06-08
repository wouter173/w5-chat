import type { AppRouter } from '@w5-chat/api'

import { createTRPCContext } from '@trpc/tanstack-react-query'

export const { TRPCProvider, useTRPC, useTRPCClient } = createTRPCContext<AppRouter>()
