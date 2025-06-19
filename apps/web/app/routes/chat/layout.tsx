import { SignedOut, useUser } from '@clerk/react-router'
import { useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router'
import { Nav } from '~/components/nav'

export default function Layout() {
  return (
    <div className="flex min-h-screen w-full overflow-hidden">
      <SignedOut>
        <Navigate to="/sign-in" replace />
      </SignedOut>
      <Nav />
      <div className="relative w-full overflow-scroll">
        <div className="left-0 right-0 top-0 h-[15px] absolute w-full bg-background z-20"></div>
        <div className="inset-0 top-4 absolute w-full bg-[#27272a] shadow-[-1px_0_0_0_#27272a,_0_-1px_0_0_#27272a] rounded-tl-[15px]"></div>
        <div className="inset-0 bg-panel top-4 absolute w-full rounded-tl-2xl"></div>
        <Outlet />
      </div>
    </div>
  )
}
