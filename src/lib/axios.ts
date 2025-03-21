import axios, { AxiosError } from 'axios'
import { getSession, getCsrfToken } from 'next-auth/react'
import { showError, showWarning } from '@/lib/toast'

export interface APIErrorResponse {
  message: string
  code?: string
  details?: Record<string, unknown>
  silentError?: boolean
}

export interface APIError {
  message: string
  status?: number
  code?: string
  silentError?: boolean
}

export function isAPIError(error: unknown): error is APIError {
  return typeof error === 'object' && error !== null && 'message' in error
}

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
})

axiosClient.interceptors.request.use(
  async (config) => {
    if (typeof window !== 'undefined') {
      try {
        const session = await getSession()
        if (session) {
          const token = await getCsrfToken()
          if (token) {
            config.headers['x-csrf-token'] = token
          }
        }
      } catch (error) {
        console.error('Error getting CSRF token:', error)
      }
    }
    return config
  },
  (error) => Promise.reject(error),
)

axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<APIErrorResponse>) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Axios error:', error)
    }

    if (error.response) {
      const status = error.response.status
      const errorData = error.response.data

      const publicPaths = ['/', '/privacy', '/terms']
      const pathname =
        typeof window !== 'undefined' ? window.location.pathname : ''
      const isPublicPath = publicPaths.some(
        (path) => pathname === path || pathname.startsWith(`${path}/`),
      )

      const isProtectedRoute =
        typeof window !== 'undefined' &&
        ['/dashboard', '/profile', '/settings', '/todo'].some((path) =>
          window.location.pathname.startsWith(path),
        )

      if (status === 401 && isPublicPath) {
        return Promise.reject({
          message: 'Unauthenticated on public page',
          status,
          silentError: true,
        })
      }

      switch (status) {
        case 401:
          if (isProtectedRoute) {
            const justLoggedInValue =
              window.sessionStorage.getItem('just_logged_in')
            const justLoggedIn =
              justLoggedInValue &&
              Date.now() - parseInt(justLoggedInValue, 10) < 5000

            if (justLoggedIn) {
              if (!window.location.pathname.includes('/auth/login')) {
                window.location.reload()
              }
              return Promise.reject({
                message: 'Session initializing...',
                status,
                silentError: true,
              })
            }
            window.sessionStorage.removeItem('just_logged_in')

            showError('Your session has expired. Please log in again.')
            if (typeof window !== 'undefined') {
              const currentPath = window.location.pathname
              window.location.href = `/auth/login?callbackUrl=${encodeURIComponent(currentPath)}`
            }
          }
          break

        case 409:
          if (
            errorData?.code === 'EMAIL_EXISTS' ||
            errorData?.message?.toLowerCase().includes('email already')
          ) {
            return Promise.reject({
              message: errorData?.message || 'Email already registered',
              status,
              code: errorData?.code,
              silentError: true,
            })
          }
          if (errorData?.message && !errorData?.silentError) {
            showError(errorData.message)
          }
          break

        case 429:
          const retryAfter = error.response.headers['retry-after']
          const waitTime = retryAfter ? parseInt(retryAfter, 10) : 60

          showWarning(
            `Too many requests. Please try again in ${Math.ceil(waitTime / 60)} minute${
              Math.ceil(waitTime / 60) > 1 ? 's' : ''
            }.`,
          )
          break

        case 500:
          showError('A server error occurred. Please try again later.')
          break

        default:
          if (errorData?.message) {
            showError(errorData.message)
          }
          break
      }

      return Promise.reject({
        message: errorData?.message || 'An error occurred',
        status,
        code: errorData?.code,
        silentError: errorData?.silentError,
      } as APIError)
    }

    if (error.request) {
      showError(
        'Unable to connect to server. Please check your internet connection.',
      )
      return Promise.reject({
        message:
          'Unable to connect to server. Please check your internet connection.',
        status: undefined,
      } satisfies APIError)
    }

    return Promise.reject({
      message: error.message || 'Unknown error occurred',
      status: undefined,
    } satisfies APIError)
  },
)

export default axiosClient
