import { Metadata } from 'next'
import dynamic from 'next/dynamic'


const ResetPasswordForm = dynamic(() => import('@/components/auth/ResetPasswordForm'), {
  loading: () => <div className="text-center">Loading...</div>,
})

export const metadata: Metadata = {
  title: 'Create New Password | Tarevity Security Center',
  description:
    'Set a new secure password with real-time strength assessment and breach verification. Your security is our priority at Tarevity.',
  robots: 'noindex, nofollow',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
