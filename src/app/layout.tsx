import "./globals.css";
import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import { NextAuthProvider } from '@/components/auth/NextAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "Tarevity - Gerencie suas tarefas com eficiência",
  description: "Um aplicativo de lista de tarefas moderno e eficiente",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.className}`}
      >
        <NextAuthProvider>{children}</NextAuthProvider>
      </body>
    </html>
  );
}
