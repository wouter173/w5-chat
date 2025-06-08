import { Chat } from '~/components/chat'
import type { Route } from './+types/home'
import { Nav } from '~/components/nav'
import { Header } from '~/components/header'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'W5 Chat' }, { name: 'description', content: 'Welcome to React Router!' }]
}

export default function Home() {
  return (
    <div className="flex min-h-screen w-full">
      <Nav />
      <main className="w-full min-h-screen">
        <Chat />
      </main>
    </div>
  )
}
