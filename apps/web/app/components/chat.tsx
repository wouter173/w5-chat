import { useState } from 'react'
import { Panel } from './panel'

import { Header } from './header'
import { useQuery } from '@tanstack/react-query'
import { useTRPC } from '~/lib/trpc'

export function Chat() {
  const [chat, setChat] = useState('')
  const [prompt, setPrompt] = useState('')
  const trpc = useTRPC()

  const { data, error } = useQuery(trpc.auth.me.queryOptions())

  return (
    <Panel className="text-primary min-h-[calc(100dvh-16px)] mt-4 rounded-b-none rounded-tr-none border border-r-0 border-b-0 border-zinc-800">
      <Header />

      <div className="mb-4">
        <div className="p-4 rounded whitespace-break-spaces">{chat}</div>
      </div>
      {JSON.stringify(data)}
      {error && <div className="text-red-500">{error.message}</div>}

      <form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <input onChange={(e) => setPrompt(e.target.value)} value={prompt} className="border-red-500 border" type="text" />
        <button>send</button>
      </form>
    </Panel>
  )
}
