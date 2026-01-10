import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}));

vi.mock('@/utils/variables', async () => {
  const actual =
    await vi.importActual<typeof import('@/utils/variables')>(
      '@/utils/variables',
    );
  return {
    ...actual,
    isDevelopment: true,
  };
});

vi.mock('next/headers', () => ({
  headers: vi.fn(),
}));

vi.mock('@/lib/rate-limit', async () => {
  const actual =
    await vi.importActual<typeof import('@/lib/rate-limit')>(
      '@/lib/rate-limit',
    );
  return {
    ...actual,
    getRateLimitIdentifier: vi.fn(
      (ip: string | null, userId?: string) => userId || ip || 'anonymous',
    ),
    checkRateLimit: vi.fn(),
  };
});

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      title: 'Something went wrong',
      description: 'An error occurred. Please try again.',
      showStack: 'Show stack trace',
      tryAgain: 'Try Again',
      reloadPage: 'Reload Page',
    };
    return translations[key] || key;
  },
  useFormatter: () => ({
    dateTime: (date: Date) => date.toISOString(),
    number: (num: number) => num.toString(),
  }),
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
  ThemeProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock('@/lib/redis', () => ({
  redis: {
    ping: vi.fn().mockResolvedValue('PONG'),
    get: vi.fn(),
    set: vi.fn(),
    del: vi.fn(),
  },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});
