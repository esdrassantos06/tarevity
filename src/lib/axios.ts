import axios, { AxiosError } from 'axios'
import { getSession, getCsrfToken } from 'next-auth/react'

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

// Response interceptor with improved error handling
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
          if (typeof window !== 'undefined') {
            window.location.href = '/auth/login?error=session_expired'
          }
          break

        case 429:
          // Rate limiting
          console.warn('Request limit exceeded. Please try again later.')
          break

        case 500:
          console.error('Internal server error')
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
