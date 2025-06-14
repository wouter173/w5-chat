import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/react-router'

export function Header() {
  return (
    <header className="flex p-4 sticky top-0 h-20">
      <div className="ml-auto">
        <SignedOut>
          <SignInButton />
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  )
}
