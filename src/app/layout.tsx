import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextAuthProvider } from '@/components/auth/NextAuthProvider'
import { ThemeProvider } from '@/components/common/ThemeProvider'
import ToastProvider from '@/components/common/ToastProvider'


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | Tarevity',
    default: 'Tarevity - Intelligent Task Management for Modern Professionals',
  },
  description: `Elevate your productivity with Tarevity's secure, intuitive task management platform featuring priority-based workflows and comprehensive analytics.`,
  keywords: ['task management', 'productivity system', 'priority management', 'deadline tracking'],
  authors: [{ name: 'Esdras Santos' }],
  creator: 'Esdras Santos',
  publisher: 'Tarevity',
  robots: 'index, follow'
}
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body className={`${inter.className}`} suppressHydrationWarning>
        <NextAuthProvider>
          <ThemeProvider  attribute="class" defaultTheme="system" enableSystem>
            {children}
            <ToastProvider />
          </ThemeProvider>
        </NextAuthProvider>
      </body>

    </html>
  )
}