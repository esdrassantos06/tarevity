import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextAuthProvider } from '@/components/auth/NextAuthProvider'
import { ThemeProvider } from '@/components/common/ThemeProvider'
import ToastProvider from '@/components/common/ToastProvider'
import Providers from '@/components/common/Providers'
import CookieBanner from '@/components/cookie-consent/CookieBanner'

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
  ],
  authors: [{ name: 'Esdras Santos' }],
  creator: 'Esdras Santos',
  publisher: 'Tarevity',
  robots: 'index, follow',
  icons: {
    icon: '/icon.png',
    apple: '/apple-icon.png',
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <head></head>
      <body
        className={`${inter.className} overflow-x-hidden`}
        suppressHydrationWarning
      >
        <Providers>
          <NextAuthProvider>
            <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
              {children}
              <CookieBanner />
              <ToastProvider />
            </ThemeProvider>
          </NextAuthProvider>
        </Providers>
      </body>
    </html>
  )
}
