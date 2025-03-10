import LoginForm from '@/components/auth/LoginForm'
import { Suspense } from 'react'

export const metadata = {
 title: 'Login | Tarevity',
 description: 'Sign in to your Tarevity account',
}

export default function LoginPage() {
 return (
   <div className="bg-lightBG dark:bg-darkBG flex min-h-screen items-center justify-center px-4 py-12">
     <Suspense fallback={<div className="text-center">Loading...</div>}>
       <LoginForm />
     </Suspense>
   </div>
 )
}