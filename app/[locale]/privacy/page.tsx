import Footer from '@/components/footer';
import Header from '@/components/header';
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
    namespace: 'PrivacyPage.metadata',
  });

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function Privacy({ params }: Props) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PrivacyPage' });
  const lastUpdated = new Date('2025-11-07');
  const format = await getFormatter();
  return (
    <>
      <Header />
      <main className='flex flex-1 flex-col items-center justify-center gap-10 px-4 py-20 sm:px-6 lg:px-8'>
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
              icon={'fa-solid:shield-alt'}
              className='text-blue-accent size-6'
            />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.commitment.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.commitment.content')}
            </p>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon
              icon={'fa-solid:user-shield'}
              className='text-blue-accent size-6'
            />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.information.title')}
            </h2>
          </div>
          <div>
            <h3 className='mt-6 mb-3 text-xl font-medium text-gray-800 dark:text-gray-200'>
              {t('sections.information.personalData.title')}
            </h3>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.information.personalData.content')}
            </p>
            <ul className='mb-4 flex list-disc flex-col gap-2 pl-6 text-gray-700 dark:text-gray-300'>
              {t
                .raw('sections.information.personalData.items')
                .map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
            </ul>
          </div>
          <div>
            <h3 className='mt-4 mb-3 text-xl font-medium text-gray-800 dark:text-gray-200'>
              {t('sections.information.usageData.title')}
            </h3>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.information.usageData.content')}
            </p>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon icon={'fa-solid:lock'} className='text-blue-accent size-6' />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.howWeUse.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.howWeUse.content')}
            </p>
            <ul className='mb-4 flex list-disc flex-col gap-2 pl-6 text-gray-700 dark:text-gray-300'>
              {t
                .raw('sections.howWeUse.items')
                .map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
            </ul>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon
              icon={'fa-solid:cookie-bite'}
              className='text-blue-accent size-6'
            />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.cookies.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.cookies.content1')}
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.cookies.content2')}
            </p>
            <h3 className='mt-4 mb-3 text-xl font-medium text-gray-800 dark:text-gray-200'>
              {t('sections.cookies.examplesTitle')}
            </h3>
            <ul className='mb-4 flex list-disc flex-col gap-2 pl-6 text-gray-700 dark:text-gray-300'>
              {t
                .raw('sections.cookies.items')
                .map(
                  (
                    item: { type: string; description: string },
                    index: number,
                  ) => (
                    <li key={index}>
                      <strong>{item.type}</strong> {item.description}
                    </li>
                  ),
                )}
            </ul>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon
              icon={'fa-solid:shield-virus'}
              className='text-blue-accent size-6'
            />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.security.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.security.content')}
            </p>
            <h3 className='mt-4 mb-3 text-xl font-medium text-gray-800 dark:text-gray-200'>
              {t('sections.security.measuresTitle')}
            </h3>
            <ul className='mb-4 flex list-disc flex-col gap-2 pl-6 text-gray-700 dark:text-gray-300'>
              {t
                .raw('sections.security.items')
                .map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
            </ul>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon
              icon={'fa-brands:google'}
              className='text-blue-accent size-6'
            />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.thirdParty.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.thirdParty.content1')}
            </p>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.thirdParty.content2')}
            </p>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon
              icon={'fa-solid:user-check'}
              className='text-blue-accent size-6'
            />
            <h2 className='text-2xl font-semibold text-gray-900 dark:text-white'>
              {t('sections.rights.title')}
            </h2>
          </div>
          <div>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.rights.content')}
            </p>
            <ul className='mb-4 flex list-disc flex-col gap-2 pl-6 text-gray-700 dark:text-gray-300'>
              {t
                .raw('sections.rights.items')
                .map((item: string, index: number) => (
                  <li key={index}>{item}</li>
                ))}
            </ul>
            <p className='mb-4 text-gray-700 dark:text-gray-300'>
              {t('sections.rights.contact')}
            </p>
          </div>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg p-6 shadow dark:bg-[#1d1929]'>
          <div className='flex items-center justify-start gap-2'>
            <Icon
              icon={'fa-solid:file-contract'}
              className='text-blue-accent size-6'
            />
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
      <Footer />
    </>
  );
}
