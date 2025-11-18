'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { APIError } from 'better-auth/api';
import { resetPasswordSchema } from '@/validation/ResetPasswordSchema';
import { getTranslations } from 'next-intl/server';

export async function ResetPasswordAction(formData: FormData) {
  const t = await getTranslations('ServerActions');
  const rawData = {
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
    token: formData.get('token'),
  };

  const parsed = resetPasswordSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const errMsg = firstIssue
      ? `${firstIssue.path.join('.')}: ${firstIssue.message}`
      : t('unknownError');
    return { error: errMsg };
  }

  const { newPassword, token } = parsed.data;

  try {
    await auth.api.resetPassword({
      headers: await headers(),
      body: {
        newPassword,
        token,
      },
    });

    return { error: null };
  } catch (err) {
    if (err instanceof APIError) {
      if (
        err.message.includes('INVALID_TOKEN') ||
        err.message.includes('expired')
      ) {
        return {
          error: t('resetPassword.tokenInvalidOrExpired'),
        };
      }
      return { error: err.message || t('resetPassword.failedToReset') };
    }
    console.error('ResetPassword error:', err);
    return { error: t('internalServerError') };
  }
}
