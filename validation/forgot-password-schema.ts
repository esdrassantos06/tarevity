import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { createForgotPasswordSchema } from './schemas';

// For server-side usage
export async function getForgotPasswordSchema(locale: string) {
  const t = await getTranslations({ locale, namespace: 'Validation' });
  return createForgotPasswordSchema(t);
}

// Legacy export - kept for backward compatibility but should use getForgotPasswordSchema instead
export const forgotPasswordSchema = z.object({
  email: z.email('Invalid email format'),
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
