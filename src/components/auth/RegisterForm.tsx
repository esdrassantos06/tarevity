'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-toastify'
import { 
  FaEnvelope, 
  FaLock, 
  FaExclamationTriangle, 
  FaCheck,
  FaUserCircle
} from 'react-icons/fa'
import { useRegisterMutation } from '@/hooks/useAuthQuery'

// Import custom components
import ValidatedInput from './ValidatedInput'
import PasswordStrengthMeter from './PasswordStrengthMeter'
import EmailValidator from './EmailValidator'
import OAuthButtons from '@/components/auth/OAuthButtons'

// Password regex patterns
const passwordPattern = {
  uppercase: /[A-Z]/,
  lowercase: /[a-z]/,
  number: /[0-9]/,
  special: /[^A-Za-z0-9]/,
}

// Form validation schema with improved error messages
const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name is too long (maximum 50 characters)')
      .regex(
        /^[a-zA-Z0-9\s\u00C0-\u00FF]+$/,
        'Name contains invalid characters'
      )
      .transform((val) => val.trim()),

    email: z
      .string()
      .email('Please enter a valid email address')
      .toLowerCase()
      .transform((val) => val.trim()),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password is too long (maximum 100 characters)')
      .regex(
        passwordPattern.uppercase, 
        'Password must contain at least one uppercase letter'
      )
      .regex(
        passwordPattern.lowercase, 
        'Password must contain at least one lowercase letter'
      )
      .regex(
        passwordPattern.number, 
        'Password must contain at least one number'
      )
      .regex(
        passwordPattern.special,
        'Password must contain at least one special character'
      ),

    confirmPassword: z
      .string()
      .min(1, 'Please confirm your password'),

    acceptTerms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must accept the Terms of Service and Privacy Policy',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>

