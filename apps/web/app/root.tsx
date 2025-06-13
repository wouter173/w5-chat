import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'

import '@fontsource-variable/geist'
import openSansWoff2 from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url'

import type { Route } from './+types/root'
import './app.css'
import { rootAuthLoader } from '@clerk/react-router/ssr.server'
import { ClerkProvider, SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/react-router'
import { dark } from '@clerk/themes'
import { TRPCClientProvider } from './components/trpc'

export async function loader(args: Route.LoaderArgs) {
  return rootAuthLoader(args)
}

export const meta: Route.MetaFunction = () => [{ title: 'W5 Chat' }]

export const links: Route.LinksFunction = () => [
  {
    rel: 'preload',
    as: 'font',
    type: 'font/woff2',
    href: openSansWoff2,
    crossOrigin: 'anonymous',
  },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-background text-primary overscroll-none">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-primary font-sans overscroll-none">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App({ loaderData }: Route.ComponentProps) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
      loaderData={loaderData}
      signUpFallbackRedirectUrl="/"
      signInFallbackRedirectUrl="/"
    >
      <TRPCClientProvider>
        <Outlet />
      </TRPCClientProvider>
    </ClerkProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = 'Oops!'
  let details = 'An unexpected error occurred.'
  let stack: string | undefined

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? '404' : 'Error'
    details = error.status === 404 ? 'The requested page could not be found.' : error.statusText || details
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message
    stack = error.stack
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  )
}
