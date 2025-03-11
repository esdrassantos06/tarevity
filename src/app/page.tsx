import Link from 'next/link'
import { FaCheckCircle, FaBell, FaLock, FaMobileAlt } from 'react-icons/fa'
import { IoIosArrowForward } from 'react-icons/io'
import Layout from '@/components/layout/Layout'
import TarevityLogo from '@/components/logo/TarevityLogo'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Tarevity - Streamline Your Productivity with Smart Task Management',
  description: `Transform how you organize daily work with Tarevity's intuitive task management.`,
  keywords: ['task management', 'productivity tool', 'to-do application', 'project organization'],
  authors: [{ name: 'Esdras Santos' }],
  robots: 'index, follow'
}

export default function HomePage() {
  return (
    <Layout>
      <div className="py-12">
        {/* Hero Section */}
        <div className="mx-auto max-w-7xl rounded-lg px-4 sm:px-6 lg:px-8">
          <div className="p-8 lg:text-center">
            <h1 className="text-BlackLight text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
            <TarevityLogo className='sm:w-120 w-100 md:w-150 mx-auto fill-BlackLight dark:fill-white mb-6'/> 
            </h1>
            <h2 className="text-BlackLight dark:text-white text-center dark:text-darkText text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Manage your tasks efficiently
            </h2>
            <p className="text-BlackLight dark:text-white text-center dark:text-darkSecondaryText mx-auto mt-3 max-w-md text-lg sm:text-xl md:mt-5 md:max-w-3xl">
              Organize your tasks, set priorities, and never forget important
              deadlines again. A simple and efficient way to increase your
              productivity.
            </p>
            <div className="mt-10 flex justify-center">
              <div className="rounded-md shadow">
                <Link
                  href="/auth/login"
                  className="transition-all bg-white dark:bg-BlackLight duration-300 flex w-full items-center justify-center rounded-md border border-transparent px-4 py-0.5 text-base font-medium md:px-5 md:py-1 md:text-lg"
                >
                  Get Started <IoIosArrowForward size={18} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-10 rounded-lg bg-white dark:bg-BlackLight py-12 shadow-lg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="uppercase font-semibold">
                Features
              </h2>
              <p className="text-3xl font-extrabold sm:text-4xl">
                Everything you need to stay organized
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:grid md:grid-cols-2 md:space-y-0 md:gap-x-8 md:gap-y-10">
                {/* Feature 1 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
                      <FaCheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-medium leading-6 ">
                      Simple task management
                    </h3>
                    <p className="mt-2 text-base text-GraySecondaryLight dark:text-GrayDark">
                      Add, edit, and mark tasks as completed with ease.
                      Intuitive and user-friendly interface.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
                      <FaBell className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lightText dark:text-darkText text-lg leading-6 font-medium">
                      Never miss a deadline
                    </h3>
                    <p className="mt-2 text-base text-GraySecondaryLight dark:text-GrayDark">
                      Set due dates for your tasks and stay in control of your
                      commitments.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
                      <FaLock className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lightText dark:text-darkText text-lg leading-6 font-medium">
                      Secure and private
                    </h3>
                    <p className="mt-2 text-base text-GraySecondaryLight  dark:text-GrayDark">
                      Your tasks are stored securely. Login with GitHub and
                      Google for greater convenience.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary text-white">
                      <FaMobileAlt className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lightText dark:text-darkText text-lg leading-6 font-medium">
                      Access from anywhere
                    </h3>
                    <p className="mt-2 text-base text-GraySecondaryLight dark:text-GrayDark">
                      Responsive design that works on all devices. Your tasks
                      are always within reach.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-lg bg-primary shadow-lg">
          <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
            <h2 className="text-white text-3xl font-extrabold sm:text-4xl">
              <span className="block">Ready to get organized?</span>
              <span className="block">Start using Tarevity today.</span>
            </h2>
            <p className="text-white mt-4 text-lg leading-6">
              Sign up for free and try all features of Tarevity.
            </p>
            <Link
              href="/auth/register"
              className="mt-8 transition-all duration-300 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-white text-base font-medium text-primary hover:bg-white/80 sm:w-auto md:px-5 md:py-1.5"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
