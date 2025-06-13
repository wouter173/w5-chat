import { useQuery } from '@tanstack/react-query'

import { useTRPC } from '~/lib/trpc'
import { SuperLink } from './super-link'
import { useParams } from 'react-router'
import { cn } from '~/lib/cn'

export function Nav() {
  const trpc = useTRPC()
  const listQuery = useQuery(trpc.chat.list.queryOptions())

  const params = useParams()

  return (
    <nav className="w-72 pt-4 shrink-0 max-h-screen sticky top-0 flex flex-col z-20">
      <div className="px-2.5 w-full flex flex-col">
        <header className="pb-4 pt-2">
          <h1 className="w-full text-center text-xl font-semibold ">W5 Chat</h1>
        </header>
        <SuperLink
          to="/"
          className="text-primary bg-zinc-800 transition-colors text-sm py-1.5 px-2 rounded-lg text-center shadow-[0_-1px_rgba(255,255,255,0.25),0_4px_8px_rgba(0,0,0,0.05),0_1px_6px_-4px_#000]"
        >
          New Chat
        </SuperLink>
      </div>

      <div className="relative h-full flex-1 overflow-hidden">
        <div className="absolute top-0 left-0 right-px h-6 bg-gradient-to-b from-background via-background/80 z-30"></div>
        <div className="absolute bottom-0 left-0 right-px h-6 bg-gradient-to-t from-background via-background/80 z-30"></div>
        <ul className="h-full overflow-y-scroll overflow-x-hidden px-2.5 no-scrollbar py-[13px] ">
          {listQuery.data?.map((chat) => (
            <li key={chat.id} className={cn('relative z-20', params.id === chat.id && 'sticky top-0 bottom-0 z-30')}>
              <SuperLink
                to={`/${chat.id}`}
                className={cn(
                  'flex py-1.5 w-full text-zinc-400 text-sm px-2.5 border border-transparent rounded-lg transition-colors duration-100',
                  params.id === chat.id ? 'bg-panel text-zinc-50 border-zinc-800' : '',
                )}
              >
                {chat.name}
              </SuperLink>
            </li>
          ))}
          {listQuery.isLoading && <li>Loading chats...</li>}
          {listQuery.isError && <li>Error loading chats</li>}
        </ul>
      </div>
    </nav>
  )
}
