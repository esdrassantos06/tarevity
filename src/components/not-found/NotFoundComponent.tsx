'use client';

import { FaHome } from 'react-icons/fa'
import Layout from '@/components/layout/Layout'
import React from 'react'
import Link from 'next/link'

export default function NotFoundComponent() {
    return (
      <Layout>
        <div className="flex min-h-[70vh] items-center justify-center px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
          <div className="max-w-max mx-auto">
            <main className="flex flex-col justify-center items-center">
              <div className="flex justify-center">
                <span className="text-amber-500 text-9xl font-bold" aria-hidden="true">404</span>
                <span className="sr-only">Error</span>
              </div>
                  <h1 className="text-4xl font-extrabold tracking-tight text-BlackLight dark:text-white sm:text-5xl">Page not found</h1>
                  <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for.
                  </p>
                <div className="mt-10 flex">
                  <Link
                    href="/"
                    className="inline-flex items-center rounded-md border px-4 py-2 border-transparent bg-primary font-normal text-white shadow-sm duration-300 transition-all hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    <FaHome className="mr-2 text-white -ml-1" aria-hidden="true" />
                    Go Home
                  </Link>
              </div>
            </main>
          </div>
        </div>
      </Layout>
    )
  }