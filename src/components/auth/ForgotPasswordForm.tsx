'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa'
import { authAPI } from '@/lib/api'

// Define the form validation schema
const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Initialize form with React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  // Handle form submission
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsLoading(true)

    const result = await authAPI.forgotPassword(data.email)
    
    if (result.error) {
      console.error('Error in forgot password:', result.error)
      toast.error(result.error.message || 'An error occurred while processing your request')
    } else {
      // If successful, update UI to show success message
      setIsSubmitted(true)
      toast.success(
        result.data?.message ||
          'Recovery instructions sent to your email'
      )
    }
    
    setIsLoading(false)
  }

  // Show different UI based on submission status
  return (
    <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Forgot your password?
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isSubmitted
            ? 'Check your email to reset your password.'
            : 'Enter your email and we will send instructions to reset your password.'}
        </p>
      </div>

      {isSubmitted ? (
        // Show success state after submission
        <div className="text-center">
          <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
            <FaEnvelope className="mx-auto mb-2 h-12 w-12 text-green-500 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-200">
              We have sent you an email with instructions on how to reset
              your password. The link will expire in 1 hour.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>

            <button
              onClick={() => setIsSubmitted(false)}
              className="w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            >
              Try again
            </button>

            <Link
              href="/auth/login"
              className="mt-4 block w-full text-center text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              <FaArrowLeft className="mr-1 inline" />
              Back to login
            </Link>
          </div>
        </div>
      ) : (
        // Show form when not yet submitted
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              placeholder="your@email.com"
              disabled={isLoading}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.email.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {isLoading ? 'Sending...' : 'Send instructions'}
          </button>

          <div className="mt-4 text-center">
            <Link
              href="/auth/login"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              <FaArrowLeft className="mr-1 inline" />
              Back to login
            </Link>
          </div>
        </form>
      )}
    </div>
  )
}