import ResetPasswordForm from '@/components/auth/ResetPasswordForm'
import { Metadata } from 'next'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Redefinir Senha | Tarevity',
  description: 'Crie uma nova senha para sua conta Tarevity',
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Suspense fallback={<div className="text-center">Carregando...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