export default function EnhancedRegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [passwordValid, setPasswordValid] = useState(false)
  const [passwordStrong, setPasswordStrong] = useState(false)
  const [emailValid, setEmailValid] = useState(false)
  const router = useRouter()

  // Form initialization with React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setError: setFormError,
    clearErrors,
    // Removed trigger as it was unused
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  // Watch form fields
  const watchedPassword = watch('password')
  const watchedEmail = watch('email')
 
  const watchedConfirmPassword = watch('confirmPassword')
  
  // React Query hook for registration
  const registerMutation = useRegisterMutation()

  // Handle password validation feedback
  const handlePasswordValidation = (isValid: boolean, isStrong: boolean) => {
    setPasswordValid(isValid)
    setPasswordStrong(isStrong)
    
    if (!isValid && watchedPassword.length >= 8) {
      // Custom validation message for compromised passwords
      setFormError('password', {
        type: 'manual',
        message: 'This password is not secure enough. Please choose another.',
      })
    } else if (errors.password?.type === 'manual') {
      clearErrors('password')
    }
  }

  // Handle email validation feedback
  const handleEmailValidation = (isValid: boolean) => {
    setEmailValid(isValid)
  }

  // Effect to validate confirm password when password changes
  useEffect(() => {
    if (watchedConfirmPassword && watchedPassword !== watchedConfirmPassword) {
      setFormError('confirmPassword', {
        type: 'manual',
        message: 'Passwords do not match',
      })
    } else if (
      errors.confirmPassword?.type === 'manual' && 
      watchedPassword === watchedConfirmPassword
    ) {
      clearErrors('confirmPassword')
    }
  }, [watchedPassword, watchedConfirmPassword, setFormError, clearErrors, errors.confirmPassword?.type])

  // Form submission handler
  const onSubmit = async (data: RegisterFormValues) => {
    // Reset any previous errors
    setError(null)

    // Verify password security
    if (!passwordValid || !passwordStrong) {
      setFormError('password', {
        type: 'manual',
        message: 'Please choose a stronger password',
      })
      return
    }

    // Verify email validity
    if (!emailValid) {
      setFormError('email', {
        type: 'manual',
        message: 'Please enter a valid email address',
      })
      return
    }
    
    // Submit registration
    registerMutation.mutate(
      { 
        name: data.name, 
        email: data.email, 
        password: data.password 
      },
      {
        onSuccess: () => {
          toast.success('Account created successfully! Please log in to continue.', {
            icon: <FaCheck className="text-green-500" />,
          })
          router.push('/auth/login?registered=true')
        },
        onError: (error) => {
          const errorMessage = error.message || 'An error occurred during registration'
          
          if (
            errorMessage.toLowerCase().includes('compromised password') ||
            errorMessage.toLowerCase().includes('been pwned')
          ) {
            setError(
              'This password has appeared in data breaches and cannot be used. Please choose a different password.'
            )
            // Focus back on the password field
            document.getElementById('password')?.focus()
            toast.error('Password security issue detected. Please choose a different password.', {
              icon: <FaExclamationTriangle className="text-red-500" />,
            })
          } else if (errorMessage.toLowerCase().includes('email already')) {
            setFormError('email', {
              type: 'manual',
              message: 'This email is already registered. Please log in or use a different email.',
            })
            toast.error('Email already registered', {
              icon: <FaExclamationTriangle className="text-red-500" />,
            })
          } else {
            setError(errorMessage)
            toast.error(errorMessage || 'Registration failed. Please try again.', {
              icon: <FaExclamationTriangle className="text-red-500" />,
            })
          }
        }
      }
    )
  }

  return (
    <div className="dark:bg-BlackLight mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md">
      <h1 className="mb-6 text-center text-2xl font-bold text-gray-900 dark:text-white">
        Create Your Account
      </h1>

      {error && (
        <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-400">
          <div className="flex items-start">
            <FaExclamationTriangle className="mr-2 mt-0.5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit(onSubmit)}
        autoComplete="off"
        className="space-y-4"
        noValidate
      >
        {/* Name Input */}
        <ValidatedInput
          id="name"
          type="text"
          label="Full Name"
          registration={register('name')}
          error={errors.name?.message}
          placeholder="John Doe"
          disabled={isSubmitting}
          helperText="Your name as you'd like it to appear"
          required
          icon={<FaUserCircle />}
          maxLength={50}
          autoComplete="name"
        />

        {/* Email Input */}
        <ValidatedInput
          id="email"
          type="email"
          label="Email Address"
          registration={register('email')}
          error={errors.email?.message}
          placeholder="you@example.com"
          disabled={isSubmitting}
          required
          validator={<EmailValidator email={watchedEmail} onValidation={handleEmailValidation} />}
          icon={<FaEnvelope />}
          autoComplete="email"
        />

        {/* Password Input */}
        <ValidatedInput
          id="password"
          type="password"
          label="Password"
          registration={register('password')}
          error={errors.password?.message}
          placeholder="Create a secure password"
          disabled={isSubmitting}
          required
          validator={
            <PasswordStrengthMeter 
              password={watchedPassword} 
              onValidation={handlePasswordValidation} 
            />
          }
          icon={<FaLock />}
          autoComplete="new-password"
        />

        {/* Confirm Password Input */}
        <ValidatedInput
          id="confirmPassword"
          type="password"
          label="Confirm Password"
          registration={register('confirmPassword')}
          error={errors.confirmPassword?.message}
          placeholder="Confirm your password"
          disabled={isSubmitting}
          required
          icon={<FaLock />}
          autoComplete="new-password"
        />

        {/* Terms of Service Agreement */}
        <div className="mt-4">
          <div className="flex items-start">
            <div className="flex h-5 items-center">
              <input
                id="acceptTerms"
                type="checkbox"
                {...register('acceptTerms')}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                disabled={isSubmitting}
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="acceptTerms"
                className="text-gray-600 dark:text-gray-400"
              >
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
                >
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-700 dark:hover:bg-blue-800
            ${isSubmitting ? 'cursor-not-allowed opacity-70' : ''}
          `}
        >
          {isSubmitting ? (
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
              Creating Account...
            </>
          ) : (
            'Create Account'
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
            <span className="bg-white px-2 text-gray-500 dark:bg-zinc-800 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        <div className="mt-6">
          <OAuthButtons />
        </div>
      </div>

      {/* Login link */}
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