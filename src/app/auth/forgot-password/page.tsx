import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Recover Account Access | Tarevity Password Reset',
  description: 'Securely reset your password through our encrypted recovery system. Receive time-sensitive recovery links via email verification.',
  robots: 'noindex, nofollow'
}

export default function ForgotPasswordPage() {
 return (
   <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
     <ForgotPasswordForm />
   </div>
 )
}