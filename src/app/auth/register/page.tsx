import { Metadata } from 'next'
import dynamic from 'next/dynamic'


const RegisterForm = dynamic(() => import('@/components/auth/RegisterForm'), {
  loading: () => <div className="text-center">Loading...</div>,
})


export const metadata: Metadata = {
  title: 'Create Your Tarevity Account | Simple Registration',
  description:
    'Join thousands of productive professionals. Create your account with enterprise-grade security, password strength verification, and data breach protection.',
  robots: 'noindex, nofollow',
}

export default function RegisterPage() {
  return  <RegisterForm />
}
