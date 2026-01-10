import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  AppError,
  formatValidationError,
  handleError,
  createErrorResponse,
} from '@/lib/error-handler';
import { z } from 'zod';
import { logger } from '@/lib/logger';

describe('AppError', () => {
  it('should create an AppError with default values', () => {
    const error = new AppError('Test error');
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('UNKNOWN_ERROR');
    expect(error.statusCode).toBe(500);
    expect(error.name).toBe('AppError');
    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
  });

  it('should create an AppError with custom values', () => {
    const error = new AppError('Test error', 'NOT_FOUND', 404, { id: '123' });
    expect(error.message).toBe('Test error');
    expect(error.code).toBe('NOT_FOUND');
    expect(error.statusCode).toBe(404);
    expect(error.details).toEqual({ id: '123' });
  });
});

describe('formatValidationError', () => {
  it('should format Zod validation errors correctly', () => {
    const schema = z.object({
      name: z.string().min(3, 'Name must be at least 3 characters'),
      email: z.string().email('Invalid email'),
    });

    const result = schema.safeParse({ name: 'ab', email: 'invalid' });

    if (!result.success) {
      const formatted = formatValidationError(result.error);
      expect(formatted).toHaveLength(2);
      expect(formatted[0]).toMatchObject({
        field: 'name',
        message: 'Name must be at least 3 characters',
      });
      expect(formatted[1]).toMatchObject({
        field: 'email',
        message: 'Invalid email',
      });
    }
  });

  it('should handle nested paths', () => {
    const schema = z.object({
      user: z.object({
        name: z.string().min(3),
      }),
    });

    const result = schema.safeParse({ user: { name: 'ab' } });

    if (!result.success) {
      const formatted = formatValidationError(result.error);
      expect(formatted[0].field).toBe('user.name');
    }
  });
});

describe('handleError', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle AppError instances', () => {
    const error = new AppError('Custom error', 'NOT_FOUND', 404);
    const result = handleError(error, { userId: '123' });

    expect(result).toEqual({
      error: 'Custom error',
      code: 'NOT_FOUND',
      statusCode: 404,
      details: undefined,
    });
    expect(logger.error).toHaveBeenCalledWith('Custom error', error, {
      userId: '123',
    });
  });

  it('should handle ZodError instances', () => {
    const schema = z.string().min(3);
    const result = schema.safeParse('ab');

    if (!result.success) {
      const errorResult = handleError(result.error, { userId: '123' });

      expect(errorResult).toMatchObject({
        error: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
      });
      expect(errorResult.details).toBeDefined();
      expect(logger.warn).toHaveBeenCalled();
    }
  });

  it('should handle generic Error instances', () => {
    const error = new Error('Generic error');
    const result = handleError(error, { userId: '123' });

    expect(result).toMatchObject({
      error: 'Generic error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    });
    expect(logger.error).toHaveBeenCalledWith('Unexpected error', error, {
      userId: '123',
    });
  });

  it('should handle unknown error types', () => {
    const error = 'String error';
    const result = handleError(error, { userId: '123' });

    expect(result).toMatchObject({
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
    });
    expect(logger.error).toHaveBeenCalledWith(
      'Unknown error type',
      undefined,
      expect.objectContaining({ userId: '123', errorType: 'string' }),
    );
  });

  it('should handle null errors', () => {
    const result = handleError(null, { userId: '123' });

    expect(result).toMatchObject({
      error: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      statusCode: 500,
    });
  });
});

describe('createErrorResponse', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create error response from AppError', () => {
    const error = new AppError('Custom error', 'NOT_FOUND', 404);
    const result = createErrorResponse(error, { userId: '123' });

    expect(result).toMatchObject({
      error: 'Custom error',
      code: 'NOT_FOUND',
      statusCode: 404,
    });
  });

  it('should include context in error response', () => {
    const error = new Error('Test error');
    const result = createErrorResponse(error, {
      userId: '123',
      taskId: '456',
      requestId: '789',
    });

    expect(result).toMatchObject({
      error: 'Test error',
      code: 'INTERNAL_ERROR',
      statusCode: 500,
    });
  });
});
