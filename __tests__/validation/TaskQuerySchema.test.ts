import { describe, it, expect } from 'vitest';
import { taskQuerySchema } from '@/validation/TaskQuerySchema';

describe('TaskQuerySchema', () => {
  it('should validate valid query parameters', () => {
    const validQuery = {
      page: '1',
      limit: '10',
      search: 'test',
      status: 'ACTIVE',
      priority: 'HIGH',
      sortBy: 'createdAt',
      sortOrder: 'asc',
    };

    const result = taskQuerySchema.safeParse(validQuery);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(10);
      expect(result.data.search).toBe('test');
      expect(result.data.status).toBe('ACTIVE');
      expect(result.data.priority).toBe('HIGH');
    }
  });

  it('should validate with optional parameters', () => {
    const minimalQuery = {
      page: '1',
    };

    const result = taskQuerySchema.safeParse(minimalQuery);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(6);
      expect(result.data.search).toBe('');
      expect(result.data.status).toBe('ALL');
      expect(result.data.priority).toBe('ALL');
    }
  });

  it('should validate page as number', () => {
    const query = { page: '2' };
    const result = taskQuerySchema.safeParse(query);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
    }
  });

  it('should validate limit as number', () => {
    const query = { page: '1', limit: '20' };
    const result = taskQuerySchema.safeParse(query);

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.limit).toBe(20);
    }
  });

  it('should validate status enum', () => {
    const query = { page: '1', status: 'INVALID' };
    const result = taskQuerySchema.safeParse(query);

    expect(result.success).toBe(false);
  });

  it('should validate priority enum', () => {
    const query = { page: '1', priority: 'INVALID' };
    const result = taskQuerySchema.safeParse(query);

    expect(result.success).toBe(false);
  });

  it('should validate sortBy enum', () => {
    const query = { page: '1', sortBy: 'invalid' };
    const result = taskQuerySchema.safeParse(query);

    expect(result.success).toBe(false);
  });

  it('should validate sortOrder enum', () => {
    const query = { page: '1', sortOrder: 'invalid' };
    const result = taskQuerySchema.safeParse(query);

    expect(result.success).toBe(false);
  });

  it('should accept valid sortBy values', () => {
    const sortByValues = ['createdAt', 'dueDate'];

    sortByValues.forEach((sortBy) => {
      const query = { page: '1', sortBy };
      const result = taskQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
    });
  });

  it('should accept valid sortOrder values', () => {
    const sortOrderValues = ['asc', 'desc'];

    sortOrderValues.forEach((sortOrder) => {
      const query = { page: '1', sortOrder };
      const result = taskQuerySchema.safeParse(query);
      expect(result.success).toBe(true);
    });
  });
});
