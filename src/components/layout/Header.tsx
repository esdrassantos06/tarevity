'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { FaUser, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'
import ThemeToggle from '../common/ThemeToggle'
import TarevityLogo from '../logo/TarevityLogo'
import TarevityIcon from '../logo/TarevityIcon'

export default function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-lightHeader dark:bg-darkHeader shadow-md">
      <div className="mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link
                href={session ? '/dashboard' : '/'}
                className="text-2xl font-bold text-blue-600 dark:text-blue-400"
              >
                <TarevityLogo className="w-30 fill-black hidden sm:flex dark:fill-white" />
                <TarevityIcon className="w-12 fill-black flex sm:hidden dark:fill-white" />
              </Link>
            </div>
          </div>

          {session ? (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="relative ml-3">
                <div className="flex items-center gap-4">
                  <Link
                    href="/profile"
                    className="flex items-center text-gray-700 hover:text-gray-900 dark:text-darkText dark:hover:text-darkText/80"
                  >
                    <FaUser className="mr-1 inline" />
                    Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center text-gray-700 hover:text-gray-900 dark:text-darkText dark:hover:text-darkText/80"
                  >
                    <FaCog className="mr-1 inline" />
                    Settings
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex cursor-pointer items-center text-gray-700 hover:text-gray-900 dark:text-darkText dark:hover:text-darkText/80"
                  >
                    <FaSignOutAlt className="mr-1 inline" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex sm:items-center sm:gap-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center rounded-lg border border-transparent px-4 py-1.5 transition-all duration-300 text-sm font-medium dark:text-darkText text-lightText hover:border-blue-600"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center transition-all duration-300 rounded-md border border-transparent dark:bg-white px-4 py-1.5 text-sm font-medium dark:text-black text-white dark:hover:bg-lightButton bg-darkButton hover:bg-zinc-900"
              >
                Register
              </Link>
              <ThemeToggle />
            </div>
          )}

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-darkText"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <FaTimes size={22} className='fill-black dark:fill-white'/> : <FaBars className='fill-black dark:fill-white' size={22}/>}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="space-y-1 pt-2 pb-3">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-darkText dark:hover:bg-gray-700 dark:hover:text-darkText/80"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-darkText dark:hover:bg-gray-700 dark:hover:text-darkText/80"
                >
                  <FaUser className="mr-1 inline" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-darkText dark:hover:bg-gray-700 dark:hover:text-darkText/80"
                >
                  <FaCog className="mr-1 inline" />
                  Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="block w-full px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-darkText dark:hover:bg-gray-700 dark:hover:text-darkText/80"
                >
                  <FaSignOutAlt className="mr-1 inline" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-darkText dark:hover:bg-gray-700 dark:hover:text-darkText/80"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-darkText dark:hover:bg-gray-700 dark:hover:text-darkText/80"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}