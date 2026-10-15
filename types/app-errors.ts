/**
 * Standardized error types for the application
 */

export interface ApiError {
  error: string;
  code?: string;
  details?: unknown;
  statusCode: number;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
  details?: ValidationError[] | unknown;
}

export type ErrorCode =
  | 'VALIDATION_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'NOT_FOUND'
  | 'INTERNAL_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'BAD_REQUEST'
  | 'UNKNOWN_ERROR';

export interface LoggerContext {
  userId?: string;
  requestId?: string;
  timestamp?: string;
  [key: string]: unknown;
}
