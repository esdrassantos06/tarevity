import { Inter } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import type { Metadata, ResolvingMetadata, Viewport } from 'next'
import { NextAuthProvider } from '@/components/auth/NextAuthProvider'
import { ThemeProvider } from '@/components/common/ThemeProvider'
import ToastProvider from '@/components/common/ToastProvider'
import Providers from '@/components/common/Providers'
import CookieBanner from '@/components/cookie-consent/CookieBanner'
import './globals.css'
import { getTranslations } from 'next-intl/server'

const inter = Inter({ subsets: ['latin'] })

type Params = Promise<{ locale: string }>

export async function generateMetadata(
  { params }: { params: Params },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const resolvedParams = await params

  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'Layout.metadata',
  })

  return {
    title: {
      template: '%s | Tarevity',
      default: t('defaultTitle'),
    },
    description: t('description'),
    keywords: t('keywords')
      .split(',')
      .map((keyword) => keyword.trim()),
    authors: [
      { name: 'Esdras Santos', url: 'https://github.com/esdrassantos06' },
    ],
    creator: 'Esdras Santos',
    publisher: 'Tarevity',
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-video-preview': -1,
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: 'https://tarevity.pt',
    },
    openGraph: {
      type: 'website',
      locale: resolvedParams.locale,
      url: 'https://tarevity.pt',
      siteName: 'Tarevity',
      title: t('defaultTitle'),
      description: t('description'),
    },
    icons: {
      icon: '/icon.png',
      apple: '/apple-icon.png',
    },
    appleWebApp: {
      title: 'Tarevity',
      statusBarStyle: 'black-translucent',
      capable: true,
    },
    formatDetection: {
      telephone: false,
    },
    manifest: '/manifest.json',
    category: 'productivity',
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }> | { locale: string }
}) {
  const t = await getTranslations('Layout')

  const { locale } = params instanceof Promise ? await params : params

  if (!hasLocale(routing.locales, locale)) {
    notFound()
  }

  return (
    <html lang={locale} suppressHydrationWarning className="overflow-x-hidden">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body
        className={`${inter.className} overflow-x-hidden`}
        suppressHydrationWarning
      >
        <Providers>
          <NextAuthProvider>
            <NextIntlClientProvider>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
              >
                <a
                  aria-label={t('skipToMainContent')}
                  href="#main-content"
                  className="focus:text-primary sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:outline focus:outline-offset-2"
                >
                  {t('skipToMainContent')}
                </a>
                <main id="main-content">{children}</main>
                <CookieBanner />
                <ToastProvider />
              </ThemeProvider>
            </NextIntlClientProvider>
          </NextAuthProvider>
        </Providers>
      </body>
    </html>
  )
}
