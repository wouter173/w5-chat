import { type ComponentProps } from 'react'
import { cn } from '~/lib/cn'

export function CodeInlineBlock({ className = '', children }: ComponentProps<'code'>) {
  if (typeof children !== 'string') {
    return children
  }

  return (
    <code
      className={cn(
        className,
        'px-1 relative font-mono font-normal before:inset-0 before:rounded-sm before:bg-zinc-950 inline-block -z-0 before:-z-10 before:absolute after:bg-auto',
      )}
    >
      {children}
    </code>
  )
}
