import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { FaGithub } from 'react-icons/fa'
import { FcGoogle } from 'react-icons/fc'

export default function OAuthButtons() {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(true)
    try {
      await signIn(provider, { callbackUrl: '/dashboard', oauthLogin: 'true' })
    } catch (error) {
      console.error('OAuth sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <button
        type="button"
        onClick={() => handleOAuthSignIn('github')}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-gray-800 p-2 text-white transition-colors hover:bg-gray-700"
      >
        <FaGithub />
        <span>Continue with GitHub</span>
      </button>
      <button
        type="button"
        onClick={() => handleOAuthSignIn('google')}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white p-2 text-gray-800 transition-colors hover:bg-gray-50"
      >
        <FcGoogle />
        <span>Continue with Google</span>
      </button>
    </div>
  )
}