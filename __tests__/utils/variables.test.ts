import { describe, it, expect } from 'vitest';
import { getOpenGraphLocale } from '@/utils/variables';
import type { Locale } from 'next-intl';

describe('getOpenGraphLocale', () => {
  it('should return correct OpenGraph locale for English', () => {
    expect(getOpenGraphLocale('en' as Locale)).toBe('en_US');
  });

  it('should return correct OpenGraph locale for Portuguese', () => {
    expect(getOpenGraphLocale('pt' as Locale)).toBe('pt_PT');
  });

  it('should return correct OpenGraph locale for Spanish', () => {
    expect(getOpenGraphLocale('es' as Locale)).toBe('es_ES');
  });

  it('should default to en_US for unknown locales', () => {
    expect(getOpenGraphLocale('fr' as Locale)).toBe('en_US');
    expect(getOpenGraphLocale('de' as Locale)).toBe('en_US');
  });
});
