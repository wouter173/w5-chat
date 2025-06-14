import type { Route } from './+types/id'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTRPC } from '~/lib/trpc'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSubscription } from '@trpc/tanstack-react-query'
import type { Message, Model } from '@w5-chat/api'
import { Prompt } from '~/components/prompt'
import { Header } from '~/components/header'
import { useLocation, useNavigate } from 'react-router'
import { formatDistance } from 'date-fns'
import { nanoid } from '~/lib/id'

const UserMessage = ({ message }: { message: Message }) => (
  <li className="bg-zinc-800/50 px-4 py-3 rounded-2xl border border-white/5 max-w-3/4 ml-auto">
    <p>{message.content}</p>
  </li>
)

const AssistantMessage = ({ message }: { message: Message }) => (
  <li>
    <p>{message.content}</p>
    {message.model ? (
      <span className="text-xs text-zinc-400">
        {message.model} <span className="text-zinc-500">| {formatDistance(message.createdAt, new Date())}</span>
      </span>
    ) : (
      <span className="text-transparent text-xs">{formatDistance(message.createdAt, new Date())}</span>
    )}
  </li>
)

export default function ChatId({ params: { id } }: Route.ComponentProps) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [history, setHistory] = useState<Message[]>([])
  const [response, setResponse] = useState<string | null>(null)
  const navigate = useNavigate()

  const { state, pathname } = useLocation()

  const containerRef = useRef<HTMLDivElement>(null)
  const [isAtBottom, setIsAtBottom] = useState(true)

  const promptMutation = useMutation(trpc.chat.prompt.mutationOptions())
  const generateNameMutation = useMutation(trpc.chat.generateName.mutationOptions())

  const [initialLoading, setInitialLoading] = useState(false)

  const usedPrompt = useRef<boolean>(false)
  useEffect(() => {
    if (usedPrompt.current) return
    const prompt = state?.prompt as string | undefined
    const model = state?.model as Model | undefined
    if (prompt) {
      navigate('/' + id, { replace: true })
      usedPrompt.current = true
      generateNameMutation.mutate({ chatId: id, prompt })
      setInitialLoading(true)
      const messageId = nanoid()
      setHistory((prev) => [...prev, { content: prompt, role: 'user', id: messageId, createdAt: new Date(), model: null }])
      promptMutation.mutate(
        { chatId: id, prompt, model: model ?? 'o4-mini', messageId },
        {
          onSuccess: async () => {
            await queryClient.refetchQueries({ queryKey: trpc.chat.list.queryKey() })
          },
        },
      )
    }
  }, [])

  useSubscription(
    trpc.chat.messages.subscriptionOptions(
      { chatId: id },
      {
        onData: (payload) => {
          console.log('Received payload:', payload.type, payload)
          if (payload.type === 'history') {
            setHistory(payload.messages)
          } else if (payload.type === 'message') {
            setResponse(null)
            setHistory((prev) => [...prev, payload.message])
          } else if (payload.type === 'token') {
            setInitialLoading(false)
            console.log('Received token:', payload.content)
            setResponse((prev) => (prev ?? '') + payload.content)
            scrollToBottom()
          }
        },
      },
    ),
  )

  const handleScroll = () => {
    if (!containerRef.current) return
    const { scrollTop, scrollHeight, clientHeight } = containerRef.current
    setIsAtBottom(scrollTop + clientHeight >= scrollHeight - 40) // 10px leeway
  }

  const scrollToBottom = () => {
    if (isAtBottom && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight
    }
  }

  const [lastPath, setLastPath] = useState<string | null>(null)
  const initialScrollBottomRef = useRef<boolean>(false)
  useLayoutEffect(() => {
    const el = containerRef.current
    if (el && history.length > 0 && lastPath !== pathname) {
      if (initialScrollBottomRef.current) return
      initialScrollBottomRef.current = true
      setLastPath(pathname)

      el.scrollTop = el.scrollHeight
    }
  }, [history, pathname])

  useEffect(() => {
    initialScrollBottomRef.current = false
  }, [pathname])

  return (
    <>
      <main
        ref={containerRef}
        onScroll={handleScroll}
        className="w-full h-screen pt-12 relative overflow-scroll break-all text-primary pb-64 px-4"
      >
        <Header />
        <div className="p-4 rounded whitespace-break-spaces max-w-3xl mx-auto">
          <ul className="flex flex-col gap-4">
            {history.map((msg) => {
              if (msg.role === 'user') {
                return <UserMessage key={msg.id} message={msg} />
              }
              return <AssistantMessage key={msg.id} message={msg} />
            })}
            {initialLoading ? <li className="text-zinc-400 text-sm">Generating response...</li> : null}
            {response ? (
              <AssistantMessage message={{ id: 'response', role: '', content: response, createdAt: new Date(), model: null }} />
            ) : null}
          </ul>
        </div>
      </main>

      <div className="absolute bottom-0 w-full">
        <div className="w-11/12 mx-auto bg-panel">
          <Prompt
            onSubmit={async (prompt, model) => {
              const messageId = nanoid()
              setInitialLoading(true)
              setHistory((prev) => [...prev, { content: prompt, role: 'user', id: messageId, createdAt: new Date(), model: null }])
              await promptMutation.mutateAsync({ chatId: id, prompt, model, messageId })
            }}
          />
          <div className="h-10"></div>
        </div>
      </div>
    </>
  )
}
