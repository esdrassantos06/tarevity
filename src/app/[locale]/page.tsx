import { FaCheckCircle, FaBell, FaLock, FaMobileAlt } from 'react-icons/fa'
import { IoMdArrowForward } from 'react-icons/io'
import Layout from '@/components/layout/Layout'
import { JsonLd } from '@/components/seo/JsonLd'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ locale: string }> | { locale: string }
}) {

  const resolvedParams = params instanceof Promise ? await params : params;
  const { locale } = resolvedParams;
  
  const t = await getTranslations({ locale, namespace: 'HomePage.metadata' });

  return {
    title: t('title'),
    description: t('description'),
    keywords: [
      t('keywords.taskManagement'),
      t('keywords.productivityTool'),
      t('keywords.todoApplication'),
      t('keywords.projectOrganization'),
      t('keywords.taskPriority'),
      t('keywords.deadlineTracking'),
      t('keywords.productivityDashboard'),
    ],
    authors: [{ name: 'Esdras Santos' }],
    robots: 'index, follow',
    openGraph: {
      locale: locale,
      type: 'website',
      url: `https://tarevity.pt/${locale}`,
      siteName: 'Tarevity',
      title: t('title'),
      description: t('description'),
    }
  };
}

export default function HomePage() {
  const t = useTranslations('HomePage');

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Tarevity',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1024',
    },
    description: t('structuredData.description'),
  }

  return (
    <Layout>
      <JsonLd data={structuredData} />
      <div className="py-12">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl rounded-lg px-4 sm:px-6 lg:px-8">
          <div className="p-8 lg:text-center">
            <h1 className="text-BlackLight dark:text-darkText text-center text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl dark:text-white">
              {t('hero.title')}
            </h1>
            <p className="text-BlackLight dark:text-darkSecondaryText mx-auto mt-3 max-w-md text-center text-lg md:mt-5 md:max-w-3xl dark:text-white">
              {t('hero.description')}
            </p>
            <div className="mt-10 flex justify-center">
              <div className="rounded-md shadow">
                <Link
                  href="/auth/login"
                  className="dark:bg-BlackLight flex w-full items-center justify-center rounded-md border border-transparent bg-white px-5 py-1.5 text-base font-medium transition-all duration-300 md:text-lg"
                >
                  {t('hero.getStarted')} <IoMdArrowForward size={18} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <article className="dark:bg-BlackLight container mx-auto mt-10 rounded-lg bg-white py-12 shadow-lg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-center font-semibold uppercase">{t('features.heading')}</h2>
              <p className="text-center text-3xl font-extrabold sm:text-4xl">
                {t('features.subheading')}
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:grid md:grid-cols-2 md:space-y-0 md:gap-x-8 md:gap-y-10">
                {/* Feature 1 */}
                <section className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-primary flex size-12 items-center justify-center rounded-md text-white">
                      <FaCheckCircle className="size-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium">
                      {t('features.feature1.title')}
                    </h3>
                    <p className="text-GraySecondaryLight dark:text-GrayDark mt-2 text-base">
                      {t('features.feature1.description')}
                    </p>
                  </div>
                </section>

                {/* Feature 2 */}
                <section className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-primary flex size-12 items-center justify-center rounded-md text-white">
                      <FaBell className="size-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lightText dark:text-darkText text-lg leading-6 font-medium">
                      {t('features.feature2.title')}
                    </h3>
                    <p className="text-GraySecondaryLight dark:text-GrayDark mt-2 text-base">
                      {t('features.feature2.description')}
                    </p>
                  </div>
                </section>

                {/* Feature 3 */}
                <section className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-primary flex size-12 items-center justify-center rounded-md text-white">
                      <FaLock className="size-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lightText dark:text-darkText text-lg leading-6 font-medium">
                      {t('features.feature3.title')}
                    </h3>
                    <p className="text-GraySecondaryLight dark:text-GrayDark mt-2 text-base">
                      {t('features.feature3.description')}
                    </p>
                  </div>
                </section>

                {/* Feature 4 */}
                <section className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-primary flex size-12 items-center justify-center rounded-md text-white">
                      <FaMobileAlt className="size-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lightText dark:text-darkText text-lg leading-6 font-medium">
                      {t('features.feature4.title')}
                    </h3>
                    <p className="text-GraySecondaryLight dark:text-GrayDark mt-2 text-base">
                      {t('features.feature4.description')}
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </article>

        {/* Testimonials Section */}
        <div className="container mx-auto mt-10 hidden rounded-lg shadow-lg">
          <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8"></div>
        </div>

        {/* CTA Section */}
        <article className="bg-primary container mx-auto mt-10 rounded-lg shadow-lg">
          <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">{t('cta.title1')}</span>
              <span className="block">{t('cta.title2')}</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-white">
              {t('cta.description')}
            </p>
            <Link
              href="/auth/register"
              className="text-primary mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-white px-5 py-1.5 text-base font-medium transition-all duration-300 hover:bg-white/80 sm:w-auto"
            >
              {t('cta.button')}
            </Link>
          </div>
        </article>
      </div>
    </Layout>
  )
}