import axios, { AxiosError } from 'axios'
import { getSession, getCsrfToken } from 'next-auth/react'
import { showError, showWarning } from '@/lib/toast'

// Define the expected structure of API error responses
export interface APIErrorResponse {
  message: string
  code?: string
  // Add any other fields your API might return in errors
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

// Request interceptor
axiosClient.interceptors.request.use(
  async (config) => {
    // Only run in browser environment
    if (typeof window !== 'undefined') {
      try {
        const session = await getSession()

        if (session) {
          config.headers['X-CSRF-Token'] = getCsrfToken()
        }
      } catch (error) {
        console.error('Error getting session:', error)
      }
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor with improved error handling and toast notifications
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError<APIErrorResponse>) => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Axios error:', error)
    }

    if (error.response) {
      const status = error.response.status
      // Properly typed errorData
      const errorData = error.response.data

      switch (status) {
        case 401:
          // Handle unauthorized - redirect to login
          showError('Your session has expired. Please log in again.')
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login?error=session_expired'
          }
          break

        case 429:
          // Rate limiting
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
          // For other error statuses
          if (errorData?.message) {
            showError(errorData.message)
          }
          break
      }

      // Return standardized error object
      return Promise.reject({
        message: errorData?.message || 'An error occurred',
        status,
        code: errorData?.code,
      } as APIError)
    }

    // Network errors
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

    // Other errors
    return Promise.reject({
      message: error.message || 'Unknown error occurred',
      status: undefined,
    } satisfies APIError)
  },
)

export default axiosClient
