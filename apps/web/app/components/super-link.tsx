import type { ComponentProps } from 'react'
import { Link } from 'react-router'

export function SuperLink(props: ComponentProps<typeof Link>) {
  return (
    <Link onMouseDown={(e) => (e.target as HTMLAnchorElement).click()} {...props}>
      {props.children}
    </Link>
  )
}
