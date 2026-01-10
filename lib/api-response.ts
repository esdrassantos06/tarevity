import { NextResponse } from 'next/server';
import type { ErrorResponse } from '@/types/AppErrors';

/**
 * Standardized API response helpers
 */

export interface SuccessResponse<T = unknown> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T = unknown> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Create a successful JSON response
 */
export function successResponse<T>(
  data: T,
  status: number = 200,
  message?: string,
): NextResponse<SuccessResponse<T>> {
  const response: SuccessResponse<T> = { data };
  if (message) {
    response.message = message;
  }
  return NextResponse.json(response, { status });
}

/**
 * Create a paginated JSON response
 */
export function paginatedResponse<T>(
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  },
  status: number = 200,
): NextResponse<PaginatedResponse<T>> {
  return NextResponse.json(
    {
      data,
      pagination,
    },
    { status },
  );
}

/**
 * Create an error JSON response
 */
export function errorResponse(
  error: string | ErrorResponse,
  status: number = 500,
  code?: string,
  details?: unknown,
): NextResponse<ErrorResponse> {
  const response: ErrorResponse =
    typeof error === 'string'
      ? {
          error,
          ...(code && { code }),
          ...(details ? { details } : {}),
        }
      : error;

  return NextResponse.json(response, { status });
}
