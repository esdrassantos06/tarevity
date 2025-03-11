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