import Footer from '@/components/footer';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';

export default async function NotFound() {
  const t = await getTranslations('NotFoundPage');

  return (
    <>
      <Header />
      <main className='flex flex-1 flex-col items-center justify-center gap-6 px-4 sm:px-6 lg:px-8'>
        <div className='flex flex-col items-center gap-2'>
          <h1 className='text-8xl font-bold text-yellow-500'>{t('title')}</h1>
          <h2 className='text-6xl font-bold'>{t('heading')}</h2>
          <p className='text-sm text-gray-500 dark:text-gray-400'>
            {t('description')}
          </p>
        </div>
        <Button
          asChild
          className='bg-blue-accent hover:bg-blue-accent/80 flex items-center justify-center text-white'
        >
          <Link href={'/'} className='flex items-center gap-2'>
            <Icon icon={'mdi:home'} aria-hidden='true' />
            {t('goHome')}
          </Link>
        </Button>
      </main>
      <Footer />
    </>
  );
}
