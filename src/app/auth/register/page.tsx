import { Metadata } from 'next'
import RegisterForm from '@/components/auth/RegisterForm'

export const metadata: Metadata = {
  title: 'Create Your Tarevity Account | Simple Registration',
  description:
    'Join thousands of productive professionals. Create your account with enterprise-grade security, password strength verification, and data breach protection.',
  robots: 'noindex, nofollow',
}

export default function RegisterPage() {
  return (
    <div className="bg-backgroundLight dark:bg-backgroundDark flex min-h-screen items-center justify-center px-4 py-12">
      <RegisterForm />
    </div>
  )
}
