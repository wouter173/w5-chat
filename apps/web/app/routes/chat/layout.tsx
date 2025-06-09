import { Outlet } from 'react-router'
import { Header } from '~/components/header'
import { Nav } from '~/components/nav'

export default function Layout() {
  return (
    <div className="flex min-h-screen w-full">
      <Nav />
      <main className="w-full min-h-screen bg-panel break-all text-primary rounded-b-none rounded-tr-none border border-r-0 border-b-0 border-zinc-800 mt-4 rounded-2xl">
        <Header />
        <Outlet />
      </main>
    </div>
  )
}

{
  /*  */
}
