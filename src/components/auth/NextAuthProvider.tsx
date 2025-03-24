'use client'

import { SessionProvider } from 'next-auth/react'
import NotificationUpdater from '@/components/notifications/NotificationUpdater' // He needs to be imported inside a session provider

export function NextAuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      {children}
      <NotificationUpdater />
    </SessionProvider>
  )
}
