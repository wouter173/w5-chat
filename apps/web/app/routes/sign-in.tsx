import { SignInButton, useClerk } from '@clerk/react-router'
import type { Route } from './+types/sign-in'
import { getAuth } from '@clerk/react-router/ssr.server'
import { redirect } from 'react-router'

export async function loader(args: Route.LoaderArgs) {
  const auth = await getAuth(args)

  if (auth.sessionClaims) {
    return redirect('/')
  }
}

export default function SignIn() {
  const { openSignIn } = useClerk()
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex gap-2 flex-col items-center">
        <h1 className="text-2xl font-bold mb-4">Welcome to W5 Chat</h1>
        <div className="w-full max-w-md p-6 pb-5 bg-zinc-900 rounded-4xl shadow-md flex flex-col gap-4 border border-zinc-800">
          <p>
            W5 Chat is a modern chat application that allows you to interact with AI models in a conversational manner, and my entry for{' '}
            <a href="https://cloneathon.t3.chat/">cloneathon.t3.chat</a>
          </p>
          <button
            onClick={() => openSignIn()}
            className="w-fit px-4 py-2 bg-zinc-800 shadow-[0_-1px_rgba(255,255,255,0.15),0_4px_8px_rgba(0,0,0,0.05),0_1px_6px_-4px_#000] box-border rounded-3xl flex [view-transition-name:prompt] active:scale-95 transition-all hover:bg-[#2b2b2e] cursor-pointer"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  )
}
