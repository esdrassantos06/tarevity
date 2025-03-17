import { Suspense } from 'react'
import AuthCheck from '@/components/auth/AuthCheck'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="bg-bgLight dark:bg-bgDark flex min-h-screen items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <AuthCheck>
          {children}
        </AuthCheck>
      </Suspense>
    </div>
  )
}