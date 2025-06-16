import type { ComponentProps } from 'react'
import { Link } from 'react-router'

export function SuperLink(props: ComponentProps<typeof Link>) {
  return (
    <Link {...props} onMouseDown={(e) => e.currentTarget.click()}>
      {props.children}
    </Link>
  )
}
