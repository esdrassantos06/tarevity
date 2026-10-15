import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { AuthSheet } from '@/components/auth/auth-sheet';
import { Skeleton } from '@/components/ui/skeleton';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'ResetPasswordPage.metadata',
  });

  return {
    title: t('title'),
    description: t('description'),
    robots: {
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    },
  };
}

async function ResetPasswordFormFallback() {
  const t = await getTranslations('ResetPasswordPage.form');
  const tSheet = await getTranslations('AuthSheet');

  return (
    <AuthSheet
      title={t('title')}
      titleId='reset-password-title'
      description={t('description')}
      descriptionId='reset-password-description'
      formName={tSheet('names.reset')}
      number='04'
      backHref='/auth/login'
      backKey='backToLogin'
    >
      <div className='space-y-5' aria-busy='true'>
        {[0, 1].map((i) => (
          <div key={i} className='space-y-2'>
            <Skeleton className='h-3 w-28' />
            <Skeleton className='h-10 w-full' />
          </div>
        ))}
        <Skeleton className='h-11 w-full' />
      </div>
    </AuthSheet>
  );
}

export default async function ResetPasswordPage({ params }: Props) {
  await params;
  return (
    <Suspense fallback={<ResetPasswordFormFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
}
