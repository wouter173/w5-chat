import { SignInButton } from '@clerk/react-router'
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
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="w-full max-w-md p-6 bg-zinc-900 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">Sign In</h1>
        <p className="mb-6">Please sign in to continue.</p>
        <SignInButton />
      </div>
    </div>
  )
}
