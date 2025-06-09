import z from 'zod'
import { chatMessageTable, chatTable } from '../db/schema'
import { authProcedure, createTRPCRouter } from '../init'
import { db } from '../lib/db'
import { generateObject, streamText } from 'ai'
import { getLanguageModel, models } from '../lib/models'
import { openai } from '@ai-sdk/openai'
import { nanoid } from '../lib/id'
import { ChatStream, ChatStreamPayload, getChatStream, safeRemoveChatStream } from '../lib/chat-stream'

export const chatRouter = createTRPCRouter({
  list: authProcedure.query(async ({ ctx: { auth } }) => {
    const chats = await db.query.chatTable.findMany({
      where: (chat, { eq }) => eq(chat.userId, auth.userId),
      with: { messages: { columns: { content: true, role: true, createdAt: true, model: true } } },
    })

    return chats
  }),

  create: authProcedure.input(z.object({ prompt: z.string() })).mutation(async ({ ctx: { auth }, input }) => {
    const {
      object: { name },
    } = await generateObject({
      model: openai('o3-mini'),
      prompt: `generate a chat name based on the following prompt: ${input.prompt}`,
      schema: z.object({
        name: z.string().min(1, 'Chat name must not be empty').max(50, 'Chat name must not exceed 50 characters'),
      }),
    })

    const chat = await db.insert(chatTable).values({ name, userId: auth.userId, id: nanoid() }).returning()

    return chat[0]
  }),

  prompt: authProcedure
    .input(
      z.object({
        chatId: z.string(),
        messages: z.array(z.object({ content: z.string(), role: z.enum(['user', 'system']) })),
        prompt: z.string(),
        model: z.enum(models),
      }),
    )
    .mutation(async function ({ ctx: { auth }, input }) {
      const chat = await db.query.chatTable.findFirst({
        where: (chat, { eq }) => eq(chat.id, input.chatId),
      })

      if (!chat) throw new Error('Chat not found')
      if (chat.userId !== auth.userId) throw new Error('Unauthorized')

      await db.insert(chatMessageTable).values({ id: nanoid(), chatId: chat.id, content: input.prompt, role: 'user' })

      const chatStream = getChatStream(chat.id)

      const { textStream } = await streamText({
        model: getLanguageModel(input.model),
        messages: [...input.messages, { role: 'user', content: input.prompt }],
      })

      let response = ''

      for await (const token of textStream) {
        chatStream.send({ type: 'token', content: token })
        response += token
      }

      const responseRow = await db
        .insert(chatMessageTable)
        .values({ id: nanoid(), chatId: chat.id, content: response, model: input.model, role: 'system' })
        .returning()
        .then((rows) => rows[0])

      chatStream.send({ type: 'done', message: responseRow })
      safeRemoveChatStream(chat.id)
      return response
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
