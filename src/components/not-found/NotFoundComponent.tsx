'use client'

import { FaHome } from 'react-icons/fa'
import Layout from '@/components/layout/Layout'
import React from 'react'
import { Link } from '@/i18n/navigation'

export default function NotFoundComponent() {
  return (
    <Layout>
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-16 sm:px-6 sm:py-24 md:grid md:place-items-center lg:px-8">
        <div className="mx-auto max-w-max">
          <main className="flex flex-col items-center justify-center">
            <div className="flex justify-center">
              <span
                className="text-9xl font-bold text-amber-500"
                aria-hidden="true"
              >
                404
              </span>
              <span className="sr-only">Error</span>
            </div>
            <h1 className="text-BlackLight text-4xl font-extrabold tracking-tight sm:text-5xl dark:text-white">
              Page not found
            </h1>
            <p className="mt-3 text-base text-gray-500 dark:text-gray-400">
              Sorry, we couldn&apos;t find the page you&apos;re looking for.
            </p>
            <div className="mt-10 flex">
              <Link
                href="/"
                className="bg-primary inline-flex items-center rounded-md border border-transparent px-4 py-2 font-normal text-white shadow-sm transition-all duration-300 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
              >
                <FaHome className="mr-2 -ml-1 text-white" aria-hidden="true" />
                Go Home
              </Link>
            </div>
          </main>
        </div>
      </div>
    </Layout>
  )
}
