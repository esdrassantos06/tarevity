import axios, { AxiosError } from 'axios'
import { getSession, getCsrfToken } from 'next-auth/react'
import { showError } from '@/lib/toast'

export interface APIErrorResponse {
  message: string
  code?: string
  details?: Record<string, unknown>
  silentError?: boolean
  redirectTo?: string
  callbackUrl?: string
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
      console.error(
        'Axios error:',
        error.response?.status,
        error.response?.data,
      )
    }

    if (error.response) {
      const status = error.response.status
      const errorData = error.response.data

      if (status === 401) {
        if (typeof window !== 'undefined') {
          const redirectTo = errorData?.redirectTo || '/auth/login'
          const callbackUrl =
            errorData?.callbackUrl ||
            encodeURIComponent(window.location.pathname)

          const justLoggedInValue =
            window.sessionStorage.getItem('just_logged_in')
          const justLoggedIn =
            justLoggedInValue &&
            Date.now() - parseInt(justLoggedInValue, 10) < 5000

          if (justLoggedIn) {
            window.location.reload()
          } else {
            window.sessionStorage.removeItem('just_logged_in')
            const redirectCount = parseInt(
              window.sessionStorage.getItem('redirect_count') || '0',
              10,
            )

            if (redirectCount > 3) {
              console.error('Redirect loop detected, going to homepage')
              window.location.href = '/'
              return Promise.reject({
                message: 'Redirect loop detected',
                status,
                silentError: true,
              })
            }
            window.sessionStorage.setItem(
              'redirect_count',
              (redirectCount + 1).toString(),
            )

            showError('Your session has expired. Redirecting to login page...')

            setTimeout(() => {
              // Build redirect URL
              const loginUrl = `${redirectTo}?callbackUrl=${callbackUrl}`
              window.location.href = loginUrl
            }, 500)
          }

          // Reject promise with a silent message
          return Promise.reject({
            message: 'Session expired, redirecting to login...',
            status,
            code: errorData?.code || 'SESSION_EXPIRED',
            silentError: true,
          })
        }
      }

      // Handle other error codes
      switch (status) {
        case 403:
          showError('You do not have permission to access this resource.')
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

        case 500:
          showError('A server error occurred. Please try again later.')
          break

        default:
          if (errorData?.message && !errorData?.silentError) {
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
        'Could not connect to the server. Please check your internet connection.',
      )
      return Promise.reject({
        message:
          'Could not connect to the server. Please check your internet connection.',
        status: undefined,
      } satisfies APIError)
    }

    return Promise.reject({
      message: error.message || 'An unknown error occurred',
      status: undefined,
    } satisfies APIError)
  },
)

export default axiosClient
