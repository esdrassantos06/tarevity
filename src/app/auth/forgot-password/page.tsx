import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
 title: 'Forgot Password | Tarevity',
 description: 'Recover access to your Tarevity account',
}

export default function ForgotPasswordPage() {
 return (
   <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
     <ForgotPasswordForm />
   </div>
 )
}