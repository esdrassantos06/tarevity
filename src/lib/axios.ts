import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios'
import { getSession, getCsrfToken } from 'next-auth/react'
import { cacheService } from './cacheService'

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

interface CachedRequestConfig extends AxiosRequestConfig {
  cache?: boolean;
  cacheTTL?: number;
  cacheKey?: string;
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

// Extended axios client with cache support
export const cachedAxios = {
  async get<T = unknown>(url: string, config: CachedRequestConfig = {}): Promise<AxiosResponse<T>> {
    const { cache = false, cacheTTL = 5 * 60 * 1000, cacheKey, ...axiosConfig } = config
    
    // If caching is disabled, just make the request
    if (!cache) {
      return axiosClient.get<T>(url, axiosConfig)
    }
    
    // Generate a cache key if not provided
    const key = cacheKey || `axios-cache:${url}:${JSON.stringify(axiosConfig.params || {})}`
    
    // Try to get from cache
    const cachedData = cacheService.get<AxiosResponse<T>>(key)
    if (cachedData) {
      return cachedData
    }
    
    // Make the request
    const response = await axiosClient.get<T>(url, axiosConfig)
    
    // Cache the response
    cacheService.set(key, response, { ttl: cacheTTL })
    
    return response
  },
  
  // Forward other methods to axios client
  post: axiosClient.post,
  put: axiosClient.put,
  delete: axiosClient.delete,
  patch: axiosClient.patch,
  
  // Method to invalidate cache for a specific URL
  invalidateCache(url: string, params: Record<string, unknown> = {}): void {
    const key = `axios-cache:${url}:${JSON.stringify(params)}`
    cacheService.remove(key)
  },
  
  // Method to invalidate all cache entries
  clearCache(): void {
    cacheService.clear()
  }
}

export default axiosClient