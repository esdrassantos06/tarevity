import ResetPasswordForm from '@/components/auth/ResetPasswordForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redefinir Senha | Tarevity',
  description: 'Crie uma nova senha para sua conta Tarevity',
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gray-50 dark:bg-gray-900">
      <ResetPasswordForm />
    </div>
  );
}