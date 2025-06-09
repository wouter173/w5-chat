import { useQuery } from '@tanstack/react-query'

import { useTRPC } from '~/lib/trpc'
import { SuperLink } from './super-link'

export function Nav() {
  const trpc = useTRPC()
  const listQuery = useQuery(trpc.chat.list.queryOptions())

  return (
    <nav className="w-72 p-4 shrink-0 h-screen sticky top-0">
      <header className="py-4">
        <h1 className="w-full text-center text-xl font-semibold">W5 Chat</h1>
      </header>
      <SuperLink to="/" className="text-primary hover:text-primary/80 transition-colors text-sm">
        New Chat
      </SuperLink>
      <ul>
        {listQuery.data?.map((chat) => (
          <li key={chat.id} className="py-2">
            <SuperLink to={`/${chat.id}`} className="text-primary hover:text-primary/80 transition-colors text-sm">
              {chat.name}
            </SuperLink>
          </li>
        ))}
        {listQuery.isLoading && <li>Loading chats...</li>}
        {listQuery.isError && <li>Error loading chats</li>}
      </ul>
    </nav>
  )
}
