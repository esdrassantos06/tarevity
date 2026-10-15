import { Button } from '@/components/ui/button';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import { getTranslations } from 'next-intl/server';
import { Stamp } from '@/components/forms/stamp';

export default async function NotFound() {
  const t = await getTranslations('NotFoundPage');

  return (
    <main className='flex flex-1 flex-col items-center justify-center px-4 py-16 sm:px-6 lg:px-8'>
      <section className='sheet relative w-full max-w-lg overflow-hidden rounded-[3px]'>
        <div
          aria-hidden='true'
          className='perforation-x absolute inset-x-0 top-0'
        />
        <div className='flex flex-col gap-6 px-6 pt-10 pb-8 sm:px-10'>
          <div className='ruled flex items-end justify-between gap-4 pb-4'>
            <p className='typed text-print text-8xl leading-none tracking-tight sm:text-9xl'>
              {t('title')}
            </p>
            <Stamp tone='red' rotate={-8} className='mb-2 text-lg sm:text-xl'>
              {t('stamp')}
            </Stamp>
          </div>
          <div className='flex flex-col gap-2 text-left'>
            <h1
              className='font-display text-3xl leading-tight font-bold sm:text-4xl'
              style={{ fontStretch: '80%' }}
            >
              {t('heading')}
            </h1>
            <p className='text-muted-foreground text-sm leading-relaxed'>
              {t('description')}
            </p>
          </div>
          <Button asChild className='self-start'>
            <Link href={'/'}>
              <Icon icon='tabler:arrow-back-up' aria-hidden='true' />
              {t('goHome')}
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
