import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { auth } from '@/lib/auth';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { Icon } from '@iconify/react';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage.metadata' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: t.raw('keywords'),
    alternates: {
      canonical: 'https://tarevity.pt',
    },
    openGraph: {
      title: t('openGraph.title'),
      description: t('openGraph.description'),
      url: 'https://tarevity.pt',
      siteName: 'Tarevity',
      images: [
        {
          url: '/og-image.png',
          width: 1200,
          height: 630,
          alt: t('openGraph.alt'),
        },
      ],
      locale: 'en_US',
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
  await params;
  const t = await getTranslations('HomePage');
  const tJsonLd = await getTranslations('HomePage.jsonLd');

  const headersList = await headers();

  const session = await auth.api.getSession({
    headers: headersList,
  });

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Tarevity',
    description: tJsonLd('description'),
    url: 'https://tarevity.pt',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    featureList: tJsonLd.raw('features'),
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '5',
      ratingCount: '1',
    },
  };

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Tarevity',
    url: 'https://tarevity.pt',
    logo: 'https://tarevity.pt/og-image.png',
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
    url: 'https://tarevity.pt',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://tarevity.pt/search?q={search_term_string}',
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
      <Header />
      <main className='flex flex-1 flex-col items-center justify-center px-4 py-20 sm:px-6 lg:px-8'>
        {/* Hero Section */}
        <section
          className='mx-auto w-full max-w-7xl'
          aria-labelledby='hero-heading'
        >
          <div className='flex flex-col items-center justify-center gap-6 text-center sm:gap-8'>
            <h1
              id='hero-heading'
              className='px-4 text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl dark:text-white'
            >
              {t('hero.title')}
            </h1>
            <p className='mx-auto mt-3 max-w-md px-4 text-base text-gray-600 sm:text-lg md:mt-5 md:max-w-2xl md:text-xl lg:max-w-3xl dark:text-gray-300'>
              {t('hero.description')}
            </p>
            <Button asChild size='lg' className='group mt-2'>
              {session ? (
                <Link
                  href='/dashboard'
                  className='flex items-center gap-2 dark:bg-[#1d1929] dark:text-white'
                >
                  {t('hero.dashboardButton')}
                  <Icon
                    icon='mdi:arrow-right'
                    className='size-5 transition-transform duration-300 group-hover:translate-x-1'
                  />
                </Link>
              ) : (
                <Link
                  href='/auth/register'
                  className='flex items-center gap-2 dark:bg-[#1d1929] dark:text-white'
                >
                  {t('hero.getStartedButton')}
                  <Icon
                    icon='mdi:arrow-right'
                    className='size-5 transition-transform duration-300 group-hover:translate-x-1'
                  />
                </Link>
              )}
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section
          className='mx-auto w-full max-w-7xl py-12 sm:py-16'
          aria-labelledby='features-heading'
        >
          <div className='rounded-2xl p-6 shadow-lg sm:p-8 md:p-10 lg:p-12 dark:bg-[#1d1929]'>
            <header className='mb-8 flex flex-col items-center justify-center sm:mb-10 md:mb-12'>
              <span className='mb-2 text-sm font-semibold tracking-wider uppercase'>
                {t('features.label')}
              </span>
              <h2
                id='features-heading'
                className='px-4 text-center text-2xl font-extrabold sm:text-3xl md:text-4xl dark:text-white'
              >
                {t('features.title')}
              </h2>
            </header>

            <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8 lg:gap-10'>
              {[
                {
                  key: 'simpleTaskManagement',
                  icon: 'mdi:playlist-check',
                },
                {
                  key: 'neverMissDeadline',
                  icon: 'mdi:bell-ring',
                },
                {
                  key: 'secureAndPrivate',
                  icon: 'mdi:lock',
                },
                {
                  key: 'accessFromAnywhere',
                  icon: 'mdi:cellphone-link',
                },
              ].map((item) => (
                <article
                  key={item.key}
                  className='group flex items-start gap-4 rounded-xl p-4 transition-colors duration-300 hover:bg-gray-50 sm:p-5 dark:hover:bg-[#252131]'
                >
                  <div className='bg-blue-accent flex flex-shrink-0 items-center justify-center rounded-lg p-3 shadow-md transition-transform duration-300 group-hover:scale-110'>
                    <Icon
                      icon={item.icon}
                      className='size-6 text-white sm:size-7'
                    />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h3 className='mb-2 text-lg leading-6 font-semibold sm:text-xl dark:text-white'>
                      {t(`features.items.${item.key}.title`)}
                    </h3>
                    <p className='text-sm leading-relaxed text-gray-600 sm:text-base dark:text-gray-300'>
                      {t(`features.items.${item.key}.description`)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section
          className='bg-blue-accent mx-auto mb-20 w-full max-w-7xl rounded-lg py-12 text-center shadow sm:py-20'
          aria-labelledby='cta-heading'
        >
          <div className='flex flex-col items-center gap-6 px-4'>
            <div className='flex flex-col items-center justify-center gap-2'>
              <h2
                id='cta-heading'
                className='text-2xl font-bold text-white sm:text-3xl md:text-4xl'
              >
                {t('cta.title')} <br /> {t('cta.titleLine2')}
              </h2>
              <p className='max-w-2xl text-base text-white'>
                {t('cta.description')}
              </p>
            </div>

            <Button asChild className='group'>
              <Link href='/auth/register' className='flex items-center gap-2'>
                {t('cta.button')}
                <Icon
                  icon='mdi:arrow-right'
                  className='size-5 transition-transform duration-300 group-hover:translate-x-1'
                />
              </Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
