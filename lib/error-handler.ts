import { logger } from './logger';
import { isDevelopment } from '@/utils/variables';
import type {
  ApiError,
  ErrorCode,
  ErrorResponse,
  ValidationError,
} from '@/types/AppErrors';
import { ZodError } from 'zod';

/**
 * Centralized error handling utility
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code: ErrorCode = 'UNKNOWN_ERROR',
    public statusCode: number = 500,
    public details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

/**
 * Transform Zod validation errors to user-friendly format
 */
export function formatValidationError(zodError: ZodError): ValidationError[] {
  return zodError.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message,
    code: issue.code,
  }));
}

/**
 * Transform any error to a standardized API error response
 */
export function handleError(
  error: unknown,
  context?: {
    userId?: string;
    requestId?: string;
    taskId?: string;
    [key: string]: unknown;
  },
): ApiError {
  // Log the error with context
  if (error instanceof AppError) {
    logger.error(error.message, error, context);
    return {
      error: error.message,
      code: error.code,
      details: error.details,
      statusCode: error.statusCode,
    };
  }

  if (error instanceof ZodError) {
    logger.warn('Validation error', { ...context, issues: error.issues });
    return {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: formatValidationError(error),
      statusCode: 400,
    };
  }

  if (error instanceof Error) {
    logger.error('Unexpected error', error, context);
    return {
      error: isDevelopment ? error.message : 'An unexpected error occurred',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    };
  }

  logger.error('Unknown error type', undefined, {
    ...context,
    errorType: typeof error,
  });
  return {
    error: 'An unexpected error occurred',
    code: 'UNKNOWN_ERROR',
    statusCode: 500,
  };
}

/**
 * Create a standardized error response for API routes
 */
export function createErrorResponse(
  error: unknown,
  context?: {
    userId?: string;
    requestId?: string;
    taskId?: string;
    [key: string]: unknown;
  },
): ErrorResponse & { statusCode: number } {
  const apiError = handleError(error, context);
  return {
    error: apiError.error,
    code: apiError.code,
    details: apiError.details,
    statusCode: apiError.statusCode,
  };
}
