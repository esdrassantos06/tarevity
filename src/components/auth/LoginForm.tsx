'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { FaEnvelope, FaLock, FaExclamationTriangle } from 'react-icons/fa'
import { showSuccess, showError, showWarning } from '@/lib/toast'

import ValidatedInput from './ValidatedInput'
import EmailValidator from './EmailValidator'
import OAuthButtons from '@/components/auth/OAuthButtons'

// Form validation schema
const loginSchema = z.object({
  email: z
    .string()
    .email('Please enter a valid email')
    .min(1, 'Email is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function EnhancedLoginForm() {
  // State management
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [failedAttempts, setFailedAttempts] = useState<number>(0)
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [lockoutTime, setLockoutTime] = useState<number>(0)
  const [emailValid, setEmailValid] = useState(false)

  // Router and URL parameters
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'
  const registeredParam = searchParams?.get('registered')

  // Constants
  const MAX_ATTEMPTS = 5
  const BASE_LOCKOUT_TIME = 30

  // Initialize form
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setError: setFormError,
    clearErrors,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  })

  const watchedEmail = watch('email')
  const watchedPassword = watch('password')

  // Check if there was a previous lockout
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

  // Show success message if coming from registration
  useEffect(() => {
    if (registeredParam === 'true') {
      showSuccess(
        'Account created successfully! Please log in with your new credentials.',
      )
    }
  }, [registeredParam])

  // Email validation handler
  const handleEmailValidation = (isValid: boolean) => {
    setEmailValid(isValid)
    // Clear email error if validation passes
    if (isValid) {
      clearErrors('email')
    }
  }

  // Use effect to clear errors when input changes
  useEffect(() => {
    if (errors.email || errors.password) {
      clearErrors()
    }
  }, [watchedEmail, watchedPassword, clearErrors, errors])

  // Set login lockout
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

  // Form submission handler
  const onSubmit = async (data: LoginFormValues) => {
    if (isLocked) {
      showWarning(
        `Account is locked. Please try again in ${formatLockoutTime(lockoutTime)}.`,
      )
      return
    }

    if (!emailValid) {
      setFormError('email', {
        type: 'manual',
        message: 'Please enter a valid email address',
      })
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
            `Too many failed attempts. Your account is locked for ${formatLockoutTime(lockoutTime)}.`,
          )

          showWarning(
            `Too many failed attempts. Account locked for ${formatLockoutTime(lockoutTime)}.`,
          )
          reset()
        } else {
          const attemptsMessage =
            MAX_ATTEMPTS - newAttemptCount === 1
              ? '1 attempt'
              : `${MAX_ATTEMPTS - newAttemptCount} attempts`

          setError(
            `Invalid email or password. ${attemptsMessage} remaining before temporary lockout.`,
          )

          showError(
            `Invalid email or password. ${attemptsMessage} remaining before temporary lockout.`,
          )
        }
        return
      }

      // Success - reset counters and redirect
      setFailedAttempts(0)
      localStorage.removeItem('loginLockout')

      showSuccess('Login successful! Redirecting...')

      // Delayed redirect for better UX
      setTimeout(() => {
        router.push(callbackUrl)
      }, 1000)
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(
          error.message || 'An unexpected error occurred while logging in',
        )
        showError(
          error.message || 'An unexpected error occurred while logging in',
        )
      } else {
        setError('Unknown error while logging in')
        showError('Unknown error while logging in')
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
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
        Login to Tarevity
      </h1>

      {/* Error message banner */}
      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Lockout warning banner */}
      {isLocked && (
        <div className="mb-4 rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
          <p>Account is temporarily locked due to too many failed attempts.</p>
          <p className="font-medium">
            Please try again in {formatLockoutTime(lockoutTime)}.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Input */}
        <ValidatedInput
          id="email"
          type="email"
          label="Email Address"
          registration={register('email')}
          error={errors.email?.message}
          placeholder="you@example.com"
          disabled={isLoading || isLocked}
          required
          icon={<FaEnvelope />}
          autoComplete="email"
          validator={
            <EmailValidator
              email={watchedEmail}
              onValidation={handleEmailValidation}
            />
          }
        />

        {/* Password Input */}
        <ValidatedInput
          id="password"
          type="password"
          label="Password"
          registration={register('password')}
          error={errors.password?.message}
          placeholder="Your password"
          disabled={isLoading || isLocked}
          required
          icon={<FaLock />}
          autoComplete="current-password"
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              {...register('rememberMe')}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              disabled={isLoading || isLocked}
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <Link
              href="/auth/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading || isLocked}
          className={`flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none ${
            isLocked
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800'
          }`}
        >
          {isLoading ? (
            <>
              <svg className="mr-2 h-4 w-4 animate-spin" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Logging in...
            </>
          ) : isLocked ? (
            'Account Locked'
          ) : (
            'Log in'
          )}
        </button>
      </form>

      {/* OAuth Sign-in Section */}
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

      {/* Register Link */}
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
