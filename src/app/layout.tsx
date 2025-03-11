import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextAuthProvider } from '@/components/auth/NextAuthProvider'
import { ThemeProvider } from '@/components/common/ThemeProvider'
import ToastProvider from '@/components/common/ToastProvider'
import { headers } from 'next/headers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tarevity - Manage your tasks efficiently',
  description: 'A modern and efficient task list application',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headersList = await headers();
  const nonce = headersList.get('x-nonce') || '';
  
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {nonce && <meta property="csp-nonce" content={nonce} />}
      </head>
      <body className={`${inter.className}`} suppressHydrationWarning>
        <NextAuthProvider>
          {/* Don't pass nonce to ThemeProvider directly */}
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <ToastProvider />
          </ThemeProvider>
        </NextAuthProvider>
      </body>
    </html>
  )
}