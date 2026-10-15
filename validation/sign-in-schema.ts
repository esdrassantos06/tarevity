import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { createSignInSchema } from './schemas';

// For server-side usage
export async function getSignInSchema(locale: string) {
  const t = await getTranslations({ locale, namespace: 'Validation' });
  return createSignInSchema(t);
}

// Legacy export - kept for backward compatibility but should use getSignInSchema instead
export const signInSchema = z.object({
  email: z.email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export type SignInInput = z.infer<typeof signInSchema>;
