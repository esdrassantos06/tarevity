import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { createResetPasswordSchema } from './schemas';

// For server-side usage
export async function getResetPasswordSchema(locale: string) {
  const t = await getTranslations({ locale, namespace: 'Validation' });
  return createResetPasswordSchema(t);
}

// Legacy export - kept for backward compatibility but should use getResetPasswordSchema instead
export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters'),
    confirmPassword: z.string(),
    token: z.string().min(1, 'Token is required'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
