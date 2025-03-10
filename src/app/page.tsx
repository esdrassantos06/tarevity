import Link from 'next/link'
import { FaCheckCircle, FaBell, FaLock, FaMobileAlt } from 'react-icons/fa'
import { IoIosArrowForward } from 'react-icons/io'
import Layout from '@/components/layout/Layout'

export default function HomePage() {
  return (
    <Layout>
      <div className="py-12">
        {/* Hero Section */}
        <div className="mx-auto max-w-7xl rounded-lg px-4 sm:px-6 lg:px-8">
          <div className="p-8 lg:text-center">
            <h1 className="text-lightText dark:text-darkText text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              Manage your tasks efficiently
            </h1>
            <p className="text-lightText dark:text-darkSecondaryText mx-auto mt-3 max-w-md text-lg sm:text-xl md:mt-5 md:max-w-3xl">
              Organize your tasks, set priorities, and never forget important
              deadlines again. A simple and efficient way to increase your
              productivity.
            </p>
            <div className="mt-10 flex justify-center">
              <div className="rounded-md shadow">
                <Link
                  href="/auth/login"
                  className="dark:bg-lightButton transition-all duration-300 dark:hover:bg-lightButton/80 hover:bg-darkButton/80 bg-darkButton dark:text-lightText text-darkText flex w-full items-center justify-center rounded-md border border-transparent px-4 py-0.5 text-base font-medium md:px-5 md:py-1 md:text-lg"
                >
                  Get Started <IoIosArrowForward size={18} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-lightCard dark:bg-darkCard mt-10 rounded-lg py-12 shadow-lg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400">
                Features
              </h2>
              <p className="text-lightText dark:text-darkText mt-2 text-3xl leading-8 font-extrabold tracking-tight sm:text-4xl">
                Everything you need to stay organized
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:grid md:grid-cols-2 md:space-y-0 md:gap-x-8 md:gap-y-10">
                {/* Feature 1 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                      <FaCheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lightText dark:text-darkText text-lg leading-6 font-medium">
                      Simple task management
                    </h3>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                      Add, edit, and mark tasks as completed with ease.
                      Intuitive and user-friendly interface.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                      <FaBell className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lightText dark:text-darkText text-lg leading-6 font-medium">
                      Never miss a deadline
                    </h3>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                      Set due dates for your tasks and stay in control of your
                      commitments.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                      <FaLock className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lightText dark:text-darkText text-lg leading-6 font-medium">
                      Secure and private
                    </h3>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                      Your tasks are stored securely. Login with GitHub and
                      Google for greater convenience.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                      <FaMobileAlt className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lightText dark:text-darkText text-lg leading-6 font-medium">
                      Access from anywhere
                    </h3>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
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
        <div className="mt-10 rounded-lg bg-blue-600 shadow-lg dark:bg-blue-700">
          <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
            <h2 className="text-darkText text-3xl font-extrabold sm:text-4xl">
              <span className="block">Ready to get organized?</span>
              <span className="block">Start using Tarevity today.</span>
            </h2>
            <p className="text-darkText/80 mt-4 text-lg leading-6">
              Sign up for free and try all features of Tarevity.
            </p>
            <Link
              href="/auth/register"
              className="mt-8 transition-all duration-300 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-white text-base font-medium text-blue-600 hover:bg-blue-50 sm:w-auto md:px-5 md:py-1.5"
            >
              Create Free Account
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
