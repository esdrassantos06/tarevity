// src/lib/errorHandler.ts

export interface SafeError {
    message: string;
    code: string;
    status: number;
  }
  
  /**
   * Sanitizes an error to ensure sensitive information isn't exposed
   * @param error The raw error that occurred
   * @returns A safe error object with sanitized message
   */
  export function sanitizeError(error: unknown): SafeError {
    if (error instanceof Error) {
      // Don't expose stack traces or detailed error messages
      const sanitizedMessage = getSafeErrorMessage(error.message);
      
      return {
        message: sanitizedMessage,
        code: 'INTERNAL_ERROR',
        status: 500
      };
    }
    
    if (typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>;
      
      if ('message' in errorObj && 'status' in errorObj) {
        const message = typeof errorObj.message === 'string' ? errorObj.message : 'Unknown error';
        const status = typeof errorObj.status === 'number' ? errorObj.status : 500;
        const code = typeof errorObj.code === 'string' ? errorObj.code : 'UNKNOWN_ERROR';
        
        return {
          message: getSafeErrorMessage(message),
          code,
          status
        };
      }
    }
    
    return {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      status: 500
    };
  }
  
  /**
   * Ensures error messages don't contain sensitive information
   * @param message The original error message
   * @returns A sanitized version of the message
   */
  function getSafeErrorMessage(message: string): string {
    // List of sensitive terms that shouldn't be exposed
    const sensitiveTerms = [
      'password', 'token', 'secret', 'key', 'auth', 
      'database', 'query', 'sql', 'supabase', 'syntax', 
      'exception', 'stack', 'trace', 'internal'
    ];
    
    // Check if the error message contains sensitive information
    if (sensitiveTerms.some(term => message.toLowerCase().includes(term))) {
      return 'An error occurred while processing your request';
    }
    
    return message;
  }
  
  // Map of safe error messages per status code
  export const safeErrorMessages: Record<number, string> = {
    400: 'The request was invalid or cannot be fulfilled',
    401: 'Authentication is required to access this resource',
    403: 'You do not have permission to access this resource',
    404: 'The requested resource was not found',
    408: 'The request timed out. Please try again',
    409: 'A conflict occurred with your request',
    413: 'The uploaded file is too large',
    422: 'Validation failed for the submitted data',
    429: 'Too many requests. Please try again later',
    500: 'An internal server error occurred',
    502: 'Bad gateway error. Please try again later',
    503: 'The service is temporarily unavailable',
    504: 'Gateway timeout. Please try again later',
  };
  
  /**
   * Middleware to handle errors in API routes
   */
  import { NextRequest, NextResponse } from 'next/server'; 
  
  export async function errorHandlerMiddleware(
    req: NextRequest,
    next: () => Promise<NextResponse>
  ) {
    try {
      return await next();
    } catch (error) {
      // Log error details (only in server logs, not exposed to client)
      console.error('Unhandled API error:', {
        url: req.url,
        method: req.method,
        error
      });
      
      // Sanitize the error for client response
      const safeError = sanitizeError(error);
      
      // Add security headers to error response
      const response = NextResponse.json(
        {
          message: safeError.message,
          code: safeError.code,
        },
        { 
          status: safeError.status,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }
      );
      
      return response;
    }
  }
  
  /**
   * HOC wrapper for API route handlers to provide error handling
   * @param handler The API route handler function
   * @returns A wrapped handler with error handling
   */
  export function withErrorHandling(
    handler: (req: NextRequest) => Promise<NextResponse>
  ) {
    return async (req: NextRequest) => {
      try {
        return await handler(req);
      } catch (error) {
        console.error('API error:', {
          url: req.url,
          method: req.method,
          error
        });
        
        const safeError = sanitizeError(error);
        
        return NextResponse.json(
          {
            message: safeError.message,
            code: safeError.code,
          },
          { 
            status: safeError.status,
            headers: {
              'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        );
      }
    };
  }
  
  /**
   * Helper function to create error objects
   * @param message Error message
   * @param status HTTP status code
   * @param code Error code identifier
   * @returns Standardized error object
   */
  export function createError(
    message: string,
    status = 500,
    code = 'INTERNAL_ERROR'
  ): SafeError {
    return {
      message: getSafeErrorMessage(message),
      code,
      status
    };
  }