import { Icon } from '@iconify/react';
import { getFormatter, getTranslations } from 'next-intl/server';
import type { Metadata } from 'next';

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: 'TermsPage.metadata',
  });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function Terms({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'TermsPage' });
  const lastUpdated = new Date('2025-11-07');
  const format = await getFormatter();

  const baseUrl = 'https://tarevity.pt';
  const pageUrl = `${baseUrl}/${locale}/terms`;

  const webPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: t('title'),
    description: t('metadata.description'),
    url: pageUrl,
    inLanguage: locale,
    datePublished: '2025-11-07',
    dateModified: lastUpdated.toISOString().split('T')[0],
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: `${baseUrl}/${locale}`,
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: t('title'),
          item: pageUrl,
        },
      ],
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tarevity',
      url: baseUrl,
    },
  };

  // Article structured data
  const articleJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: t('title'),
    description: t('metadata.description'),
    url: pageUrl,
    inLanguage: locale,
    datePublished: '2025-11-07',
    dateModified: lastUpdated.toISOString().split('T')[0],
    author: {
      '@type': 'Organization',
      name: 'Tarevity',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Tarevity',
      url: baseUrl,
    },
  };

  return (
    <>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageJsonLd) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <main
        id='main-content'
        role='main'
        className='flex flex-1 flex-col items-center justify-center gap-10 px-4 py-20 sm:px-6 lg:px-8'
      >
        <section className='flex w-full max-w-7xl flex-col items-center justify-center rounded-lg p-6 text-center'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 md:text-4xl dark:text-white'>
            {t('title')}
          </h1>
          <h3 className='text-gray-600 dark:text-gray-400'>
            {t('lastUpdated')}{' '}
            {format.dateTime(lastUpdated, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </h3>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon
              icon={'fa-solid:handshake'}
              className='text-blue-accent size-6'
            />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.agreement.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.agreement.content1')}
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.agreement.content2')}
            </p>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon
              icon={'fa-solid:user-circle'}
              className='text-blue-accent size-6'
            />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.accounts.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.accounts.content1')}
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.accounts.content2')}
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.accounts.content3')}
            </p>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon
              icon={'fa-solid:copyright'}
              className='text-blue-accent size-6'
            />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.intellectual.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.intellectual.content1')}
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.intellectual.content2')}
            </p>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon icon={'fa-solid:ban'} className='text-blue-accent size-6' />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.prohibited.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.prohibited.content')}
            </p>
            <ul className='mb-4 flex list-disc flex-col gap-2 pl-6 text-gray-700 dark:text-gray-300'>
              {t
                .raw('sections.prohibited.items')
                .map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
            </ul>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon
              icon={'fa-solid:file-alt'}
              className='text-blue-accent size-6'
            />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.userContent.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.userContent.content1')}
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.userContent.content2')}
            </p>
            <ul className='mb-4 flex list-disc flex-col gap-2 pl-6 text-gray-700 dark:text-gray-300'>
              {t
                .raw('sections.userContent.items')
                .map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
            </ul>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon
              icon={'fa-solid:external-link-alt'}
              className='text-blue-accent size-6'
            />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.links.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.links.content1')}
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.links.content2')}
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.links.content3')}
            </p>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon
              icon={'fa-solid:times-circle'}
              className='text-blue-accent size-6'
            />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.termination.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.termination.content1')}
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.termination.content2')}
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.termination.content3')}
            </p>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon
              icon={'fa-solid:exclamation-triangle'}
              className='text-blue-accent size-6'
            />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.disclaimer.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.disclaimer.content1')}
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.disclaimer.content2')}
            </p>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon
              icon={'fa-solid:balance-scale'}
              className='text-blue-accent size-6'
            />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.liability.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.liability.content')}
            </p>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon icon={'fa-solid:edit'} className='text-blue-accent size-6' />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.changes.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.changes.content1')}
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.changes.content2')}
            </p>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon icon={'fa-solid:gavel'} className='text-blue-accent size-6' />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.governing.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.governing.content1')}
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.governing.content2')}
            </p>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon
              icon={'fa-solid:envelope'}
              className='text-blue-accent size-6'
            />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.contact.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.contact.content')}
            </p>
            <ul className='mb-4 flex list-disc flex-col gap-2 pl-6 text-gray-700 dark:text-gray-300'>
              <li>
                {t('sections.contact.email')}{' '}
                <a
                  href='mailto:esdrasirion1@gmail.com'
                  className='text-blue-accent hover:underline'
                >
                  esdrasirion1@gmail.com
                </a>
              </li>
            </ul>
          </div>
        </section>
      </main>
    </>
  );
}
