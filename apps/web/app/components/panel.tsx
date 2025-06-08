import type { ComponentProps } from 'react'
import { cn } from '~/lib/cn'

export function Panel({ children, className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('bg-panel rounded-xl', className)} {...props}>
      {children}
    </div>
  )
}
