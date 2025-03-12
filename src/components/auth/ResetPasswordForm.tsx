'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { FaCheck, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa'
import { authAPI } from '@/lib/api'

// Define the form validation schema
const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const [isCurrentPassword, setIsCurrentPassword] = useState<boolean | null>(null)
  const [isCheckingPassword, setIsCheckingPassword] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  // Initialize form with React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError,
    clearErrors,
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  const watchedPassword = watch('password')

  // Validate token when component mounts
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false)
        return
      }

      const result = await authAPI.validateResetToken(token)
      
      if (result.error) {
        setIsValidToken(false)
      } else {
        setIsValidToken(true)
      }
    }

    validateToken()
  }, [token])

  // Check if password matches current one
  const checkCurrentPassword = useCallback(async (password: string) => {
    if (!token || password.length < 8) return null;
    
    setIsCheckingPassword(true);
    
    try {
      const result = await authAPI.checkCurrentPassword(token, password);
      
      if (result.error) {
        console.error("Error checking password:", result.error);
        return null;
      }
      
      return result.data?.isCurrentPassword || false;
    } catch (error) {
      console.error("Exception checking password:", error);
      return null;
    } finally {
      setIsCheckingPassword(false);
    }
  }, [token]);

  // Check password when it changes
  useEffect(() => {
    if (!watchedPassword || watchedPassword.length < 8) {
      setIsCurrentPassword(null);
      return;
    }

    const handler = setTimeout(async () => {
      const result = await checkCurrentPassword(watchedPassword);
      
      if (result === true) {
        setIsCurrentPassword(true);
        setError('password', { 
          type: 'manual', 
          message: 'New password cannot be the same as your current password' 
        });
      } else if (result === false) {
        setIsCurrentPassword(false);
        // Only clear manual errors
        if (errors.password?.type === 'manual') {
          clearErrors('password');
        }
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [watchedPassword, checkCurrentPassword, setError, clearErrors, errors.password?.type]);

  // Handle form submission
  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) return;

    setIsLoading(true);

    // Double-check if password is current
    const isCurrent = await checkCurrentPassword(data.password);
    
    if (isCurrent) {
      setError('password', { 
        type: 'manual', 
        message: 'New password cannot be the same as your current password' 
      });
      setIsLoading(false);
      return;
    }

    // Submit the form
    const result = await authAPI.resetPassword(token, data.password);
    
    if (result.error) {
      console.error('Error in reset password:', result.error);
      toast.error(result.error.message || 'An error occurred while resetting your password');
    } else {
      setIsSubmitted(true);
      toast.success('Password reset successfully');

      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    }
    
    setIsLoading(false);
  }

  // Show different UI based on token validation status
  if (isValidToken === null) {
    return (
      <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Verifying password reset link...
          </p>
        </div>
      </div>
    )
  }

  if (isValidToken === false) {
    return (
      <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Invalid or expired link
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            This password reset link is invalid or has expired. Please request a new link.
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/auth/forgot-password"
            className="inline-block rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Request new link
          </Link>
          <Link
            href="/auth/login"
            className="mt-4 block text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            <FaArrowLeft className="mr-1 inline" />
            Back to login
          </Link>
        </div>
      </div>
    )
  }

  // Show UI for valid token
  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Reset Password
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isSubmitted
            ? 'Your password has been reset successfully.'
            : 'Create a new password for your account.'}
        </p>
      </div>

      {isSubmitted ? (
        // Show success state after submission
        <div className="text-center">
          <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
            <FaCheck className="mx-auto mb-2 h-12 w-12 text-green-500 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-200">
              Your password has been reset successfully. You will be redirected to the login page.
            </p>
          </div>

          <Link
            href="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            <FaArrowLeft className="mr-1 inline" />
            Back to login
          </Link>
        </div>
      ) : (
        // Show form when not yet submitted
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              New password
            </label>
            <div className="relative">
              <input
                id="password"
                type="password"
                {...register('password')}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
                className={`mt-1 block w-full rounded-md border-gray-300 p-2 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                  isCurrentPassword === true
                    ? 'border-red-500 dark:border-red-500'
                    : ''
                }`}
                disabled={isLoading}
              />
              {isCheckingPassword && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pt-1">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
                </div>
              )}
              {isCurrentPassword === true && !isCheckingPassword && (
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pt-1">
                  <FaExclamationTriangle className="text-red-500" />
                </div>
              )}
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400" id="password-error">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading || isCurrentPassword === true}
            className={`flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none ${
              isLoading || isCurrentPassword === true
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'
            }`}
          >
            {isLoading ? 'Processing...' : 'Reset Password'}
          </button>
        </form>
      )}
    </div>
  )
}