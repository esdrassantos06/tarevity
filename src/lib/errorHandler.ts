import { NextRequest, NextResponse } from 'next/server'
import { getTranslations } from 'next-intl/server'

export interface SafeError {
  message: string
  code: string
  status: number
}

/**
 * Sanitizes an error to ensure sensitive information isn't exposed
 * @param error The raw error that occurred
 * @returns A safe error object with sanitized message
 */
export async function sanitizeError(error: unknown): Promise<SafeError> {
  const t = await getTranslations('ErrorMessages')

  if (error instanceof Error) {
    const sanitizedMessage = await getSafeErrorMessage(error.message)

    return {
      message: sanitizedMessage,
      code: 'INTERNAL_ERROR',
      status: 500,
    }
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>

    if ('message' in errorObj && 'status' in errorObj) {
      const message =
        typeof errorObj.message === 'string'
          ? errorObj.message
          : 'Unknown error'
      const status = typeof errorObj.status === 'number' ? errorObj.status : 500
      const code =
        typeof errorObj.code === 'string' ? errorObj.code : 'UNKNOWN_ERROR'

      const translatedMessage =
        status && t(status.toString())
          ? t(status.toString())
          : await getSafeErrorMessage(message)

      return {
        message: translatedMessage,
        code,
        status,
      }
    }
  }

  return {
    message: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    status: 500,
  }
}

/**
 * Ensures error messages don't contain sensitive information
 * @param message The original error message
 * @returns A sanitized version of the message
 */
async function getSafeErrorMessage(message: string): Promise<string> {
  const sensitiveTerms = [
    'password',
    'token',
    'secret',
    'key',
    'auth',
    'database',
    'query',
    'sql',
    'supabase',
    'syntax',
    'exception',
    'stack',
    'trace',
    'internal',
  ]

  if (sensitiveTerms.some((term) => message.toLowerCase().includes(term))) {
    const t = await getTranslations('ErrorMessages')
    return t('500')
  }

  return message
}

/**
 * Middleware to handle errors in API routes
 */
export async function errorHandlerMiddleware(
  req: NextRequest,
  next: () => Promise<NextResponse>,
) {
  try {
    return await next()
  } catch (error) {
    console.error('Unhandled API error:', {
      url: req.url,
      method: req.method,
      error,
    })

    const safeError = await sanitizeError(error)

    const response = NextResponse.json(
      {
        message: safeError.message,
        code: safeError.code,
      },
      {
        status: safeError.status,
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      },
    )

    return response
  }
}

/**
 * HOC wrapper for API route handlers to provide error handling
 * @param handler The API route handler function
 * @returns A wrapped handler with error handling
 */
export function withErrorHandling(
  handler: (req: NextRequest) => Promise<NextResponse>,
) {
  return async (req: NextRequest) => {
    try {
      return await handler(req)
    } catch (error) {
      console.error('API error:', {
        url: req.url,
        method: req.method,
        error,
      })

      const safeError = await sanitizeError(error)

      return NextResponse.json(
        {
          message: safeError.message,
          code: safeError.code,
        },
        {
          status: safeError.status,
          headers: {
            'Cache-Control':
              'no-store, no-cache, must-revalidate, proxy-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        },
      )
    }
  }
}

/**
 * Helper function to create error objects
 * @param message Error message
 * @param status HTTP status code
 * @param code Error code identifier
 * @returns Standardized error object
 */
export async function createError(
  message: string,
  status = 500,
  code = 'INTERNAL_ERROR',
): Promise<SafeError> {
  return {
    message: await getSafeErrorMessage(message),
    code,
    status,
  }
}
