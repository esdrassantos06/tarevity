import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
 title: 'Reset Password | Tarevity',
 description: 'Create a new password for your Tarevity account',
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