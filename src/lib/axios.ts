import axios, { AxiosError } from 'axios'
import { getSession, getCsrfToken } from 'next-auth/react'
import { showError, showWarning } from '@/lib/toast'

export interface APIErrorResponse {
  message: string
  code?: string
  details?: Record<string, unknown>
}

export interface APIError {
  message: string
  status?: number
  code?: string
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
  (error) => Promise.reject(error)
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
      const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
      const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(`${path}/`))

      const isProtectedRoute = typeof window !== 'undefined' && 
        ['/dashboard', '/profile', '/settings', '/todo'].some(path => 
          window.location.pathname.startsWith(path)
        );

        if (status === 401 && isPublicPath) {
          return Promise.reject({
            message: 'Unauthenticated on public page',
            status,
            silentError: true,
          });
        }

      switch (status) {
        case 401:
          if (isProtectedRoute) {
            showError('Your session has expired. Please log in again.')
            if (typeof window !== 'undefined') {
              window.location.href = '/auth/login?error=session_expired'
            }
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