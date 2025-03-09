import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextAuthProvider } from '@/components/auth/NextAuthProvider'
import { ThemeProvider } from '@/components/common/ThemeProvider'
import ToastProvider from '@/components/common/ToastProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tarevity - Manage your tasks efficiently',
  description: 'A modern and efficient task list application',
  icons: {
    icon: [
      {url: '/icon.svg', type: 'image/svg+xml'},
    ],
    apple: [
      {url: '/apple-icon.png', sizes: '180x180'},
    ]
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className}`} suppressHydrationWarning>
        <NextAuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
          <ToastProvider />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}