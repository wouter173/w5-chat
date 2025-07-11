import type { Route } from './+types/id'
import { startTransition, useEffect, useRef, useState } from 'react'
import { useTRPC } from '~/lib/trpc'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSubscription } from '@trpc/tanstack-react-query'
import type { Message, Model } from '@w5-chat/api'
import { Prompt } from '~/components/prompt'
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
      <div className="prose prose-invert prose-zinc !max-w-none">
        <MemoizedMarkdown content={message.content} id={message.id}></MemoizedMarkdown>
      </div>
      {message.model ? (
        <span className="text-xs text-zinc-400">
          {message.model} <span className="text-zinc-500">| {formatDistance(message.createdAt, new Date())} ago</span>
        </span>
      ) : (
        <span className="text-transparent text-xs">ago</span>
      )}
    </li>
  )
}

export default function ChatId({ params: { id } }: Route.ComponentProps) {
  return (
    <StickToBottom resize="instant" initial="instant" className="overflow-scroll h-screen" key={id}>
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
  const navigate = useNavigate()

  const { state } = useLocation()
  const [lastId, setLastId] = useState<string | null>(null)

  if (id !== lastId) {
    setLastId(id)
    if (history.length > 0) {
      setHistory([])
    }
  }

  const promptMutation = useMutation(trpc.chat.prompt.mutationOptions())
  const generateNameMutation = useMutation(
    trpc.chat.generateName.mutationOptions({
      onSuccess: () => {
        console.log('Chat name generated successfully', trpc.chat.list.queryKey())
        queryClient.invalidateQueries({ queryKey: trpc.chat.list.queryKey() })
      },
    }),
  )

  const [generating, setGenerating] = useState(false)

  const usedPrompt = useRef<boolean>(false)
  useEffect(() => {
    if (usedPrompt.current) return
    const prompt = state?.prompt as string | undefined
    const model = state?.model as Model | undefined
    if (prompt) {
      usedPrompt.current = true
      generateNameMutation.mutate({ chatId: id, prompt })
      navigate(`/${id}`, { replace: true })
      const messageId = nanoid()
      setGenerating(true)
      setHistory((prev) => [...prev, { content: prompt, role: 'user', id: messageId, createdAt: new Date(), model: null }])
      promptMutation.mutate({ chatId: id, prompt, model: model ?? 'GPT-4.1 nano', messageId })
    }
  }, [])

  useSubscription(
    trpc.chat.messages.subscriptionOptions(
      { chatId: id },
      {
        onData: (payload) => {
          if (payload.type === 'history') {
            //return if chat is clean
            console.log(payload.messages, history)
            if (payload.messages.length === 0 && history.length < 2) {
              return
            }
            startTransition(() => {
              setHistory(() => payload.messages)
              setResponse(null)
              setGenerating(false)
            })
          } else if (payload.type === 'resume') {
            console.log('Resuming chat', payload.content)
            setGenerating(true)
            setResponse((prev) => (prev ?? '') + payload.content.join(''))
          } else if (payload.type === 'message') {
            setResponse(null)
            setGenerating(false)
            setHistory((prev) => [...prev, payload.message])
          } else if (payload.type === 'token') {
            setResponse((prev) => (prev ?? '') + payload.content)
          }
        },
      },
    ),
  )

  return (
    <>
      <div className="w-full relative text-primary pb-64 px-4 pt-12">
        <AnimatePresence mode="wait" initial={true}>
          {history.length > 0 ? (
            <motion.div key={id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.1 }}>
              <div className="p-4 rounded max-w-3xl mx-auto">
                <ul className="flex flex-col gap-4">
                  {history.map((msg) => {
                    if (msg.role === 'user') {
                      return <UserMessage key={msg.id} message={msg} />
                    }
                    return <AssistantMessage key={msg.id} message={msg} />
                  })}
                  {!response && generating ? <li className="text-zinc-400 text-sm">Generating response...</li> : null}
                  {response ? (
                    <AssistantMessage message={{ id: 'response', role: '', content: response, createdAt: new Date(), model: null }} />
                  ) : null}
                </ul>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <BottomPrompt
        disabled={generating}
        onSubmit={async (prompt, model) => {
          const messageId = nanoid()
          setGenerating(true)
          setHistory((prev) => [...prev, { content: prompt, role: 'user', id: messageId, createdAt: new Date(), model: null }])
          await promptMutation.mutateAsync({ chatId: id, prompt, model, messageId })
        }}
      />
    </>
  )
}

function BottomPrompt({ onSubmit: submitHandler, disabled }: { onSubmit: (prompt: string, model: Model) => void; disabled?: boolean }) {
  const { scrollToBottom } = useStickToBottomContext()

  return (
    <div className="absolute bottom-0 w-full">
      <div className="w-11/12 mx-auto bg-panel">
        <Prompt
          disabled={disabled}
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
