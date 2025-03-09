// src/app/auth/forgot-password/page.tsx
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Esqueci a Senha | Tarevity',
  description: 'Recupere o acesso à sua conta Tarevity',
}

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <ForgotPasswordForm />
    </div>
  )
}
