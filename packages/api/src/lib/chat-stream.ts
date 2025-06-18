import { EventEmitter, on } from 'events'
import type { Message } from './types'

export type ChatStreamPayload =
  | { type: 'token'; content: string }
  | { type: 'resume'; content: string[] }
  | { type: 'message'; message: Message }
  | { type: 'history'; messages: Message[] }

export class ChatStream extends EventEmitter {
  isGenerating = false

  constructor() {
    super()
  }

  send(payload: ChatStreamPayload): boolean {
    if (payload.type === 'token') this.isGenerating = true
    if (payload.type === 'message') this.isGenerating = false

    return this.emit('payload', payload)
  }

  toIterable({ signal }: { signal?: AbortSignal }) {
    return on(this, 'payload', { signal }) as AsyncIterable<[ChatStreamPayload]>
  }
}

const chatStreams = new Map<string, ChatStream>()

export const getChatStream = (chatId: string) => {
  if (!chatStreams.has(chatId)) {
    chatStreams.set(chatId, new ChatStream())
  }
  return chatStreams.get(chatId)!
}

export const safeRemoveChatStream = (chatId: string) => {
  const stream = chatStreams.get(chatId)

  if (stream && !stream?.isGenerating && stream.eventNames().every((event) => stream.listenerCount(event) === 0)) {
    console.log('Removing chat stream for', chatId)
    // eslint-disable-next-line drizzle/enforce-delete-with-where
    chatStreams.delete(chatId)
  }
}
