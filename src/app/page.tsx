import Link from 'next/link'
import { FaCheckCircle, FaBell, FaLock, FaMobileAlt } from 'react-icons/fa'
import { IoMdArrowForward } from "react-icons/io";
import Layout from '@/components/layout/Layout'
import type { Metadata } from 'next'
import { JsonLd } from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: 'Tarevity - Streamline Your Productivity with Smart Task Management',
  description: `Transform how you organize daily work with Tarevity's intuitive task management.`,
  keywords: [
    'task management',
    'productivity tool',
    'to-do application',
    'project organization',
    'task priority',
    'deadline tracking',
    'productivity dashboard',
  ],
  authors: [{ name: 'Esdras Santos' }],
  robots: 'index, follow',
}

export default function HomePage() {

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Tarevity',
    applicationCategory: 'ProductivityApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1024',
    },
    description: 'A modern task management application that helps professionals organize their work and increase productivity.',
  };

  return (
    <Layout>
      <JsonLd data={structuredData} />
      <div className="py-12">
        {/* Hero Section */}
        <section className="mx-auto max-w-7xl rounded-lg px-4 sm:px-6 lg:px-8">
          <div className="p-8 lg:text-center">
            <h1 className="text-BlackLight dark:text-darkText text-center text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl dark:text-white">
              Manage your tasks efficiently
            </h1>
            <p className="text-BlackLight dark:text-darkSecondaryText mx-auto mt-3 max-w-md text-center text-lg md:mt-5 md:max-w-3xl dark:text-white">
              Organize your tasks, set priorities, and never forget important
              deadlines again. A simple and efficient way to increase your
              productivity.
            </p>
            <div className="mt-10 flex justify-center">
              <div className="rounded-md shadow">
                <Link
                  href="/auth/login"
                  className="dark:bg-BlackLight flex w-full items-center justify-center rounded-md border border-transparent bg-white px-5 py-1.5 text-base font-medium transition-all duration-300 md:text-lg"
                >
                  Get Started <IoMdArrowForward size={18} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <article className="dark:bg-BlackLight container mx-auto mt-10 rounded-lg bg-white py-12 shadow-lg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-center font-semibold uppercase">Features</h2>
              <p className="text-center text-3xl font-extrabold sm:text-4xl">
                Everything you need to stay organized
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:grid md:grid-cols-2 md:space-y-0 md:gap-x-8 md:gap-y-10">
                {/* Feature 1 */}
                <section className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-md text-white">
                      <FaCheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium">
                      Simple task management
                    </h3>
                    <p className="text-GraySecondaryLight dark:text-GrayDark mt-2 text-base">
                      Add, edit, and mark tasks as completed with ease.
                      Intuitive and user-friendly interface.
                    </p>
                  </div>
                </section>

                {/* Feature 2 */}
                <section className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-md text-white">
                      <FaBell className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lightText dark:text-darkText text-lg leading-6 font-medium">
                      Never miss a deadline
                    </h3>
                    <p className="text-GraySecondaryLight dark:text-GrayDark mt-2 text-base">
                      Set due dates for your tasks and stay in control of your
                      commitments.
                    </p>
                  </div>
                </section>

                {/* Feature 3 */}
                <section className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-md text-white">
                      <FaLock className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lightText dark:text-darkText text-lg leading-6 font-medium">
                      Secure and private
                    </h3>
                    <p className="text-GraySecondaryLight dark:text-GrayDark mt-2 text-base">
                      Your tasks are stored securely. Login with GitHub and
                      Google for greater convenience.
                    </p>
                  </div>
                </section>

                {/* Feature 4 */}
                <section className="flex">
                  <div className="flex-shrink-0">
                    <div className="bg-primary flex h-12 w-12 items-center justify-center rounded-md text-white">
                      <FaMobileAlt className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lightText dark:text-darkText text-lg leading-6 font-medium">
                      Access from anywhere
                    </h3>
                    <p className="text-GraySecondaryLight dark:text-GrayDark mt-2 text-base">
                      Responsive design that works on all devices. Your tasks
                      are always within reach.
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </article>

        {/* Testemonials Section */}
        <div className="hidden container mx-auto mt-10 rounded-lg shadow-lg">
          <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
          </div>
        </div>


        {/* CTA Section */}
        <article className="bg-primary container mx-auto mt-10 rounded-lg shadow-lg">
          <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Ready to get organized?</span>
              <span className="block">Start using Tarevity today.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-white">
              Sign up for free and try all features of Tarevity.
            </p>
            <Link
              href="/auth/register"
              className="text-primary mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-white px-5 py-1.5 text-base font-medium transition-all duration-300 hover:bg-white/80 sm:w-auto"
            >
              Create Free Account
            </Link>
          </div>
        </article>
      </div>
    </Layout>
  )
}
