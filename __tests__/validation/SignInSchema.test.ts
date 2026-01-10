import { describe, it, expect } from 'vitest';
import { signInSchema } from '@/validation/SignInSchema';

describe('SignInSchema', () => {
  it('should validate valid sign-in data', () => {
    const validData = {
      email: 'test@example.com',
      password: 'password123',
    };

    const result = signInSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe('test@example.com');
      expect(result.data.password).toBe('password123');
    }
  });

  it('should require email', () => {
    const invalidData = {
      password: 'password123',
    };

    const result = signInSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('should require password', () => {
    const invalidData = {
      email: 'test@example.com',
    };

    const result = signInSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('password');
    }
  });

  it('should validate email format', () => {
    const invalidData = {
      email: 'invalid-email',
      password: 'password123',
    };

    const result = signInSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toContain('email');
    }
  });

  it('should accept valid email formats', () => {
    const validEmails = [
      'test@example.com',
      'user.name@example.co.uk',
      'user+tag@example.com',
    ];

    validEmails.forEach((email) => {
      const data = { email, password: 'password123' };
      const result = signInSchema.safeParse(data);
      expect(result.success).toBe(true);
    });
  });
});
