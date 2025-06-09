import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { useTRPC } from '~/lib/trpc'

export default function Index() {
  const trpc = useTRPC()
  const navigate = useNavigate()

  const [prompt, setPrompt] = useState('')
  const createMutation = useMutation(trpc.chat.create.mutationOptions())

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault()
        const chat = await createMutation.mutateAsync({ prompt })

        setPrompt('')
        navigate(`/${chat.id}`)
      }}
    >
      <input value={prompt} onChange={(e) => setPrompt(e.target.value)} type="text" className="bg-zinc-600" />
    </form>
  )
}
