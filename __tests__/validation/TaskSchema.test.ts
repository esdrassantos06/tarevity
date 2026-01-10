import { describe, it, expect } from 'vitest';
import { taskSchema } from '@/validation/TaskSchema';

describe('TaskSchema', () => {
  it('should validate a valid task', () => {
    const validTask = {
      title: 'Test Task',
      description: 'Test description',
      dueDate: '2024-12-31',
      priority: 'HIGH',
      status: 'ACTIVE',
    };

    const result = taskSchema.safeParse(validTask);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe('Test Task');
      expect(result.data.priority).toBe('HIGH');
    }
  });

  it('should require title', () => {
    const invalidTask = {
      description: 'Test description',
      priority: 'HIGH',
    };

    const result = taskSchema.safeParse(invalidTask);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('title');
    }
  });

  it('should validate priority enum', () => {
    const invalidTask = {
      title: 'Test Task',
      priority: 'INVALID',
    };

    const result = taskSchema.safeParse(invalidTask);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('priority');
    }
  });

  it('should validate status enum', () => {
    const invalidTask = {
      title: 'Test Task',
      priority: 'HIGH',
      status: 'INVALID',
    };

    const result = taskSchema.safeParse(invalidTask);
    expect(result.success).toBe(false);
    if (!result.success) {
      const statusError = result.error.issues.find((issue) =>
        issue.path.includes('status'),
      );
      expect(statusError).toBeDefined();
    }
  });

  it('should accept optional description', () => {
    const taskWithoutDescription = {
      title: 'Test Task',
      priority: 'MEDIUM',
    };

    const result = taskSchema.safeParse(taskWithoutDescription);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.description).toBeUndefined();
    }
  });

  it('should validate date format', () => {
    const taskWithInvalidDate = {
      title: 'Test Task',
      dueDate: 'invalid-date',
    };

    const result = taskSchema.safeParse(taskWithInvalidDate);
    expect(result.success).toBe(false);
  });
});
