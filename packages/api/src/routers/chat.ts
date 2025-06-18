import { openai } from '@ai-sdk/openai'
import { generateObject, streamText } from 'ai'
import { eq } from 'drizzle-orm'
import z from 'zod'
import { chatMessageTable, chatTable } from '../db/schema'
import { authProcedure, createTRPCRouter } from '../init'
import { ChatStream, type ChatStreamPayload, getChatStream, safeRemoveChatStream } from '../lib/chat-stream'
import { db } from '../lib/db'
import { nanoid } from '../lib/id'
import { getLanguageModel, models } from '../lib/models'
import { createMessageCache, getMessageCache, safeRemoveMessageCache } from '../lib/message-cache'

export const chatRouter = createTRPCRouter({
  models: authProcedure.query(() => models),

  list: authProcedure.query(async ({ ctx: { auth } }) => {
    const chats = await db.query.chatTable.findMany({
      where: (chat, { eq }) => eq(chat.userId, auth.userId),
      with: { messages: { columns: { content: true, role: true, createdAt: true, model: true } } },
      orderBy: (chat, { desc }) => [desc(chat.createdAt)],
    })

    return chats
  }),

  create: authProcedure.mutation(async ({ ctx: { auth } }) => {
    const chat = await db.insert(chatTable).values({ name: 'new Chat', userId: auth.userId, id: nanoid() }).returning()

    return chat[0]
  }),

  delete: authProcedure.input(z.object({ chatId: z.string() })).mutation(async ({ ctx: { auth }, input }) => {
    const chat = await db.query.chatTable.findFirst({
      where: (chat, { eq }) => eq(chat.id, input.chatId),
      with: { messages: true },
    })
    if (!chat) throw new Error('Chat not found')
    if (chat.userId !== auth.userId) throw new Error('Unauthorized')

    await db.delete(chatMessageTable).where(eq(chatMessageTable.chatId, input.chatId))
    await db.delete(chatTable).where(eq(chatTable.id, input.chatId))

    return { success: true }
  }),

  generateName: authProcedure.input(z.object({ chatId: z.string(), prompt: z.string() })).mutation(async ({ ctx: { auth }, input }) => {
    console.log('Generating chat name for chatId:', input.chatId, 'with prompt:', input.prompt)
    const chat = await db.query.chatTable.findFirst({
      where: (chat, { eq }) => eq(chat.id, input.chatId),
      with: { messages: true },
    })

    if (!chat) throw new Error('Chat not found')
    if (chat.userId !== auth.userId) throw new Error('Unauthorized')

    const {
      object: { name },
    } = await generateObject({
      model: openai('gpt-4.1-nano'),
      prompt: `
      Given the input prompt: ${input.prompt}, generate a clear and descriptive name that summarizes the main idea or functionality. The name should be concise, relevant, and easy to understand.

      Example: "write me a react component" outputs "counter react component"
      Example: "a poem about flowers" gives "flower poem"
      Example: "how do i build a house" gives "house building guide"

      Feel free to customize the instructions further based on your specific needs!
      Make it concise, relevant, and easy to understand.
      It can never be empty.
      It can never exceed 50 characters.`,
      schema: z.object({
        name: z.string().min(1, 'Chat name must not be empty').max(50, 'Chat name must not exceed 50 characters'),
      }),
    })

    await db.update(chatTable).set({ name }).where(eq(chatTable.id, input.chatId))

    console.log('Generated chat name:', name)

    return { success: true }
  }),

  prompt: authProcedure
    .input(
      z.object({
        chatId: z.string(),
        messageId: z.string().optional(),
        prompt: z.string(),
        model: z.enum([...models.openai, ...models.anthropic]),
      }),
    )
    .mutation(async function ({ ctx: { auth }, input }) {
      const chat = await db.query.chatTable.findFirst({
        where: (chat, { eq }) => eq(chat.id, input.chatId),
        with: { messages: true },
      })

      if (!chat) throw new Error('Chat not found')
      if (chat.userId !== auth.userId) throw new Error('Unauthorized')

      await db
        .insert(chatMessageTable)
        .values({ id: input.messageId ?? nanoid(), chatId: chat.id, content: input.prompt, role: 'user' })
        .returning()
        .then((rows) => rows[0])

      const chatStream = getChatStream(chat.id)
      const messageCache = createMessageCache(chat.id)

      console.log('Starting prompt generation for chatId:', input.chatId, 'with prompt:', input.prompt, 'and model:', input.model)

      const stream = await streamText({
        model: getLanguageModel(input.model),
        messages: [
          ...chat.messages.map((m) => ({
            role: m.role as 'user' | 'assistant',
            content: m.content,
          })),
          { role: 'user', content: input.prompt },
        ],
      })

      for await (const token of stream.textStream) {
        chatStream.send({ type: 'token', content: token })
        messageCache.addToken(token)
      }

      const text = await stream.text

      const responseRow = await db
        .insert(chatMessageTable)
        .values({ id: nanoid(), chatId: chat.id, content: text, model: input.model, role: 'assistant' })
        .returning()
        .then((rows) => rows[0]!)

      chatStream.send({ type: 'message', message: responseRow })
      safeRemoveChatStream(chat.id)
      safeRemoveMessageCache(chat.id)
      return text
    }),

  messages: authProcedure.input(z.object({ chatId: z.string() })).subscription(async function* ({ ctx: { auth }, input, signal }) {
    console.log('chat connected', input.chatId)
    const chat = await db.query.chatTable.findFirst({
      where: (chat, { eq }) => eq(chat.id, input.chatId),
    })

    if (!chat) throw new Error('Chat not found')
    if (chat.userId !== auth.userId) throw new Error('Unauthorized')

    const messages = await db.query.chatMessageTable.findMany({
      where: (message, { eq }) => eq(message.chatId, input.chatId),
      orderBy: (message, { asc }) => [asc(message.createdAt)],
    })

    const payload: ChatStreamPayload = {
      type: 'history',
      messages,
    }

    yield payload

    const messageCache = getMessageCache(chat.id)
    if (messageCache) {
      yield { type: 'resume', content: messageCache.getTokens() } as const
    }

    let chatStream: ChatStream | undefined = undefined
    try {
      chatStream = getChatStream(chat.id)

      for await (const payload of chatStream.toIterable({ signal })) {
        yield payload[0]
      }
    } finally {
      console.log('chat disconnected', chat.id)

      if (chatStream) {
        safeRemoveChatStream(chat.id)
      }
    }
  }),
})
