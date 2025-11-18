'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { APIError } from 'better-auth/api';
import { signInSchema } from '@/validation/SignInSchema';
import { getTranslations } from 'next-intl/server';

export async function SignInEmailActions(formData: FormData) {
  const t = await getTranslations('ServerActions');
  const rawData = {
    email: formData.get('email'),
    password: formData.get('password'),
    rememberMe: formData.get('rememberMe') === 'true',
  };

  const parsed = signInSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const errMsg = firstIssue
      ? `${firstIssue.path.join('.')}: ${firstIssue.message}`
      : t('unknownError');
    return { error: errMsg };
  }

  const { email, password, rememberMe } = parsed.data;

  try {
    await auth.api.signInEmail({
      headers: await headers(),
      body: {
        email,
        password,
        rememberMe,
      },
    });

    return { error: null };
  } catch (err) {
    if (err instanceof APIError) {
      return { error: err.message };
    }
  }

  return { error: t('internalServerError') };
}
