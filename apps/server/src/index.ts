import { openai } from '@ai-sdk/openai'
import { clerkMiddleware, getAuth } from '@hono/clerk-auth'
import { serve } from '@hono/node-server'
import { createNodeWebSocket } from '@hono/node-ws'
import { bus } from '@w5-chat/bus'
import { generateText, streamText } from 'ai'
import { Hono } from 'hono'
import { requireAuth } from './auth.js'

const app = new Hono()

const { injectWebSocket, upgradeWebSocket } = createNodeWebSocket({ app })

app.get('*', clerkMiddleware())
app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get(
  '/ws',
  requireAuth(),
  upgradeWebSocket((c) => ({
    onMessage(event, ws) {
      const msg = bus.decode(event.data as string)

      if (msg.type === 'hello') {
        console.log('Received hello message')
        ws.send(bus.encode({ type: 'hello' }))
      }

      if (msg.type === 'prompt') {
        ;(async () => {
          console.log('Received prompt:', msg.payload.content)
          const { textStream } = streamText({
            model: openai(msg.payload.model),
            prompt: msg.payload.content,
          })

          for await (const textPart of textStream) {
            ws.send(bus.encode({ type: 'part', payload: { content: textPart } }))
          }
        })()
      }
    },
    onClose: () => {
      console.log('Connection closed')
    },
  })),
)

const server = serve({ fetch: app.fetch, port: 3000 }, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})
injectWebSocket(server)
