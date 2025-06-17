import { Outlet, redirect } from 'react-router'
import { Nav } from '~/components/nav'
import type { Route } from './+types/layout'
import { getAuth } from '@clerk/react-router/ssr.server'
import { z } from 'zod'

export async function loader(args: Route.LoaderArgs) {
  const user = await getAuth(args)

  if (!user.sessionClaims) {
    return redirect('/sign-in')
  }

  const userData = z
    .object({
      email: z.string().email(),
      fullName: z.string().optional(),
      avatarUrl: z.string().url(),
    })
    .parse(user.sessionClaims)

  return { user: userData }
}

export default function Layout({ loaderData: { user } }: Route.ComponentProps) {
  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <Nav user={user} />
      <div className="relative w-full overflow-scroll">
        <div className="left-0 right-0 top-0 h-[15px] absolute w-full bg-background z-20"></div>
        <div className="inset-0 top-4 absolute w-full bg-[#27272a] shadow-[-1px_0_0_0_#27272a,_0_-1px_0_0_#27272a] rounded-tl-[15px]"></div>
        <div className="inset-0 bg-panel top-4 absolute w-full rounded-tl-2xl"></div>
        <Outlet />
      </div>
    </div>
  )
}
