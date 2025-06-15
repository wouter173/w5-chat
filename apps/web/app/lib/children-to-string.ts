import { Children, isValidElement, type ReactNode } from 'react'

export function childrenToString(children: ReactNode): string {
  let result = ''

  Children.forEach(children, (child) => {
    if (child === null || child === undefined || typeof child === 'boolean') {
      return
    }

    if (typeof child === 'string' || typeof child === 'number') {
      result += child
      return
    }

    if (isValidElement(child)) {
      result += childrenToString((child.props as { children: ReactNode }).children)
      return
    }
  })

  return result
}
