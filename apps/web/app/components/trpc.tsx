import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createTRPCClient, httpLink, httpSubscriptionLink, splitLink } from '@trpc/client'
import { useState, type PropsWithChildren } from 'react'
import { TRPCProvider } from '~/lib/trpc'
import type { AppRouter } from '@w5-chat/api'
import superjson from 'superjson'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useAuth } from '@clerk/react-router'
import { EventSourcePolyfill } from 'event-source-polyfill'

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
  const { getToken } = useAuth()

  const [trpcClient] = useState(() =>
    createTRPCClient<AppRouter>({
      links: [
        splitLink({
          condition: (op) => op.type === 'subscription',
          true: httpSubscriptionLink({
            url: import.meta.env.VITE_SERVER_URL,
            transformer: superjson,
            EventSource: EventSourcePolyfill,
            eventSourceOptions: async () => {
              const token = await getToken()
              return {
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              }
            },
          }),
          false: httpLink({
            url: import.meta.env.VITE_SERVER_URL,
            transformer: superjson,
            fetch: async (input, init) => {
              const token = await getToken()

              return fetch(input, {
                ...init,
                headers: { ...init?.headers, ...(token ? { Authorization: `Bearer ${token}` } : {}) },
              })
            },
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
