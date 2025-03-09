import RegisterForm from '@/components/auth/RegisterForm'

export const metadata = {
  title: 'Registrar | Tarevity',
  description: 'Crie uma nova conta no Tarevity',
}

export default function RegisterPage() {
  return (
    <div className="bg-backgroundLight dark:bg-backgroundDark flex min-h-screen items-center justify-center px-4 py-12">
      <RegisterForm />
    </div>
  )
}
