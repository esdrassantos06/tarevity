'use client'

import { useSession } from 'next-auth/react'
import { useEffect } from 'react'

export default function AuthCheck({ children }) {
  const { status } = useSession()

  useEffect(() => {
    if (status === 'authenticated') {
      window.location.href = '/dashboard'
    }
  }, [status])

  return <>{children}</>
}
