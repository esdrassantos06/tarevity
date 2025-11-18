import type { Metadata } from 'next';
import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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

function ResetPasswordFormFallback() {
  return (
    <div className='flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
      <Card className='w-full max-w-md bg-white dark:bg-[#1d1929]' role='main'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-center text-2xl font-bold'>
            <Skeleton className='mx-auto h-7 w-48' />
          </CardTitle>
          <CardDescription className='text-center'>
            <Skeleton className='mx-auto h-4 w-40' />
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-24' />
            <Skeleton className='h-10 w-full' />
          </div>
          <div className='space-y-2'>
            <Skeleton className='h-4 w-32' />
            <Skeleton className='h-10 w-full' />
          </div>
          <Skeleton className='h-10 w-full' />
          <div className='text-center text-sm'>
            <Skeleton className='mx-auto h-4 w-48' />
          </div>
        </CardContent>
      </Card>
    </div>
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
