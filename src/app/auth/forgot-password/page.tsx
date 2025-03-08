// src/app/auth/forgot-password/page.tsx
import ForgotPasswordForm from '@/components/auth/ForgotPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Esqueci a Senha | Tarevity',
  description: 'Recupere o acesso à sua conta Tarevity',
};

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <ForgotPasswordForm />
    </div>
  );
}