import { bus } from '@w5-chat/bus'
import { useEffect, useRef } from 'react'

export function useWs({ onMessage }: { onMessage: (msg: ReturnType<typeof bus.decode>) => void }) {
  const ws = useRef<WebSocket | null>(null)

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:3000/ws')
    ws.current.onopen = () => {
      console.log('WebSocket connection established')
      ws.current?.send(bus.encode({ type: 'hello' }))
    }

    ws.current.onmessage = (event) => {
      console.log(`Message from server: ${event.data}`)
      const msg = bus.decode(event.data as string)
      onMessage?.(msg)
    }

    ws.current.onclose = () => {
      console.log('WebSocket connection closed')
    }

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error)
    }

    return () => {
      if (ws.current) {
        ws.current.close()
        ws.current = null
      }
    }
  }, [])

  return {
    send: (msg: Parameters<typeof bus.encode>[0]) => {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(bus.encode(msg))
      } else {
        console.error('WebSocket is not open. Cannot send message:', msg)
      }
    },

    close: () => {
      if (ws.current) {
        ws.current.close()
        ws.current = null
      }
    },
  }
}
