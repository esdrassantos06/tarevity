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

  const baseUrl = 'https://tarevity.me';
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
        className='flex flex-1 flex-col items-center px-4 py-14 sm:px-6 sm:py-20 lg:px-8'
      >
        <header className='border-print flex w-full max-w-[68ch] flex-col gap-2 border-b-2 pb-5 text-left'>
          <h1
            className='font-display text-4xl leading-tight font-bold md:text-5xl'
            style={{ fontStretch: '80%' }}
          >
            {t('title')}
          </h1>
          <p className='typed text-muted-foreground text-sm'>
            {t('lastUpdated')}{' '}
            {format.dateTime(lastUpdated, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </header>

        <section className='ruled flex w-full max-w-[68ch] flex-col gap-3 py-8'>
          <h2 className='font-display text-2xl leading-tight font-bold font-stretch-85%'>
            {t('sections.agreement.title')}
          </h2>
          <div>
            <p className='mb-4 leading-relaxed'>
              {t('sections.agreement.content1')}
            </p>
            <p className='mb-4 leading-relaxed'>
              {t('sections.agreement.content2')}
            </p>
          </div>
        </section>

        <section className='ruled flex w-full max-w-[68ch] flex-col gap-3 py-8'>
          <h2 className='font-display text-2xl leading-tight font-bold font-stretch-85%'>
            {t('sections.accounts.title')}
          </h2>
          <div>
            <p className='mb-4 leading-relaxed'>
              {t('sections.accounts.content1')}
            </p>
            <p className='mb-4 leading-relaxed'>
              {t('sections.accounts.content2')}
            </p>
            <p className='mb-4 leading-relaxed'>
              {t('sections.accounts.content3')}
            </p>
          </div>
        </section>

        <section className='ruled flex w-full max-w-[68ch] flex-col gap-3 py-8'>
          <h2 className='font-display text-2xl leading-tight font-bold font-stretch-85%'>
            {t('sections.intellectual.title')}
          </h2>
          <div>
            <p className='mb-4 leading-relaxed'>
              {t('sections.intellectual.content1')}
            </p>
            <p className='mb-4 leading-relaxed'>
              {t('sections.intellectual.content2')}
            </p>
          </div>
        </section>

        <section className='ruled flex w-full max-w-[68ch] flex-col gap-3 py-8'>
          <h2 className='font-display text-2xl leading-tight font-bold font-stretch-85%'>
            {t('sections.prohibited.title')}
          </h2>
          <div>
            <p className='mb-4 leading-relaxed'>
              {t('sections.prohibited.content')}
            </p>
            <ul className='marker:text-print mb-4 flex list-disc flex-col gap-2 pl-6 leading-relaxed'>
              {t
                .raw('sections.prohibited.items')
                .map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
            </ul>
          </div>
        </section>

        <section className='ruled flex w-full max-w-[68ch] flex-col gap-3 py-8'>
          <h2 className='font-display text-2xl leading-tight font-bold font-stretch-85%'>
            {t('sections.userContent.title')}
          </h2>
          <div>
            <p className='mb-4 leading-relaxed'>
              {t('sections.userContent.content1')}
            </p>
            <p className='mb-4 leading-relaxed'>
              {t('sections.userContent.content2')}
            </p>
            <ul className='marker:text-print mb-4 flex list-disc flex-col gap-2 pl-6 leading-relaxed'>
              {t
                .raw('sections.userContent.items')
                .map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
            </ul>
          </div>
        </section>

        <section className='ruled flex w-full max-w-[68ch] flex-col gap-3 py-8'>
          <h2 className='font-display text-2xl leading-tight font-bold font-stretch-85%'>
            {t('sections.links.title')}
          </h2>
          <div>
            <p className='mb-4 leading-relaxed'>
              {t('sections.links.content1')}
            </p>
            <p className='mb-4 leading-relaxed'>
              {t('sections.links.content2')}
            </p>
            <p className='mb-4 leading-relaxed'>
              {t('sections.links.content3')}
            </p>
          </div>
        </section>

        <section className='ruled flex w-full max-w-[68ch] flex-col gap-3 py-8'>
          <h2 className='font-display text-2xl leading-tight font-bold font-stretch-85%'>
            {t('sections.termination.title')}
          </h2>
          <div>
            <p className='mb-4 leading-relaxed'>
              {t('sections.termination.content1')}
            </p>
            <p className='mb-4 leading-relaxed'>
              {t('sections.termination.content2')}
            </p>
            <p className='mb-4 leading-relaxed'>
              {t('sections.termination.content3')}
            </p>
          </div>
        </section>

        <section className='ruled flex w-full max-w-[68ch] flex-col gap-3 py-8'>
          <h2 className='font-display text-2xl leading-tight font-bold font-stretch-85%'>
            {t('sections.disclaimer.title')}
          </h2>
          <div>
            <p className='mb-4 leading-relaxed'>
              {t('sections.disclaimer.content1')}
            </p>
            <p className='mb-4 leading-relaxed'>
              {t('sections.disclaimer.content2')}
            </p>
          </div>
        </section>

        <section className='ruled flex w-full max-w-[68ch] flex-col gap-3 py-8'>
          <h2 className='font-display text-2xl leading-tight font-bold font-stretch-85%'>
            {t('sections.liability.title')}
          </h2>
          <div>
            <p className='mb-4 leading-relaxed'>
              {t('sections.liability.content')}
            </p>
          </div>
        </section>

        <section className='ruled flex w-full max-w-[68ch] flex-col gap-3 py-8'>
          <h2 className='font-display text-2xl leading-tight font-bold font-stretch-85%'>
            {t('sections.changes.title')}
          </h2>
          <div>
            <p className='mb-4 leading-relaxed'>
              {t('sections.changes.content1')}
            </p>
            <p className='mb-4 leading-relaxed'>
              {t('sections.changes.content2')}
            </p>
          </div>
        </section>

        <section className='ruled flex w-full max-w-[68ch] flex-col gap-3 py-8'>
          <h2 className='font-display text-2xl leading-tight font-bold font-stretch-85%'>
            {t('sections.governing.title')}
          </h2>
          <div>
            <p className='mb-4 leading-relaxed'>
              {t('sections.governing.content1')}
            </p>
            <p className='mb-4 leading-relaxed'>
              {t('sections.governing.content2')}
            </p>
          </div>
        </section>

        <section className='ruled flex w-full max-w-[68ch] flex-col gap-3 py-8'>
          <h2 className='font-display text-2xl leading-tight font-bold font-stretch-85%'>
            {t('sections.contact.title')}
          </h2>
          <div>
            <p className='mb-4 leading-relaxed'>
              {t('sections.contact.content')}
            </p>
            <ul className='marker:text-print mb-4 flex list-disc flex-col gap-2 pl-6 leading-relaxed'>
              <li>
                {t('sections.contact.email')}{' '}
                <a
                  href='mailto:esdrasirion1@gmail.com'
                  className='typed text-print underline underline-offset-2 hover:no-underline'
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
