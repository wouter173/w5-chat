import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpBatchLink, httpBatchStreamLink, httpLink, httpSubscriptionLink, splitLink } from '@trpc/client'
import { useState, type PropsWithChildren } from 'react'
import { TRPCProvider } from '~/lib/trpc'
import type { AppRouter } from '@w5-chat/api'
import superjson from 'superjson'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

function makeQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { staleTime: 60 * 1000 } } })
}

let browserQueryClient: QueryClient | undefined = undefined
function getQueryClient() {
  if (typeof window === 'undefined') {
    return makeQueryClient()
  } else {
    if (!browserQueryClient) browserQueryClient = makeQueryClient()
    return browserQueryClient
  }
}

export function TRPCClientProvider({ children }: PropsWithChildren) {
  const queryClient = getQueryClient()
  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: httpSubscriptionLink({
            url: import.meta.env.VITE_SERVER_URL,
            transformer: superjson,
            eventSourceOptions: { withCredentials: true },
          }),
          false: httpLink({
            url: import.meta.env.VITE_SERVER_URL,
            transformer: superjson,
            fetch: (input, init) => fetch(input, { ...init, credentials: 'include' }),
          }),
        }),
      ],
    }),
  )
  return (
    <QueryClientProvider client={queryClient}>
      <TRPCProvider trpcClient={trpcClient} queryClient={queryClient}>
        {children}
        <ReactQueryDevtools initialIsOpen={false} client={queryClient} />
      </TRPCProvider>
    </QueryClientProvider>
  )
}
