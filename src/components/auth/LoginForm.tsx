'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { signIn } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Link, useRouter } from '@/i18n/navigation'
import { FaEnvelope, FaLock, FaExclamationTriangle } from 'react-icons/fa'
import { showSuccess, showError, showWarning } from '@/lib/toast'
import ValidatedInput from './ValidatedInput'
import EmailValidator from './EmailValidator'
import OAuthButtons from '@/components/auth/OAuthButtons'
import { useTranslations } from 'next-intl'

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
  const t = useTranslations('auth.login')

  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [failedAttempts, setFailedAttempts] = useState<number>(0)
  const [isLocked, setIsLocked] = useState<boolean>(false)
  const [lockoutTime, setLockoutTime] = useState<number>(0)
  const [emailValid, setEmailValid] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const errorRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'
  const errorParam = searchParams?.get('error')

  const MAX_ATTEMPTS = 5
  const BASE_LOCKOUT_TIME = 30

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

  useEffect(() => {
    if (error && errorRef.current) {
      errorRef.current.focus()
    }
  }, [error])

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

  useEffect(() => {
    if (errorParam === 'session_expired') {
      setFailedAttempts(0)
      localStorage.removeItem('loginLockout')
      showWarning(t('error.session_expired'))

      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href)
        url.searchParams.delete('error')
        window.history.replaceState({}, document.title, url.toString())
      }
    }
  }, [errorParam, t])

  const handleEmailValidation = (isValid: boolean) => {
    setEmailValid(isValid)
    if (isValid) {
      clearErrors('email')
    }
  }

  useEffect(() => {
    if (errors.email || errors.password) {
      clearErrors()
    }
  }, [watchedEmail, watchedPassword, clearErrors, errors])

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

  const formatLockoutTime = (seconds: number): string => {
    if (seconds < 60) {
      return t('time_format.seconds', { seconds })
    }

    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60

    if (remainingSeconds === 0) {
      return minutes === 1
        ? t('time_format.minute_singular')
        : t('time_format.minutes_plural', { minutes })
    }

    return minutes === 1
      ? t('time_format.minute_seconds', { minutes, seconds: remainingSeconds })
      : t('time_format.minutes_seconds', { minutes, seconds: remainingSeconds })
  }

  const onSubmit = async (data: LoginFormValues) => {
    if (isLocked) {
      showWarning(
        t('lockout.currently_locked', { time: formatLockoutTime(lockoutTime) }),
      )
      return
    }

    if (!emailValid) {
      setFormError('email', {
        type: 'manual',
        message: t('form.email.validation'),
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
          setError(t('error.lockout', { time: formatLockoutTime(lockoutTime) }))

          showWarning(
            t('error.lockout', { time: formatLockoutTime(lockoutTime) }),
          )
          reset()
        } else {
          const attemptsMessage =
            MAX_ATTEMPTS - newAttemptCount === 1
              ? t('error.attempts_singular')
              : t('error.attempts_plural', {
                  count: MAX_ATTEMPTS - newAttemptCount,
                })

          setError(
            t('error.invalid_credentials', {
              attemptsRemaining: attemptsMessage,
            }),
          )

          showError(
            t('error.invalid_credentials', {
              attemptsRemaining: attemptsMessage,
            }),
          )
        }
        return
      }

      setFailedAttempts(0)
      localStorage.removeItem('loginLockout')

      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('just_logged_in', Date.now().toString())
      }

      showSuccess('Login successful! Redirecting...')

      if (errorParam === 'session_expired') {
        window.location.href = '/dashboard'
      } else {
        setTimeout(() => {
          if (errorParam === 'session_expired') {
            router.push('/dashboard')
          } else {
            router.push(callbackUrl)
          }
        }, 500)
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || t('error.default'))
        showError(error.message || t('error.default'))
      } else {
        setError(t('error.unknown'))
        showError(t('error.unknown'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="dark:bg-BlackLight mx-auto w-full max-w-md rounded-2xl bg-white p-6 shadow-md">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
        {t('title')}
      </h1>

      {/* Error message banner */}
      {error && (
        <div
          ref={errorRef}
          className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400"
          role="alert"
          tabIndex={-1}
          aria-live="assertive"
        >
          <div className="flex items-center">
            <FaExclamationTriangle className="mr-2" aria-hidden="true" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Lockout warning banner */}
      {isLocked && (
        <div
          className="mb-4 rounded border border-yellow-400 bg-yellow-100 px-4 py-3 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
          role="alert"
          aria-live="polite"
        >
          <p>{t('lockout.warning')}</p>
          <p className="font-medium">
            {t('lockout.try_again', { time: formatLockoutTime(lockoutTime) })}
          </p>
        </div>
      )}

      <form
        ref={formRef}
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
        aria-labelledby="login-heading"
        noValidate
      >
        <div id="login-heading" className="sr-only">
          Login Form
        </div>

        {/* Email Input */}
        <ValidatedInput
          id="email"
          type="email"
          label={t('form.email.label')}
          registration={register('email')}
          error={errors.email?.message}
          placeholder={t('form.email.placeholder')}
          disabled={isLoading || isLocked}
          required
          icon={<FaEnvelope aria-hidden="true" />}
          autoComplete="email"
          validator={
            <EmailValidator
              email={watchedEmail}
              onValidation={handleEmailValidation}
            />
          }
          aria-describedby={errors.email ? 'email-error' : undefined}
        />

        {/* Password Input */}
        <ValidatedInput
          id="password"
          type="password"
          label={t('form.password.label')}
          registration={register('password')}
          error={errors.password?.message}
          placeholder={t('form.password.placeholder')}
          disabled={isLoading || isLocked}
          required
          icon={<FaLock aria-hidden="true" />}
          autoComplete="current-password"
          aria-describedby={errors.password ? 'password-error' : undefined}
        />

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center">
            <input
              id="rememberMe"
              type="checkbox"
              {...register('rememberMe')}
              className="size-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
              disabled={isLoading || isLocked}
            />
            <label
              htmlFor="rememberMe"
              className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
            >
              {t('form.remember_me')}
            </label>
          </div>

          <div className="text-sm">
            <Link
              href="/auth/forgot-password"
              className="font-medium text-blue-600 hover:text-blue-500 focus:underline focus:outline-none dark:text-blue-400"
              aria-label={t('form.forgot_password')}
            >
              {t('form.forgot_password')}
            </Link>
          </div>
        </div>

        {/* Submit Button */}
        <button
          aria-label={t('form.submit.default')}
          type="submit"
          disabled={isLoading || isLocked}
          className={`flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:outline-none ${
            isLocked
              ? 'cursor-not-allowed bg-gray-400'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800'
          }`}
          aria-disabled={isLoading || isLocked}
        >
          {isLoading ? (
            <>
              <svg
                className="mr-2 size-4 animate-spin"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
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
              {t('form.submit.loading')}
            </>
          ) : isLocked ? (
            t('form.submit.locked')
          ) : (
            t('form.submit.default')
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
            <span className="dark:bg-BlackLight bg-white px-2 text-gray-500 dark:text-gray-400">
              {t('oauth.divider')}
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
          {t('register.prompt')}{' '}
          <Link
            href="/auth/register"
            className="font-medium text-blue-600 hover:text-blue-500 focus:underline focus:outline-none dark:text-blue-400"
          >
            {t('register.link')}
          </Link>
        </p>
      </div>
    </div>
  )
}
