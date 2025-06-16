import type { Route } from './+types/id'
import { startTransition, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTRPC } from '~/lib/trpc'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSubscription } from '@trpc/tanstack-react-query'
import type { Message, Model } from '@w5-chat/api'
import { Prompt } from '~/components/prompt'
import { Header } from '~/components/header'
import { useLocation, useNavigate, useNavigation } from 'react-router'
import { formatDistance } from 'date-fns'
import { nanoid } from '~/lib/id'
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom'
import { MemoizedMarkdown } from '~/components/memoized-markdown'
import 'highlight.js/styles/github-dark-dimmed.css'
import { AnimatePresence, motion } from 'motion/react'

const UserMessage = ({ message }: { message: Message }) => (
  <li className="bg-zinc-800/50 px-4 py-3 rounded-2xl border border-white/5 max-w-3/4 ml-auto">
    <p className="whitespace-pre-wrap">{message.content}</p>
  </li>
)

const AssistantMessage = ({ message }: { message: Message }) => {
  return (
    <li>
      <div className="prose prose-invert !max-w-none">
        <MemoizedMarkdown content={message.content} id={message.id}></MemoizedMarkdown>
      </div>
      {message.model ? (
        <span className="text-xs text-zinc-400">
          {message.model} <span className="text-zinc-500">| {formatDistance(message.createdAt, new Date())}</span>
        </span>
      ) : (
        <span className="text-transparent text-xs">{formatDistance(message.createdAt, new Date())}</span>
      )}
    </li>
  )
}

export default function ChatId({ params: { id } }: Route.ComponentProps) {
  return (
    <StickToBottom resize="instant" initial="smooth" className="overflow-scroll h-screen">
      <StickToBottom.Content>
        <ChatMessages id={id} />
      </StickToBottom.Content>
    </StickToBottom>
  )
}

function ChatMessages({ id }: { id: string }) {
  const trpc = useTRPC()
  const queryClient = useQueryClient()
  const [history, setHistory] = useState<Message[]>([])
  const [response, setResponse] = useState<string | null>(null)
  const { isAtBottom } = useStickToBottomContext()
  const navigate = useNavigate()
  const navigation = useNavigation()

  const { state } = useLocation()

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
        { chatId: id, prompt, model: model ?? 'GPT-4.1 nano', messageId },
        { onSuccess: async () => await queryClient.refetchQueries({ queryKey: trpc.chat.list.queryKey() }) },
      )
    }
  }, [])

  useSubscription(
    trpc.chat.messages.subscriptionOptions(
      { chatId: id },
      {
        onData: (payload) => {
          if (payload.type === 'history') {
            startTransition(() => {
              setHistory(payload.messages)
            })
          } else if (payload.type === 'message') {
            setResponse(null)
            setHistory((prev) => [...prev, payload.message])
          } else if (payload.type === 'token') {
            setInitialLoading(false)
            setResponse((prev) => (prev ?? '') + payload.content)
          }
        },
      },
    ),
  )

  return (
    <>
      <div className="w-full relative text-primary pb-64 px-4">
        <Header />
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
            <div className="p-4 rounded max-w-3xl mx-auto">
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
          </motion.div>
        </AnimatePresence>
      </div>
      <BottomPrompt
        onSubmit={async (prompt, model) => {
          const messageId = nanoid()
          setInitialLoading(true)
          setHistory((prev) => [...prev, { content: prompt, role: 'user', id: messageId, createdAt: new Date(), model: null }])
          await promptMutation.mutateAsync({ chatId: id, prompt, model, messageId })
        }}
      />
    </>
  )
}

function BottomPrompt({ onSubmit: submitHandler }: { onSubmit: (prompt: string, model: Model) => void }) {
  const { scrollToBottom } = useStickToBottomContext()

  return (
    <div className="absolute bottom-0 w-full">
      <div className="w-11/12 mx-auto bg-panel">
        <Prompt
          onSubmit={async (prompt, model) => {
            submitHandler(prompt, model)
            scrollToBottom('smooth')
          }}
        />
        <div className="h-10"></div>
      </div>
    </div>
  )
}
