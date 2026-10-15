import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import { Stamp, statusTone } from '@/components/forms/stamp';
import { addDays } from 'date-fns';
import { routing } from '@/i18n/routing';
import { getOpenGraphLocale } from '@/utils/variables';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage.metadata' });

  const baseUrl = 'https://tarevity.me';
  const localeUrl = `${baseUrl}/${locale}`;

  return {
    title: t('title'),
    description: t('description'),
    keywords: t.raw('keywords'),
    alternates: {
      canonical: localeUrl,
      languages: Object.fromEntries(
        routing.locales.map((loc) => [loc, `${baseUrl}/${loc}`]),
      ),
    },
    openGraph: {
      title: t('openGraph.title'),
      description: t('openGraph.description'),
      url: localeUrl,
      siteName: 'Tarevity',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('openGraph.alt'),
        },
      ],
      locale: getOpenGraphLocale(locale),
      alternateLocale: routing.locales
        .filter((loc) => loc !== locale)
        .map((loc) => getOpenGraphLocale(loc)),
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: t('twitter.title'),
      description: t('twitter.description'),
      images: ['/og-image.png'],
    },
  };
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations('HomePage.landing');
  const tForms = await getTranslations('Forms');
  const tJsonLd = await getTranslations('HomePage.jsonLd');

  const tPriority = await getTranslations('DashboardPage.priority');
  const today = new Date();
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(locale, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);

  const circuit = [
    { status: 'ACTIVE', via: 'bg-via-white', rotate: -5, previous: null },
    { status: 'REVIEW', via: 'bg-via-canary', rotate: -8, previous: 'ACTIVE' },
    { status: 'COMPLETED', via: 'bg-via-pink', rotate: -4, previous: 'REVIEW' },
  ] as const;

  const details = ['deadlines', 'calendar', 'languages', 'account'] as const;

  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Tarevity',
    description: tJsonLd('description'),
    url: 'https://tarevity.me',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: tJsonLd.raw('features'),
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tarevity',
    url: 'https://tarevity.me',
    logo: 'https://tarevity.me/og-image.png',
    description: tJsonLd('organizationDescription'),
    sameAs: [
      'https://github.com/esdrassantos06',
      'https://www.linkedin.com/in/esdrassantos06/',
    ],
  };

  const websiteJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Tarevity',
    url: 'https://tarevity.me',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://tarevity.me/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      <main id='main-content' className='flex-1'>
        <section
          aria-labelledby='hero-heading'
          className='mx-auto grid w-full max-w-360 gap-6 px-4 pt-8 pb-16 sm:px-6 lg:gap-8 lg:px-10 lg:pt-12 xl:grid-cols-[minmax(0,1fr)_17rem]'
        >
          <div className='sheet grid min-w-0 lg:grid-cols-[minmax(0,1fr)_15rem]'>
            <div className='border-print order-1 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b-2 px-5 py-3 sm:px-8 lg:col-span-2'>
              <p className='field-label text-[0.75rem]'>
                Tarevity · {t('formTitle')}
              </p>
              <p className='flex items-baseline gap-5'>
                <span className='field-label'>{t('dateLabel')}</span>
                <span className='typed text-sm'>{formatDate(today)}</span>
                <span className='typed text-print text-sm font-bold'>
                  {t('number')}
                </span>
              </p>
            </div>

            <div className='ruled order-2 px-5 pt-5 pb-8 sm:px-8 lg:col-start-1 lg:pt-8 lg:pb-12'>
              <span className='field-label'>{tForms('subject')}</span>
              <h1
                id='hero-heading'
                className='typed mt-3 max-w-[16ch] text-[clamp(2.6rem,6vw,5.5rem)] leading-[0.98] font-bold tracking-[-0.03em]'
              >
                {t('headline')}
              </h1>
            </div>

            <div className='bg-via-canary border-rule relative order-3 flex flex-col gap-6 border-t border-dashed px-5 pt-7 pb-6 sm:px-8 lg:col-start-2 lg:row-span-3 lg:row-start-2 lg:gap-8 lg:border-t-0 lg:border-l lg:px-6 lg:pt-6 lg:pl-8'>
              <span
                aria-hidden='true'
                className='perforation-x absolute inset-x-0 -top-[5px] lg:hidden'
              />
              <span
                aria-hidden='true'
                className='perforation-y absolute inset-y-0 -left-[5px] hidden lg:block'
              />
              <div>
                <p className='field-label'>{t('stubLabel')}</p>
                <p className='typed text-print mt-1 text-sm font-bold'>
                  {t('number')}
                </p>
                <dl className='mt-6 hidden flex-col gap-5 lg:flex'>
                  {[
                    { label: t('receivedBy'), value: session?.user.name },
                    { label: t('dateLabel'), value: formatDate(today) },
                    { label: t('signature'), value: null },
                  ].map((line) => (
                    <div
                      key={line.label}
                      className='border-print/30 border-b pb-1'
                    >
                      <dt className='field-label'>{line.label}</dt>
                      <dd className='typed min-h-6 truncate pt-1 text-sm'>
                        {line.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className='flex flex-col gap-3'>
                <Link
                  href={session ? '/dashboard' : '/auth/register'}
                  className='group bg-print text-primary-foreground outline-print flex items-end justify-between gap-3 rounded-[3px] px-4 py-3 outline-1 outline-offset-2 transition-transform active:translate-y-px'
                >
                  <span className='flex flex-col'>
                    <span className='font-display text-[0.7rem] font-semibold tracking-[0.12em] uppercase opacity-80'>
                      {t('deliver')}
                    </span>
                    <span className='font-display text-lg leading-tight font-bold'>
                      {session ? t('ctaSession') : t('cta')}
                    </span>
                  </span>
                  <Icon
                    icon='tabler:arrow-right'
                    className='mb-0.5 size-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1'
                    aria-hidden='true'
                  />
                </Link>
                {!session && (
                  <Link
                    href='/auth/login'
                    className='text-print decoration-print/40 hover:decoration-print text-sm font-semibold underline underline-offset-4'
                  >
                    {t('login')}
                  </Link>
                )}
                <p className='text-muted-foreground text-sm'>{t('free')}</p>
              </div>
            </div>

            <div className='ruled order-4 grid sm:grid-cols-[2fr_1fr] lg:col-start-1'>
              <div className='border-rule px-5 py-5 sm:border-r sm:px-8'>
                <span className='field-label'>{tForms('notes')}</span>
                <p className='text-ink mt-2 max-w-[62ch] text-base leading-relaxed sm:text-lg'>
                  {t('notes')}
                </p>
              </div>
              <div className='relative grid min-h-36 place-items-center px-5 py-6'>
                <span className='field-label absolute top-5 left-5'>
                  {t('statusLabel')}
                </span>
                <Stamp
                  tone='violet'
                  rotate={-8}
                  animate
                  className='text-2xl [animation-delay:400ms] sm:text-3xl'
                >
                  {tForms('status.REVIEW')}
                </Stamp>
              </div>
            </div>

            <dl className='order-5 grid grid-cols-2 sm:grid-cols-3 lg:col-start-1'>
              <div className='border-rule border-r px-5 py-4 sm:px-8'>
                <dt className='field-label'>{tForms('due')}</dt>
                <dd className='typed mt-1'>
                  {formatDate(addDays(today, 3))}
                  <span className='text-muted-foreground block font-sans text-xs'>
                    {t('dueValue')}
                  </span>
                </dd>
              </div>
              <div className='border-rule px-5 py-4 sm:border-r sm:px-8'>
                <dt className='field-label'>{tForms('created')}</dt>
                <dd className='typed mt-1'>{formatDate(today)}</dd>
              </div>
              <div className='border-rule col-span-2 flex items-center justify-between gap-3 border-t px-5 py-4 sm:col-span-1 sm:border-t-0 sm:px-8'>
                <div>
                  <dt className='field-label'>{tPriority('label')}</dt>
                  <dd className='typed mt-1'>{t('priorityValue')}</dd>
                </div>
                <Stamp tone='red' rotate={4} className='text-sm'>
                  {tForms('urgent')}
                </Stamp>
              </div>
            </dl>
          </div>

          <ol
            aria-label={t('circuitTitle')}
            className='grid gap-4 sm:grid-cols-3 xl:grid-cols-1 xl:content-start'
          >
            {circuit.map((step, index) => (
              <li
                key={step.status}
                className={`${step.via} border-rule relative flex min-h-44 flex-col border p-4 shadow-[0_1px_2px_rgb(27_33_48/0.08)]`}
                style={{ transform: `rotate(${index === 1 ? 0.6 : -0.4}deg)` }}
              >
                <div className='border-print/40 flex items-baseline justify-between border-b pb-2'>
                  <span className='field-label'>
                    {tForms(`trays.${step.status}`)}
                  </span>
                  <span className='typed text-muted-foreground text-xs'>
                    {tForms('copy')} {index + 1}/3
                  </span>
                </div>
                <p className='typed mt-3 leading-snug font-bold'>
                  {t('sampleTask')}
                </p>
                <div className='relative mt-auto h-14 pt-3'>
                  {step.previous && (
                    <Stamp
                      tone={statusTone[step.previous]}
                      rotate={3}
                      className='absolute right-10 bottom-3 text-sm opacity-25'
                    >
                      {tForms(`status.${step.previous}`)}
                    </Stamp>
                  )}
                  <Stamp
                    tone={statusTone[step.status]}
                    rotate={step.rotate}
                    className='absolute right-1 bottom-1 text-lg'
                  >
                    {tForms(`status.${step.status}`)}
                  </Stamp>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby='circuit-heading'
          className='border-rule bg-card border-y'
        >
          <div className='mx-auto grid w-full max-w-360 gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,26rem)_1fr] lg:gap-16 lg:px-10 lg:py-20'>
            <div>
              <h2
                id='circuit-heading'
                className='font-display text-[clamp(2rem,3.4vw,3rem)] leading-[1.02] font-extrabold tracking-[-0.02em]'
                style={{ fontStretch: '80%' }}
              >
                {t('circuitTitle')}
              </h2>
              <p className='text-muted-foreground mt-4 max-w-[46ch] text-base leading-relaxed'>
                {t('circuitBody')}
              </p>
            </div>
            <dl className='border-print grid content-start border-t-2 md:grid-cols-3'>
              {circuit.map((step) => (
                <div
                  key={step.status}
                  className='border-rule border-b py-5 md:border-r md:border-b-0 md:px-6 md:first:pl-0 md:last:border-r-0'
                >
                  <dt
                    className='font-display text-xl font-bold'
                    style={{ fontStretch: '85%' }}
                  >
                    {tForms(`trays.${step.status}`)}
                  </dt>
                  <dd className='text-muted-foreground mt-2 leading-relaxed'>
                    {t(`steps.${step.status}`)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section
          aria-labelledby='details-heading'
          className='mx-auto w-full max-w-360 px-4 py-16 sm:px-6 lg:px-10 lg:py-24'
        >
          <h2
            id='details-heading'
            className='font-display text-[clamp(1.75rem,2.8vw,2.5rem)] leading-none font-extrabold tracking-[-0.02em]'
            style={{ fontStretch: '80%' }}
          >
            {t('detailsTitle')}
          </h2>
          <dl className='border-print mt-6 grid border-t-2 md:grid-cols-2'>
            {details.map((key, index) => (
              <div
                key={key}
                className={`border-rule grid gap-2 border-b py-6 md:py-8 ${
                  index % 2 === 0 ? 'md:border-r md:pr-10' : 'md:pl-10'
                }`}
              >
                <dt
                  className='font-display text-xl font-bold'
                  style={{ fontStretch: '85%' }}
                >
                  {t(`details.${key}.t`)}
                </dt>
                <dd className='text-muted-foreground max-w-[52ch] leading-relaxed'>
                  {t(`details.${key}.d`)}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <section
          aria-labelledby='close-heading'
          className='mx-auto w-full max-w-360 px-4 pb-20 sm:px-6 lg:px-10'
        >
          <div className='bg-print text-primary-foreground relative flex flex-col items-start justify-between gap-8 overflow-hidden px-6 py-10 sm:px-10 md:flex-row md:items-end lg:py-14'>
            <div>
              <h2
                id='close-heading'
                className='typed text-primary-foreground text-[clamp(2rem,4vw,3.5rem)] leading-none font-bold tracking-[-0.03em]'
              >
                {session ? t('closeTitleSession') : t('closeTitle')}
              </h2>
              {!session && (
                <p className='mt-3 text-base opacity-85'>{t('closeBody')}</p>
              )}
            </div>
            <Button
              asChild
              size='lg'
              variant='outline'
              className='border-primary-foreground text-print hover:text-print dark:bg-background dark:text-print h-14 shrink-0 bg-white px-8 text-base hover:bg-white/90'
            >
              <Link href={session ? '/dashboard' : '/auth/register'}>
                {session ? t('ctaSession') : t('cta')}
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </>
  );
}
