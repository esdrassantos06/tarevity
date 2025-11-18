'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { APIError } from 'better-auth/api';
import { forgotPasswordSchema } from '@/validation/ForgotPasswordSchema';
import { getTranslations } from 'next-intl/server';

export async function RequestPasswordResetAction(formData: FormData) {
  const t = await getTranslations('ServerActions');
  const rawData = {
    email: formData.get('email'),
  };

  const parsed = forgotPasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const errMsg = firstIssue
      ? `${firstIssue.path.join('.')}: ${firstIssue.message}`
      : t('unknownError');
    return { error: errMsg };
  }

  const { email } = parsed.data;

  try {
    const baseUrl = process.env.BETTER_AUTH_URL || 'http://localhost:3000';

    await auth.api.forgetPassword({
      headers: await headers(),
      body: {
        email,
        redirectTo: `${baseUrl}/auth/reset-password`,
      },
    });

    return { error: null };
  } catch (err) {
    if (err instanceof APIError) {
      return {
        error: err.message || t('requestPasswordReset.failedToSendEmail'),
      };
    }
    console.error('RequestPasswordReset error:', err);
    return { error: t('internalServerError') };
  }
}
