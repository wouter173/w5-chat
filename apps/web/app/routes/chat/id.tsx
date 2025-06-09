import type { Route } from './+types/id'
import { useState } from 'react'
import { useTRPC } from '~/lib/trpc'
import { useMutation } from '@tanstack/react-query'
import { useSubscription } from '@trpc/tanstack-react-query'
import type { Message } from '@w5-chat/api'

const UserMessage = ({ message }: { message: Message }) => (
  <li className="bg-zinc-800/50 px-4 py-3 rounded-2xl border border-white/5 max-w-3/4 ml-auto">
    <p>{message.content}</p>
  </li>
)

const AssistantMessage = ({ message }: { message: Message }) => (
  <li>
    <p>{message.content}</p>
    <p className="text-gray-800">{message.model && <span className="text-xs text-gray-400">{message.model}</span>}</p>
    <p className="text-sm text-gray-500">{message.createdAt.toLocaleString()}</p>
  </li>
)

export default function ChatId({ params: { id } }: Route.ComponentProps) {
  const [prompt, setPrompt] = useState('')
  const trpc = useTRPC()
  const [history, setHistory] = useState<Message[]>([])
  const [response, setResponse] = useState<string | null>(null)

  const promptMutation = useMutation(trpc.chat.prompt.mutationOptions())
  useSubscription(
    trpc.chat.messages.subscriptionOptions(
      { chatId: id },
      {
        onData: (payload) => {
          console.log('Received payload:', payload.type, payload)
          if (payload.type === 'history') {
            setHistory(payload.messages)
          } else if (payload.type === 'done') {
            setResponse(null)
            setHistory((prev) => [...prev, payload.message])
          } else if (payload.type === 'token') {
            console.log('Received token:', payload.content)
            setResponse((prev) => (prev ?? '') + payload.content)
          }
        },
      },
    ),
  )

  return (
    <>
      <div className="mb-4">
        <div className="p-4 rounded whitespace-break-spaces max-w-3xl mx-auto">
          <ul className="flex flex-col gap-4">
            {history.map((msg) => {
              if (msg.role === 'user') {
                return <UserMessage key={msg.id} message={msg} />
              }
              return <AssistantMessage key={msg.id} message={msg} />
            })}
            {response ? (
              <AssistantMessage
                message={{
                  id: '',
                  role: '',
                  content: response,
                  createdAt: new Date(),
                  model: null,
                }}
              />
            ) : null}
          </ul>
        </div>
      </div>

      <form
        onSubmit={async (e) => {
          e.preventDefault()
          await promptMutation.mutateAsync({ chatId: id, messages: [], prompt, model: 'o4-mini' })
        }}
      >
        <input onChange={(e) => setPrompt(e.target.value)} value={prompt} className="border-red-500 border" type="text" />
        <button>send</button>
      </form>
    </>
  )
}
