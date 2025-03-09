import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { NextAuthProvider } from '@/components/auth/NextAuthProvider'
import ToastProvider from '@/components/common/ToastProvider'
import { ThemeProvider } from '@/components/common/ThemeProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tarevity - Gerencie suas tarefas com eficiência',
  description: 'Um aplicativo de lista de tarefas moderno e eficiente',
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
