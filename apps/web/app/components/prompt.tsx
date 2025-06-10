import { CornerRightUpIcon, CornerUpRightIcon, ForwardIcon, SendHorizontalIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function Prompt({ onSubmit, disabled }: { disabled?: boolean; onSubmit: (prompt: string) => void }) {
  const [value, setValue] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 240) + 'px'
    }
  }, [value])

  const isDisabled = disabled || value.trim() === ''

  return (
    <form
      ref={formRef}
      className="w-full mx-auto max-w-3xl bg-zinc-800 box-border rounded-3xl flex"
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit(value)
        setValue('')
      }}
    >
      <label className="p-4 flex w-full">
        <textarea
          ref={textareaRef}
          onChange={(e) => setValue(e.target.value)}
          value={value}
          rows={1}
          className="w-full resize-none outline-0 placeholder:text-zinc-500"
          placeholder="Type your message here..."
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              if (formRef.current) {
                formRef.current.requestSubmit()
              }
            }
          }}
        />
      </label>
      <div className="p-2 flex items-end">
        <button
          disabled={value === ''}
          className="max-h-20 flex items-center justify-center disabled:opacity-15 hover:bg-white cursor-pointer transition-all h-full px-2 py-1 w-8 bg-zinc-200 rounded-full text-black"
        >
          <ForwardIcon size={24} className="rotate-y-180 -rotate-z-90" />
        </button>
      </div>
    </form>
  )
}
