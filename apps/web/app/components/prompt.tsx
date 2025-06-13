import { ChevronsUpDownIcon, ForwardIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { ModelSelect } from './model-select'
import type { Model } from '@w5-chat/api'

export function Prompt({ onSubmit, disabled }: { disabled?: boolean; onSubmit: (prompt: string, model: Model) => void }) {
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

  const [model, setModel] = useState<Model>('o4-mini')

  return (
    <div className="relative w-full mx-auto max-w-3xl">
      <div className="absolute left-0 right-0 h-10 bg-gradient-to-t from-zinc-900 bottom-full" />
      <form
        ref={formRef}
        className="w-full bg-zinc-800 shadow-[0_-1px_rgba(255,255,255,0.15),0_4px_8px_rgba(0,0,0,0.05),0_1px_6px_-4px_#000] box-border rounded-3xl flex [view-transition-name:prompt]"
        onSubmit={(e) => {
          e.preventDefault()
          onSubmit(value, model)
          setValue('')
        }}
      >
        <div className="flex flex-col w-full">
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
                  if (formRef.current) formRef.current.requestSubmit()
                }
              }}
            />
          </label>
          <label className="px-3.5 pb-3">
            <ModelSelect value={model} onChange={(value) => setModel(value as Model)}>
              <button className="w-fit min-w-20 border rounded-full pl-3 pr-2 py-1 text-sm border-zinc-700 shadow-lg flex items-center text-zinc-300 hover:text-zinc-50 transition-all focus:outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 justify-between">
                {model ? model : 'Select model'}
                <ChevronsUpDownIcon size={14} className="ml-2 inline-block" />
              </button>
            </ModelSelect>
          </label>
        </div>
        <div className="p-2 flex items-end">
          <button
            disabled={isDisabled}
            className="max-h-20 flex items-center justify-center disabled:opacity-15 enabled:hover:bg-white enabled:cursor-pointer transition-all h-full px-2 py-1 w-8 bg-zinc-200 rounded-full text-black shadow-[2px_2px_4px_rgba(255,255,255,0.1),-2px_2px_4px_rgba(255,255,255,0.1),-2px_-2px_4px_rgba(255,255,255,0.1),2px_-2px_4px_rgba(255,255,255,0.1)] "
          >
            <ForwardIcon size={24} className="rotate-y-180 -rotate-z-90" />
          </button>
        </div>
      </form>
    </div>
  )
}
