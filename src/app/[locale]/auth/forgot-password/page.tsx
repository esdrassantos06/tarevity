import { Metadata } from 'next'
import dynamic from 'next/dynamic'

const ForgotPasswordForm = dynamic(
  () => import('@/components/auth/ForgotPasswordForm'),
  {
    loading: () => <div className="text-center">Loading...</div>,
  },
)

export const metadata: Metadata = {
  title: 'Recover Account Access | Tarevity Password Reset',
  description:
    'Securely reset your password through our encrypted recovery system. Receive time-sensitive recovery links via email verification.',
  robots: 'noindex, nofollow',
}

export default function ForgotPasswordPage() {
  return <ForgotPasswordForm />
}
