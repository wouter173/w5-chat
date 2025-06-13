import { useMutation, useQuery } from '@tanstack/react-query'

import { useTRPC } from '~/lib/trpc'
import { SuperLink } from './super-link'
import { Link, useParams } from 'react-router'
import { cn } from '~/lib/cn'
import { Trash2Icon } from 'lucide-react'
import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

export function Nav() {
  const trpc = useTRPC()
  const listQuery = useQuery(trpc.chat.list.queryOptions())
  const deleteMutation = useMutation(trpc.chat.delete.mutationOptions())

  const [newButtonActive, setNewButtonActive] = useState(false)

  const params = useParams()

  return (
    <nav className="w-72 pt-4 shrink-0 max-h-screen sticky top-0 flex flex-col z-20">
      <div className="px-2.5 w-full flex flex-col">
        <header className="pb-4 pt-2">
          <h1 className="w-full text-center text-xl font-semibold ">W5 Chat</h1>
        </header>
        <Link
          onMouseDown={() => setNewButtonActive(true)}
          onMouseUp={() => setNewButtonActive(false)}
          onMouseLeave={() => setNewButtonActive(false)}
          to="/"
          className={cn(
            'text-primary bg-zinc-800 transition-all text-sm py-1.5 px-2 rounded-lg text-center shadow-[0_-1px_rgba(255,255,255,0.25),0_4px_8px_rgba(0,0,0,0.05),0_1px_6px_-4px_#000]',
            newButtonActive ? 'scale-[97%]' : 'scale-100',
          )}
        >
          New Chat
        </Link>
      </div>

      <div className="relative h-full flex-1 overflow-hidden">
        <div className="pointer-events-none absolute top-0 left-0 right-px h-6 bg-gradient-to-b from-background via-background/80 z-30"></div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-px h-6 bg-gradient-to-t from-background via-background/80 z-30"></div>
        <ul className="h-full overflow-y-scroll overflow-x-hidden px-2.5 no-scrollbar py-[13px] ">
          <AnimatePresence initial={false}>
            {listQuery.data?.map((chat) => (
              <motion.li
                transition={{ duration: 0.15 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                key={chat.id}
                className={cn(
                  'group relative z-20 transition-colors duration-100 border border-transparent rounded-lg text-zinc-400 flex items-center justify-between',
                  'hover:text-zinc-200',
                  params.id === chat.id && 'sticky top-0 bottom-0 z-30 bg-panel text-zinc-50 border-zinc-800 ',
                )}
              >
                <SuperLink to={`/${chat.id}`} className="flex py-1.5 w-full text-sm px-2.5">
                  {chat.name}
                </SuperLink>
                <button
                  onClick={async () => {
                    await deleteMutation.mutateAsync({ chatId: chat.id })
                    await listQuery.refetch()
                  }}
                  className={cn(
                    'opacity-0 group-hover:opacity-50 transition-all mr-1 cursor-pointer hover:opacity-100 p-1 block rounded-sm duration-75',
                    'active:scale-95',
                  )}
                >
                  <Trash2Icon size={16} />
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
        {listQuery.isLoading && <li>Loading chats...</li>}
        {listQuery.isError && <li>Error loading chats</li>}
      </div>
    </nav>
  )
}
