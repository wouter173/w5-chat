import { SignedIn, SignedOut, useAuth, useClerk } from '@clerk/react-router'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { Prompt } from '~/components/prompt'

import { useTRPC } from '~/lib/trpc'

export default function Index() {
  const trpc = useTRPC()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const createMutation = useMutation(trpc.chat.create.mutationOptions())

  return (
    <div className="relative w-full h-screen z-20 p-4 pt-12 pb-36 flex flex-col">
      <div className="grid place-items-center h-full">
        <div className="w-full flex flex-col items-center max-w-3xl p-4 gap-8">
          <h1 className="text-3xl text-center">Welcome to W5 Chat</h1>
          <Prompt
            onSubmit={async (prompt, model) => {
              const chat = await createMutation.mutateAsync()
              await queryClient.refetchQueries({ queryKey: trpc.chat.list.queryKey() })

              navigate(`/${chat.id}`, { state: { prompt, model }, viewTransition: true })
            }}
          />
        </div>
      </div>
    </div>
  )
}
