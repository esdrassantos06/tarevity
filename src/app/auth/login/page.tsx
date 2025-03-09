import LoginForm from '@/components/auth/LoginForm'

export const metadata = {
  title: 'Login | Tarevity',
  description: 'Entre em sua conta Tarevity',
}

export default function LoginPage() {
  return (
    <div className="bg-backgroundLight dark:bg-backgroundDark flex min-h-screen items-center justify-center px-4 py-12">
      <LoginForm />
    </div>
  )
}
