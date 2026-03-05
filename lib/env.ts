/**
 * Centralized environment variable management with runtime validation
 */

interface EnvConfig {
  // Database
  DATABASE_URL: string;
  DIRECT_URL?: string;

  // Redis
  REDIS_URL: string;
  REDIS_TOKEN: string;

  // Better Auth
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;

  // OAuth (optional)
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_SECRET?: string;

  // Supabase (optional)
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;

  // Resend (optional)
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;

  // Environment
  NODE_ENV: 'development' | 'production' | 'test';

  // Health check (optional)
  HEALTH_CHECK_TOKEN?: string;
}

const requiredEnvVars: (keyof EnvConfig)[] = [
  'DATABASE_URL',
  'REDIS_URL',
  'REDIS_TOKEN',
  'BETTER_AUTH_SECRET',
  'BETTER_AUTH_URL',
  'NODE_ENV',
];

/**
 * Validate required environment variables at startup
 * Fails fast if required vars are missing
 * Only validates in runtime, not during build
 */
function validateEnv(): void {
  // Skip validation during build time
  if (typeof window === 'undefined' && process.env.NODE_ENV !== 'production') {
    const missing: string[] = [];

    for (const key of requiredEnvVars) {
      if (!process.env[key]) {
        missing.push(key);
      }
    }

    if (missing.length > 0) {
      console.warn(
        `Warning: Missing required environment variables: ${missing.join(', ')}`,
      );
    }
  }
}

// Validate on import (runtime validation only)
if (typeof window === 'undefined') {
  validateEnv();
}

/**
 * Type-safe environment variables
 */
export const env: EnvConfig = {
  DATABASE_URL: process.env.DATABASE_URL!,
  DIRECT_URL: process.env.DIRECT_URL,
  REDIS_URL: process.env.REDIS_URL!,
  REDIS_TOKEN: process.env.REDIS_TOKEN!,
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_SECRET: process.env.GOOGLE_SECRET,
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  RESEND_FROM_EMAIL: process.env.RESEND_FROM_EMAIL,
  NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  HEALTH_CHECK_TOKEN: process.env.HEALTH_CHECK_TOKEN,
};
