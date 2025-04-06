'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useSearchParams } from 'next/navigation'
import { Link, useRouter } from '@/i18n/navigation'
import { toast } from 'react-toastify'
import {
  FaCheck,
  FaArrowLeft,
  FaExclamationTriangle,
  FaSpinner,
  FaLock,
} from 'react-icons/fa'
import { authAPI } from '@/lib/api'
import ValidatedInput from './ValidatedInput'
import PasswordStrengthMeter from './PasswordStrengthMeter'
import { useTranslations } from 'next-intl'

export default function EnhancedResetPasswordForm() {
  const t = useTranslations('auth.resetPassword')
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [isCurrentPassword, setIsCurrentPassword] = useState<boolean | null>(
    null,
  )
  const [passwordValid, setPasswordValid] = useState(false)
  const [passwordStrong, setPasswordStrong] = useState(false)
  const [tokenError, setTokenError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  const passwordPattern = {
    uppercase: /[A-Z]/,
    lowercase: /[a-z]/,
    number: /[0-9]/,
    special: /[^A-Za-z0-9]/,
  }

  const resetPasswordSchema = z
    .object({
      password: z
        .string()
        .min(8, t('validation.minLength'))
        .max(100, t('validation.maxLength'))
        .regex(passwordPattern.uppercase, t('validation.uppercase'))
        .regex(passwordPattern.lowercase, t('validation.lowercase'))
        .regex(passwordPattern.number, t('validation.number'))
        .regex(passwordPattern.special, t('validation.special')),
      confirmPassword: z.string().min(1, t('validation.confirmRequired')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('validation.passwordsDoNotMatch'),
      path: ['confirmPassword'],
    })

  type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError: setFormError,
    clearErrors,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const watchedPassword = watch('password')
  const watchedConfirmPassword = watch('confirmPassword')

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false)
        setTokenError(t('errors.noToken'))
        return
      }

      try {
        const result = await authAPI.validateResetToken(token)

        if (result.error) {
          setIsValidToken(false)
          setTokenError(result.error.message || t('errors.invalidToken'))
        } else {
          setIsValidToken(true)
        }
      } catch (error) {
        setIsValidToken(false)
        setTokenError(
          error instanceof Error ? error.message : t('errors.validationError'),
        )
      }
    }

    validateToken()
  }, [token, t])

  const handlePasswordValidation = (isValid: boolean, isStrong: boolean) => {
    setPasswordValid(isValid)
    setPasswordStrong(isStrong)
  }

  const checkCurrentPassword = useCallback(
    async (password: string) => {
      if (!token || password.length < 8) return null

      try {
        const result = await authAPI.checkCurrentPassword(token, password)

        if (result.error) {
          console.error('Error checking password:', result.error)
          return null
        }

        return result.data?.isCurrentPassword || false
      } catch (error) {
        console.error('Exception checking password:', error)
        return null
      }
    },
    [token],
  )

  useEffect(() => {
    if (!watchedPassword || watchedPassword.length < 8) {
      setIsCurrentPassword(null)
      return
    }

    const handler = setTimeout(async () => {
      const result = await checkCurrentPassword(watchedPassword)

      if (result === true) {
        setIsCurrentPassword(true)
        setFormError('password', {
          type: 'manual',
          message: t('validation.sameAsCurrentPassword'),
        })
      } else if (result === false) {
        setIsCurrentPassword(false)
        if (errors.password?.type === 'manual') {
          clearErrors('password')
        }
      }
    }, 500)

    return () => clearTimeout(handler)
  }, [
    watchedPassword,
    checkCurrentPassword,
    setFormError,
    clearErrors,
    errors.password?.type,
    t,
  ])

  useEffect(() => {
    if (watchedConfirmPassword && watchedPassword !== watchedConfirmPassword) {
      setFormError('confirmPassword', {
        type: 'manual',
        message: t('validation.passwordsDoNotMatch'),
      })
    } else if (
      errors.confirmPassword?.type === 'manual' &&
      watchedPassword === watchedConfirmPassword
    ) {
      clearErrors('confirmPassword')
    }
  }, [
    watchedPassword,
    watchedConfirmPassword,
    setFormError,
    clearErrors,
    errors.confirmPassword?.type,
    t,
  ])

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error(t('errors.missingToken'))
      return
    }

    if (!passwordValid || !passwordStrong) {
      setFormError('password', {
        type: 'manual',
        message: t('validation.weakPassword'),
      })
      return
    }

    if (isCurrentPassword === true) {
      setFormError('password', {
        type: 'manual',
        message: t('validation.sameAsCurrentPassword'),
      })
      return
    }

    setIsLoading(true)

    try {
      const result = await authAPI.resetPassword(token, data.password)

      if (result.error) {
        console.error('Error in reset password:', result.error)
        toast.error(result.error.message || t('errors.resetError'), {
          position: 'top-center',
          icon: <FaExclamationTriangle />,
        })
      } else {
        setIsSubmitted(true)
        toast.success(t('success.resetComplete'), {
          position: 'top-center',
          icon: <FaCheck />,
        })

        setTimeout(() => {
          router.push('/auth/login')
        }, 3000)
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : t('errors.unexpectedError'),
        {
          position: 'top-center',
        },
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (isValidToken === null) {
    return (
      <div className="dark:bg-BlackLight mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <div className="text-center">
          <FaSpinner className="mx-auto size-12 animate-spin text-blue-500" />
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            {t('verifying')}
          </p>
        </div>
      </div>
    )
  }

  if (isValidToken === false) {
    return (
      <div className="dark:bg-BlackLight mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md">
        <div className="mb-6 text-center">
          <FaExclamationTriangle className="mx-auto size-16 text-red-500" />
          <h1 className="mt-4 text-2xl font-bold text-gray-900 dark:text-white">
            {t('errors.invalidLinkTitle')}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {tokenError || t('errors.invalidLinkDesc')}
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/auth/forgot-password"
            className="inline-block rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {t('requestNewLink')}
          </Link>
          <Link
            href="/auth/login"
            className="mt-4 block text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            <FaArrowLeft className="mr-1 inline" />
            {t('backToLogin')}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="dark:bg-BlackLight mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isSubmitted ? t('success.passwordReset') : t('createNewPassword')}
        </p>
      </div>

      {isSubmitted ? (
        <div className="text-center">
          <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
            <FaCheck className="mx-auto mb-2 size-12 text-green-500 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-200">
              {t('success.passwordResetDetails')}
            </p>
          </div>

          <Link
            href="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            <FaArrowLeft className="mr-1 inline" />
            {t('backToLogin')}
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <ValidatedInput
            id="password"
            type="password"
            label={t('fields.newPassword')}
            registration={register('password')}
            error={errors.password?.message}
            placeholder={t('fields.newPasswordPlaceholder')}
            disabled={isLoading}
            required
            icon={<FaLock />}
            autoComplete="new-password"
            validator={
              <PasswordStrengthMeter
                password={watchedPassword}
                onValidation={handlePasswordValidation}
              />
            }
          />

          <ValidatedInput
            id="confirmPassword"
            type="password"
            label={t('fields.confirmPassword')}
            registration={register('confirmPassword')}
            error={errors.confirmPassword?.message}
            placeholder={t('fields.confirmPasswordPlaceholder')}
            disabled={isLoading}
            required
            icon={<FaLock />}
            autoComplete="new-password"
          />

          <button
            aria-label={t('buttons.resetPassword')}
            type="submit"
            disabled={isLoading || isCurrentPassword === true}
            className={`flex w-full items-center justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
              isLoading || isCurrentPassword === true
                ? 'cursor-not-allowed bg-gray-400'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
            }`}
          >
            {isLoading ? (
              <>
                <FaSpinner className="mr-2 size-4 animate-spin" />
                {t('buttons.processing')}
              </>
            ) : (
              t('buttons.resetPassword')
            )}
          </button>
        </form>
      )}
    </div>
  )
}
