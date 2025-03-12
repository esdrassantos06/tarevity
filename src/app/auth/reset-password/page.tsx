import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Create New Password | Tarevity Security Center',
  description:
    'Set a new secure password with real-time strength assessment and breach verification. Your security is our priority at Tarevity.',
  robots: 'noindex, nofollow',
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
