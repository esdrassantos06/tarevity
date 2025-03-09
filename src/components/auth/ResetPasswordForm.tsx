'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'react-hot-toast'
import { FaCheck, FaArrowLeft } from 'react-icons/fa'

// Define the form validation schema
const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'A senha deve ter pelo menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams?.get('token')

  // Initialize form with React Hook Form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  })

  // Validate token when component mounts
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false)
        return
      }

      try {
        const response = await fetch(
          `/api/auth/validate-reset-token?token=${token}`,
        )

        if (response.ok) {
          setIsValidToken(true)
        } else {
          setIsValidToken(false)
        }
      } catch (error) {
        console.error('Error validating token:', error)
        setIsValidToken(false)
      }
    }

    validateToken()
  }, [token])

  // Handle form submission
  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) return

    setIsLoading(true)

    try {
      // Send request to the reset password API
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          password: data.password,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || 'Ocorreu um erro ao redefinir sua senha',
        )
      }

      // If successful, update UI to show success message
      setIsSubmitted(true)
      toast.success('Senha redefinida com sucesso')

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push('/auth/login')
      }, 3000)
    } catch (error) {
      console.error('Error in reset password:', error)
      toast.error(
        error instanceof Error
          ? error.message
          : 'Ocorreu um erro ao redefinir sua senha',
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Show different UI based on token validation status
  if (isValidToken === null) {
    return (
      <div className="mx-auto w-full max-w-md rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Verificando link de redefinição de senha...
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
            Link inválido ou expirado
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Este link de redefinição de senha é inválido ou expirou. Por favor,
            solicite um novo link.
          </p>
        </div>
        <div className="text-center">
          <Link
            href="/auth/forgot-password"
            className="inline-block rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            Solicitar novo link
          </Link>
          <Link
            href="/auth/login"
            className="mt-4 block text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            <FaArrowLeft className="mr-1 inline" />
            Voltar para o login
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
          Redefinir Senha
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          {isSubmitted
            ? 'Sua senha foi redefinida com sucesso.'
            : 'Crie uma nova senha para sua conta.'}
        </p>
      </div>

      {isSubmitted ? (
        // Show success state after submission
        <div className="text-center">
          <div className="mb-6 rounded-lg bg-green-50 p-4 dark:bg-green-900/30">
            <FaCheck className="mx-auto mb-2 h-12 w-12 text-green-500 dark:text-green-400" />
            <p className="text-green-800 dark:text-green-200">
              Sua senha foi redefinida com sucesso. Você será redirecionado para
              a página de login.
            </p>
          </div>

          <Link
            href="/auth/login"
            className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            <FaArrowLeft className="mr-1 inline" />
            Voltar para o login
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
              Nova senha
            </label>
            <input
              id="password"
              type="password"
              {...register('password')}
              aria-invalid={errors.password ? 'true' : 'false'}
              aria-describedby={errors.password ? 'password-error' : undefined}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              disabled={isLoading}
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Confirmar nova senha
            </label>
            <input
              id="confirmPassword"
              type="password"
              {...register('confirmPassword')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
            disabled={isLoading}
            className="flex w-full justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:bg-blue-700 dark:hover:bg-blue-800"
          >
            {isLoading ? 'Processando...' : 'Redefinir Senha'}
          </button>
        </form>
      )}
    </div>
  )
}
