import { useState } from 'react'
import { Panel } from './panel'
import { useWs } from './use-ws'
import { Header } from './header'

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
    <Panel className="text-primary min-h-[calc(100dvh-16px)] mt-4 rounded-b-none rounded-tr-none border border-r-0 border-b-0 border-zinc-800">
      <Header />

      <div className="mb-4">
        <div className=" p-4 rounded whitespace-break-spaces">{chat}</div>
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
    </Panel>
  )
}
