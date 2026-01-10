import { describe, it, expect, vi } from 'vitest';
import { formatText, translatePriority, translateStatus } from '@/utils/text';

describe('formatText', () => {
  it('should capitalize first letter and lowercase the rest', () => {
    expect(formatText('HELLO')).toBe('Hello');
    expect(formatText('hello')).toBe('Hello');
    expect(formatText('hELLO')).toBe('Hello');
  });

  it('should handle single character', () => {
    expect(formatText('a')).toBe('A');
    expect(formatText('A')).toBe('A');
  });

  it('should handle empty string', () => {
    expect(formatText('')).toBe('');
  });
});

describe('translatePriority', () => {
  const mockTranslator = vi.fn((key: string) => key);

  it('should translate LOW priority', () => {
    const result = translatePriority('LOW', mockTranslator);
    expect(result).toBe('priorities.LOW');
    expect(mockTranslator).toHaveBeenCalledWith('priorities.LOW');
  });

  it('should translate MEDIUM priority', () => {
    const result = translatePriority('MEDIUM', mockTranslator);
    expect(result).toBe('priorities.MEDIUM');
    expect(mockTranslator).toHaveBeenCalledWith('priorities.MEDIUM');
  });

  it('should translate HIGH priority', () => {
    const result = translatePriority('HIGH', mockTranslator);
    expect(result).toBe('priorities.HIGH');
    expect(mockTranslator).toHaveBeenCalledWith('priorities.HIGH');
  });
});

describe('translateStatus', () => {
  const mockTranslator = vi.fn((key: string) => key);

  it('should translate ACTIVE status', () => {
    const result = translateStatus('ACTIVE', mockTranslator);
    expect(result).toBe('statuses.ACTIVE');
    expect(mockTranslator).toHaveBeenCalledWith('statuses.ACTIVE');
  });

  it('should translate REVIEW status', () => {
    const result = translateStatus('REVIEW', mockTranslator);
    expect(result).toBe('statuses.REVIEW');
    expect(mockTranslator).toHaveBeenCalledWith('statuses.REVIEW');
  });

  it('should translate COMPLETED status', () => {
    const result = translateStatus('COMPLETED', mockTranslator);
    expect(result).toBe('statuses.COMPLETED');
    expect(mockTranslator).toHaveBeenCalledWith('statuses.COMPLETED');
  });
});
