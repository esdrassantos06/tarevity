// src/app/auth/login/page.tsx
import { Suspense } from 'react'
import { Metadata } from 'next'
import dynamic from 'next/dynamic'

// Dynamically import the LoginForm
const LoginForm = dynamic(() => import('@/components/auth/LoginForm'), {
  loading: () => <div className="text-center">Loading...</div>,
})

export const metadata: Metadata = {
  title: 'Secure Login | Tarevity',
  description:
    'Access your task management dashboard securely. Multiple authentication options including passwordless login via Google and GitHub.',
  robots: 'noindex, nofollow',
}

export default function LoginPage() {
  return (
    <div className="bg-bgLight dark:bg-bgDark flex min-h-screen items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
