'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { NextIntlClientProvider } from 'next-intl'
import { QUERY_CACHE_CONFIG } from '@/lib/cache'

interface ProvidersProps {
  children: React.ReactNode
  locale: string
  messages: Record<string, unknown>
}

export default function Providers({
  children,
  locale,
  messages,
}: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            ...QUERY_CACHE_CONFIG.default,
            refetchInterval: false as const,
          },
        },
      }),
  )

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider refetchInterval={0}>
        <NextIntlClientProvider
          locale={locale}
          messages={messages}
          timeZone="Europe/Lisbon"
        >
          {children}
        </NextIntlClientProvider>
      </SessionProvider>
    </QueryClientProvider>
  )
}
