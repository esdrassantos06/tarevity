import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/theme-provider';
import { QueryProvider } from '@/components/query-provider';
import '../globals.css';
import { Toaster } from '@/components/ui/sonner';
import CookieBanner from '@/components/cookie-banner';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import { getOpenGraphLocale } from '@/utils/variables';
const inter = Inter({
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Layout.metadata' });

  const baseUrl = 'https://tarevity.pt';
  const localeUrl = `${baseUrl}/${locale}`;

  const languages: Record<string, string> = {};
  routing.locales.forEach((loc) => {
    languages[loc] = `${baseUrl}/${loc}`;
  });

  return {
    metadataBase: new URL(baseUrl),

    title: {
      template: '%s | Tarevity',
      default: t('title'),
    },

    description: t('description'),

    keywords: t.raw('keywords'),

    authors: [{ name: 'Tarevity Team' }],
    creator: 'Tarevity',
    publisher: 'Tarevity',

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    alternates: {
      canonical: localeUrl,
      languages,
    },

    openGraph: {
      title: t('openGraph.title'),
      description: t('openGraph.description'),
      url: localeUrl,
      siteName: 'Tarevity',
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
      creator: '@tarevity',
    },

    icons: {
      icon: '/favicon.ico',
      apple: '/apple-icon.png',
    },
  };
}

export default async function RootLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <meta name='apple-mobile-web-app-title' content='Tarevity' />
      </head>
      <body
        className={`${inter.variable} ${inter.className} flex min-h-screen w-full flex-col overflow-x-hidden font-sans antialiased`}
      >
        <NextIntlClientProvider messages={messages} locale={locale}>
          <QueryProvider>
            <ThemeProvider
              attribute='class'
              defaultTheme='system'
              enableSystem
              disableTransitionOnChange
            >
              <a href='#main-content' className='skip-link'>
                Skip to main content
              </a>
              {children}
              <Toaster richColors closeButton position='top-right' />
              <CookieBanner />
            </ThemeProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
