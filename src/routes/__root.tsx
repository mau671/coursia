import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
  useLocation,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import { Header } from '#/components/header'
import { Providers } from '#/components/providers'

import type { QueryClient } from '@tanstack/react-query'

interface MyRouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  notFoundComponent: () => (
    <div className="flex flex-col items-center justify-center grow p-8">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="mt-2 text-muted-foreground">Página no encontrada</p>
    </div>
  ),

  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Coursia',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const isAuthPage = location.pathname.startsWith('/auth')

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className="overflow-hidden"
    >
      <head>
        <HeadContent />
      </head>
      <body className="antialiased h-svh flex flex-col overflow-hidden">
        <Providers>
          {!isAuthPage && <Header />}
          <div className="flex-1 min-h-0 overflow-y-auto [scrollbar-gutter:stable]">
            {children}
          </div>
        </Providers>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
