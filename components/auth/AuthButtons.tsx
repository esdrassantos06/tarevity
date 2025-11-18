'use client';

import { Button } from '../ui/button';
import { authClient } from '@/lib/auth-client';
import { Loader } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';

interface SignInOauthButtonProps {
  provider: 'google' | 'github';
  signUp?: boolean;
}

export default function AuthButtons({
  provider,
  signUp,
}: SignInOauthButtonProps) {
  const t = useTranslations('AuthButtons');
  const [isPending, setIsPending] = useState(false);

  async function handleClick() {
    setIsPending(true);
    await authClient.signIn.social({
      provider,
      callbackURL: '/',
      errorCallbackURL: '/auth/login/error',
      fetchOptions: {
        onRequest: () => {
          setIsPending(true);
        },
        onResponse: () => {
          setIsPending(false);
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    });

    setIsPending(false);
  }

  const providerName = provider === 'google' ? t('google') : t('github');
  const signText = signUp ? t('signUpWith') : t('signInWith');
  const ariaLabel = signUp
    ? t('ariaLabelSignUp', { provider: providerName })
    : t('ariaLabelSignIn', { provider: providerName });
  const title = signUp
    ? t('titleSignUp', { provider: providerName })
    : t('titleSignIn', { provider: providerName });

  return (
    <div className='space-y-3'>
      <Button
        variant={'outline'}
        className='w-full'
        disabled={isPending}
        onClick={handleClick}
        aria-label={ariaLabel}
        title={title}
        type='button'
      >
        {isPending ? (
          <>
            <Loader size={12} className='animate-spin' aria-hidden='true' />
            <span aria-live='polite'>{t('loading')}</span>
          </>
        ) : (
          <>
            {provider === 'github' ? (
              <>
                <Icon icon={'mdi:github'} className='w-3' aria-hidden='true' />
              </>
            ) : (
              <>
                <Icon
                  icon={'devicon:google'}
                  className='w-3'
                  aria-hidden='true'
                />
              </>
            )}
            {signText} {providerName}
          </>
        )}
      </Button>
    </div>
  );
}
