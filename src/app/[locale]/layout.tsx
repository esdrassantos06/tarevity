import { Inter } from 'next/font/google'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { routing } from '@/i18n/routing'
import type { Metadata, Viewport } from 'next'
import { NextAuthProvider } from '@/components/auth/NextAuthProvider'
import { ThemeProvider } from '@/components/common/ThemeProvider'
import ToastProvider from '@/components/common/ToastProvider'
import Providers from '@/components/common/Providers'
import CookieBanner from '@/components/cookie-consent/CookieBanner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Tarevity',
    default: 'Tarevity - Intelligent Task Management for Modern Professionals',
  },
  description: `Elevate your productivity with Tarevity's secure, intuitive task management platform featuring priority-based workflows and comprehensive analytics.`,
  keywords: [
    'task management',
    'productivity system',
    'priority management',
    'deadline tracking',
    'project organization',
    'to-do list app',
    'work management',
    'task tracking',
  ],
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
    locale: 'en_US',
    url: 'https://tarevity.pt',
    siteName: 'Tarevity',
    title: 'Tarevity - Intelligent Task Management for Modern Professionals',
    description:
      "Elevate your productivity with Tarevity's secure, intuitive task management platform",
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

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }> | { locale: string }
}) {
  const { locale } = params instanceof Promise ? await params : params

  // Ensure that the incoming `locale` is valid
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
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              <NextIntlClientProvider>
                <a
                  aria-label="Skip to main content"
                  href="#main-content"
                  className="focus:text-primary sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:outline focus:outline-offset-2"
                >
                  Skip to main content
                </a>
                <main id="main-content">{children}</main>
                <CookieBanner />
                <ToastProvider />
              </NextIntlClientProvider>
            </ThemeProvider>
          </NextAuthProvider>
        </Providers>
      </body>
    </html>
  )
}
