'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { FaLock, FaExclamationTriangle, FaCheck, FaTimes } from 'react-icons/fa'
import OAuthButtons from './OAuthButtons'

// Form validation schema
const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name is too long (maximum 50 characters)')
    .regex(/^[a-zA-Z0-9\s\u00C0-\u00FF]+$/, 'Name contains invalid characters')
    .transform(val => val.trim()),
    
  email: z.string()
    .email('Invalid email')
    .toLowerCase()
    .transform(val => val.trim()),
    
  password: z.string()
    .min(12, 'Password must be at least 12 characters')
    .max(100, 'Password is too long')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
    
  confirmPassword: z.string()
    .min(1, 'Password confirmation is required'),
  
  acceptTerms: z.boolean()
    .refine(val => val === true, {
      message: 'You must accept the terms to continue'
    })
})
// Add custom validation to ensure passwords match
.refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

type RegisterFormValues = z.infer<typeof registerSchema>

// Interface for password verification response
interface PasswordCheckResponse {
  isCompromised: boolean;
  strength: number;
  isStrong: boolean;
}

export default function RegisterForm() {
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [passwordCheck, setPasswordCheck] = useState<PasswordCheckResponse | null>(null)
  const [passwordValue, setPasswordValue] = useState<string>('')
  const [isCheckingPassword, setIsCheckingPassword] = useState<boolean>(false)
  const router = useRouter()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setError: setFormError,
    clearErrors,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false
    },
  })

  // Watch password field for changes
  const watchedPassword = watch('password')

  // Check password strength when it changes
  useEffect(() => {
    const checkPasswordStrength = async () => {
      // If password is empty or too short, don't check
      if (!watchedPassword || watchedPassword.length < 8) {
        setPasswordCheck(null)
        return
      }

      setPasswordValue(watchedPassword)
      setIsCheckingPassword(true)

      try {
        const response = await fetch('/api/auth/check-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: watchedPassword }),
        })

        if (!response.ok) {
          throw new Error('Failed to verify password')
        }

        const data = await response.json()
        setPasswordCheck(data)

        // Set or clear compromised password error
        if (data.isCompromised) {
          setFormError('password', { 
            type: 'manual', 
            message: 'This password was found in data breaches. Please choose another.'
          })
        } else if (!data.isStrong) {
          setFormError('password', { 
            type: 'manual', 
            message: 'This password is not strong enough. Add more varied characters.'
          })
        } else {
          // Clear only manual errors, not Zod errors
          if (errors.password?.type === 'manual') {
            clearErrors('password')
          }
        }
      } catch (err) {
        console.error('Error checking password strength:', err)
        // Do not set form error here, just log
      } finally {
        setIsCheckingPassword(false)
      }
    }

    // Debounce check to avoid too many requests
    const debounceTimer = setTimeout(checkPasswordStrength, 500)
    
    return () => clearTimeout(debounceTimer)
  }, [watchedPassword, setFormError, clearErrors, errors.password?.type])

  const onSubmit = async (data: RegisterFormValues) => {
    // Check if password is strong and not compromised
    if (passwordCheck && (passwordCheck.isCompromised || !passwordCheck.isStrong)) {
      setFormError('password', { 
        type: 'manual', 
        message: passwordCheck.isCompromised 
          ? 'This password was found in data breaches. Please choose another.' 
          : 'This password is not strong enough. Add more varied characters.' 
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Registration error')
      }

      toast.success('Account created successfully! Please log in to continue.')
      router.push('/auth/login?registered=true')
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message || 'An error occurred during registration')
      } else {
        setError('Unknown error during registration')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Function to get color based on password strength
  function getStrengthColor(strength: number): string {
    if (strength < 40) return 'bg-red-500'
    if (strength < 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  // Function to get text color based on password strength
  function getStrengthTextColor(strength: number): string {
    if (strength < 40) return 'text-red-500 dark:text-red-400'
    if (strength < 70) return 'text-yellow-500 dark:text-yellow-400'
    return 'text-green-500 dark:text-green-400'
  }

  // Function to get password strength label
  function getStrengthLabel(strength: number, isCompromised: boolean): string {
    if (isCompromised) return 'Compromised Password'
    if (strength < 40) return 'Weak Password'
    if (strength < 70) return 'Moderate Password'
    return 'Strong Password'
  }

  return (
    <div className="dark:bg-BlackLight bg-white mx-auto w-full max-w-md rounded-lg p-6 shadow-md">
      <h1 className="mb-6 text-center text-2xl font-bold dark:text-white">
        Registration - Tarevity
      </h1>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} autoComplete='off' className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.name.message}
            </p>
          )}
        </div>

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
            className="mt-1 block w-full rounded-md border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            disabled={isLoading}
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
          <div className="relative">
            <input
              id="password"
              type="password"
              {...register('password')}
              className={`mt-1 block w-full rounded-md border-gray-300 p-2 pr-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white ${
                passwordCheck && passwordValue === watchedPassword
                  ? passwordCheck.isStrong && !passwordCheck.isCompromised
                    ? 'border-green-500 dark:border-green-500'
                    : passwordCheck.isCompromised
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-yellow-500 dark:border-yellow-500'
                  : ''
              }`}
              disabled={isLoading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pt-1">
              {isCheckingPassword ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
              ) : passwordCheck && passwordValue === watchedPassword ? (
                passwordCheck.isStrong && !passwordCheck.isCompromised ? (
                  <FaCheck className="text-green-500" />
                ) : (
                  <FaExclamationTriangle 
                    className={passwordCheck.isCompromised ? "text-red-500" : "text-yellow-500"} 
                  />
                )
              ) : null}
            </div>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {errors.password.message}
            </p>
          )}

          {/* Password strength indicator */}
          {passwordCheck && passwordValue === watchedPassword && (
            <div className="mt-2">
              <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                <div
                  className={`h-2 rounded-full ${getStrengthColor(passwordCheck.strength)}`}
                  style={{ width: `${passwordCheck.strength}%` }}
                ></div>
              </div>
              <div className="mt-1 flex items-center">
                <span className={`text-xs ${getStrengthTextColor(passwordCheck.strength)}`}>
                  {getStrengthLabel(passwordCheck.strength, passwordCheck.isCompromised)}
                </span>
                
                {passwordCheck.isCompromised && (
                  <div className="ml-2 flex items-center text-xs text-red-500">
                    <FaLock className="mr-1" />
                    <span>Password leaked in databases</span>
                  </div>
                )}
              </div>
              
              {/* Password requirements */}
              <div className="mt-2 grid grid-cols-2 gap-1 text-xs">
                <div className={`flex items-center ${/[A-Z]/.test(watchedPassword) ? 'text-green-500' : 'text-gray-500'}`}>
                  {/[A-Z]/.test(watchedPassword) ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center ${/[a-z]/.test(watchedPassword) ? 'text-green-500' : 'text-gray-500'}`}>
                  {/[a-z]/.test(watchedPassword) ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                  <span>One lowercase letter</span>
                </div>
                <div className={`flex items-center ${/[0-9]/.test(watchedPassword) ? 'text-green-500' : 'text-gray-500'}`}>
                  {/[0-9]/.test(watchedPassword) ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                  <span>One number</span>
                </div>
                <div className={`flex items-center ${/[^A-Za-z0-9]/.test(watchedPassword) ? 'text-green-500' : 'text-gray-500'}`}>
                  {/[^A-Za-z0-9]/.test(watchedPassword) ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                  <span>One special character</span>
                </div>
                <div className={`flex items-center ${watchedPassword.length >= 12 ? 'text-green-500' : 'text-gray-500'}`}>
                  {watchedPassword.length >= 12 ? <FaCheck className="mr-1" /> : <FaTimes className="mr-1" />}
                  <span>Minimum 12 characters</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300"
          >
            Confirm Password
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

        <div className="mt-4">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="terms"
                type="checkbox"
                {...register('acceptTerms')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                disabled={isLoading}
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="terms" className="text-gray-600 dark:text-gray-400">
                I agree to the{' '}
                <Link href="/terms" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
                  Privacy Policy
                </Link>
              </label>
              {errors.acceptTerms && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-700 dark:hover:bg-blue-800"
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-gray-500 dark:bg-zinc-800 dark:text-gray-400">
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
          Already have an account?{' '}
          <Link
            href="/auth/login"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}