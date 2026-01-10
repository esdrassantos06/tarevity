import { describe, it, expect } from 'vitest';
import {
  successResponse,
  paginatedResponse,
  errorResponse,
} from '@/lib/api-response';

describe('successResponse', () => {
  it('should create a successful response with data', async () => {
    const response = successResponse({ id: 1, name: 'Test' }, 200);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      data: { id: 1, name: 'Test' },
    });
  });

  it('should include message when provided', async () => {
    const response = successResponse({ id: 1 }, 201, 'Created successfully');
    const body = await response.json();

    expect(response.status).toBe(201);
    expect(body).toEqual({
      data: { id: 1 },
      message: 'Created successfully',
    });
  });

  it('should default to status 200', async () => {
    const response = successResponse({ data: 'test' });
    expect(response.status).toBe(200);
  });
});

describe('paginatedResponse', () => {
  it('should create a paginated response', async () => {
    const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
    const pagination = {
      page: 1,
      limit: 10,
      total: 25,
      totalPages: 3,
    };

    const response = paginatedResponse(data, pagination, 200);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({
      data,
      pagination,
    });
  });

  it('should default to status 200', async () => {
    const response = paginatedResponse([], {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    });
    expect(response.status).toBe(200);
  });
});

describe('errorResponse', () => {
  it('should create an error response from string', async () => {
    const response = errorResponse('Something went wrong', 400, 'BAD_REQUEST');
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body).toEqual({
      error: 'Something went wrong',
      code: 'BAD_REQUEST',
    });
  });

  it('should create an error response from ErrorResponse object', async () => {
    const errorObj = {
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: [{ field: 'email', message: 'Invalid email' }],
    };

    const response = errorResponse(errorObj, 422);
    const body = await response.json();

    expect(response.status).toBe(422);
    expect(body).toEqual(errorObj);
  });

  it('should include details when provided', async () => {
    const details = { field: 'name', message: 'Required' };
    const response = errorResponse(
      'Validation error',
      400,
      'VALIDATION_ERROR',
      details,
    );
    const body = await response.json();

    expect(body).toEqual({
      error: 'Validation error',
      code: 'VALIDATION_ERROR',
      details,
    });
  });

  it('should default to status 500', async () => {
    const response = errorResponse('Internal error');
    expect(response.status).toBe(500);
  });

  it('should not include code when not provided', async () => {
    const response = errorResponse('Error message', 404);
    const body = await response.json();

    expect(body).toEqual({
      error: 'Error message',
    });
    expect(body.code).toBeUndefined();
  });
});
