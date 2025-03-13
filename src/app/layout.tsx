import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextAuthProvider } from '@/components/auth/NextAuthProvider'
import { ThemeProvider } from '@/components/common/ThemeProvider'
import ToastProvider from '@/components/common/ToastProvider'
import Providers from '@/components/common/Providers'

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
    icon: [
      { url: '/favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/favicon/apple-touch-icon-57x57.png', sizes: '57x57', type: 'image/png' },
      { url: '/favicon/apple-touch-icon-60x60.png', sizes: '60x60', type: 'image/png' },
      { url: '/favicon/apple-touch-icon-72x72.png', sizes: '72x72', type: 'image/png' },
      { url: '/favicon/apple-touch-icon-76x76.png', sizes: '76x76', type: 'image/png' },
      { url: '/favicon/apple-touch-icon-114x114.png', sizes: '114x114', type: 'image/png' },
      { url: '/favicon/apple-touch-icon-120x120.png', sizes: '120x120', type: 'image/png' },
      { url: '/favicon/apple-touch-icon-144x144.png', sizes: '144x144', type: 'image/png' },
      { url: '/favicon/apple-touch-icon-152x152.png', sizes: '152x152', type: 'image/png' },

    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/apple-touch-icon-precomposed.png',
      },
    ],
  },
  manifest: '/manifest.json',
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
              <ToastProvider />
            </ThemeProvider>
          </NextAuthProvider>
          </Providers>
      </body>
    </html>
  )
}
