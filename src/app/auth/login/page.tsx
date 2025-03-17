import { Metadata } from 'next'
import dynamic from 'next/dynamic'

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
  return <LoginForm />
}
