import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState, type ComponentProps } from 'react'
import { childrenToString } from '~/lib/children-to-string'

export function CodeBlock({ children, ...props }: ComponentProps<'code'>) {
  const { node } = props as { node: { children: [{ properties: { className: [string, string] } }] } }

  const match = /language-(\w+)/.exec(node.children[0].properties.className[1])
  const language = match?.[1] || 'plaintext'

  const code = childrenToString(children).trim()

  const [copied, setCopied] = useState(false)

  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null)
  const handleCopy = async () => {
    try {
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current)
      }

      await navigator.clipboard.writeText(code)
      setCopied(true)

      timeoutIdRef.current = setTimeout(() => {
        setCopied(false)
        timeoutIdRef.current = null
      }, 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }
  return (
    <div className="relative rounded-xl overflow-clip bg-zinc-950">
      <div className="h-10 sticky top-[15px] py-2 flex items-center justify-between px-2 space-x-2 text-xs text-zinc-50 border-zinc-800 border-b bg-zinc-950">
        <span className="font-mono  px-2 py-0.5 rounded">{language}</span>
        <button
          onClick={handleCopy}
          className="bg-zinc-800 hover:bg-zinc-700 px-2 py-0.5 rounded text-xs transition-colors cursor-pointer w-14 flex items-center justify-center"
        >
          <AnimatePresence initial={false} mode="popLayout">
            {copied ? (
              <motion.div
                key="copied"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="text-green-400"
              >
                Copied!
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="text-zinc-300"
              >
                Copy
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>

      <pre className="!px-4 py-3 !m-0 !rounded-none">
        <code>{children}</code>
      </pre>
    </div>
  )
}
