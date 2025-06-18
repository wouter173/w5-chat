import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router'

import type { Route } from './+types/root'
import { rootAuthLoader } from '@clerk/react-router/ssr.server'
import { ClerkProvider } from '@clerk/react-router'
import { dark } from '@clerk/themes'
import { TRPCClientProvider } from './components/trpc'

import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import geistSansWoff2 from '@fontsource-variable/geist/files/geist-latin-wght-normal.woff2?url'
import geistMonoWoff2 from '@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2?url'

import './app.css'

export async function loader(args: Route.LoaderArgs) {
  return rootAuthLoader(args)
}

export const meta: Route.MetaFunction = () => [{ title: 'W5 Chat' }]

export const links: Route.LinksFunction = () => [
  { rel: 'preload', as: 'font', type: 'font/woff2', href: geistSansWoff2, crossOrigin: 'anonymous' },
  { rel: 'preload', as: 'font', type: 'font/woff2', href: geistMonoWoff2, crossOrigin: 'anonymous' },
  { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' },
  { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
  { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' },
]

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="bg-background text-primary overscroll-none">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <script defer src="https://assets.onedollarstats.com/stonks.js" data-debug="chat.wouterdb.com"></script>
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
    <ClerkProvider appearance={{ baseTheme: dark }} loaderData={loaderData}>
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
