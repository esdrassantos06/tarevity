'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import OAuthButtons from './OAuthButtons'
import { toast } from 'react-toastify'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [failedAttempts, setFailedAttempts] = useState<number>(0)
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [lockoutTime, setLockoutTime] = useState<number>(0)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'

  const MAX_ATTEMPTS = 5
  const BASE_LOCKOUT_TIME = 30

  useEffect(() => {
    const storedLockoutData = localStorage.getItem('loginLockout')

    if (storedLockoutData) {
      const lockoutData = JSON.parse(storedLockoutData)
      const currentTime = new Date().getTime()

      if (currentTime < lockoutData.expiresAt) {
        setIsLocked(true)
        setFailedAttempts(lockoutData.attempts)

        const remainingTime = Math.ceil(
          (lockoutData.expiresAt - currentTime) / 1000,
        )
        setLockoutTime(remainingTime)

        const timer = setInterval(() => {
          setLockoutTime((prevTime) => {
            if (prevTime <= 1) {
              clearInterval(timer)
              setIsLocked(false)
              return 0
            }
            return prevTime - 1
          })
        }, 1000)

        return () => clearInterval(timer)
      } else {
        setFailedAttempts(lockoutData.attempts)
        localStorage.removeItem('loginLockout')
      }
    }
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const setLoginLockout = (attempts: number) => {
    const lockoutMultiplier = Math.min(Math.pow(2, attempts - MAX_ATTEMPTS), 32)
    const lockoutDuration = BASE_LOCKOUT_TIME * lockoutMultiplier * 1000
    const expiresAt = new Date().getTime() + lockoutDuration

    localStorage.setItem(
      'loginLockout',
      JSON.stringify({
        attempts,
        expiresAt,
      }),
    )

    setIsLocked(true)
    setLockoutTime(lockoutDuration / 1000)

    const timer = setInterval(() => {
      setLockoutTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer)
          setIsLocked(false)
          return 0
        }
        return prevTime - 1
      })
    }, 1000)
  }

  const onSubmit = async (data: LoginFormValues) => {
    if (isLocked) {
      toast.error(
        `Account is locked. Please try again in ${lockoutTime} seconds.`,
      )
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      })

      if (result?.error) {
        const newAttemptCount = failedAttempts + 1
        setFailedAttempts(newAttemptCount)

        if (newAttemptCount >= MAX_ATTEMPTS) {
          setLoginLockout(newAttemptCount)
          setError(
            `Too many failed attempts. Your account is locked for ${Math.ceil(lockoutTime)} seconds.`,
          )

          reset()
        } else {
          setError(
            `Invalid credentials. ${MAX_ATTEMPTS - newAttemptCount} attempts remaining.`,
          )
        }
        return
      }

      setFailedAttempts(0)
      localStorage.removeItem('loginLockout')

      router.push(callbackUrl)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'An error occurred while logging in')
      } else {
        setError('Unknown error while logging in')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Format the lockout time in a readable format
  const formatLockoutTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} seconds`
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (remainingSeconds === 0) {
      return `${minutes} minute${minutes > 1 ? 's' : ''}`
    }

    return `${minutes} minute${minutes > 1 ? 's' : ''} and ${remainingSeconds} second${remainingSeconds > 1 ? 's' : ''}`
  }

  return (
    <div className="dark:bg-BlackLight mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-md">
      <h1 className="mb-6 text-center text-2xl font-bold dark:text-white">
        Login - Tarevity
      </h1>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          {error}
        </div>
      )}

      {isLocked && (
        <div className="mb-4 rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <p>Account is temporarily locked due to too many failed attempts.</p>
          <p className="font-medium">
            Please try again in {formatLockoutTime(lockoutTime)}.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="mt-1 block w-full rounded-md p-2 shadow-sm outline-none dark:bg-gray-700 dark:text-white"
            disabled={isLoading || isLocked}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="mt-1 block w-full rounded-md p-2 shadow-sm outline-none dark:bg-gray-700 dark:text-white"
            disabled={isLoading || isLocked}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-sm">
            <Link
              href="/auth/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading || isLocked}
          className={`flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none ${
            isLocked
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800'
          }`}
        >
          {isLoading ? 'Logging in...' : isLocked ? 'Account Locked' : 'Log in'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-lightCard/60 dark:bg-darkCard/60 px-2 text-gray-500 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6">
          <OAuthButtons />
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
