import { bus } from '@w5-chat/bus'
import { useEffect, useRef, useState } from 'react'
import { useWs } from './use-ws'

export function Chat() {
  const [chat, setChat] = useState('')
  const [prompt, setPrompt] = useState('')
  const ws = useWs({
    onMessage: (msg) => {
      console.log('Received message:', msg)
      if (msg.type === 'part') {
        console.log('response part:', msg.payload.content)
        setChat((prevChat) => prevChat + msg.payload.content)
      }
    },
  })

  return (
    <div className="text-primary">
      <h1 className="text-2xl font-bold mb-4">Chat</h1>
      <div className="mb-4">
        <pre className="bg-gray-800 p-4 rounded whitespace-break-spaces">{chat}</pre>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          ws.send({
            type: 'prompt',
            payload: {
              content: prompt,
              model: 'o3-mini',
            },
          })
        }}
      >
        <input onChange={(e) => setPrompt(e.target.value)} value={prompt} className="border-red-500 border" type="text" />
        <button>send</button>
      </form>
    </div>
  )
}
