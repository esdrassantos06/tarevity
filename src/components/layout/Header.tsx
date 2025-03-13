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
    <header className="bg-HeaderBgLightderBgLight dark:bg-HeaderBgDark shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link href={session ? '/dashboard' : '/'} title='Tarevity'>
                <TarevityLogo className="hidden w-30 fill-black sm:flex dark:fill-white" />
                <TarevityIcon className="flex w-12 fill-black sm:hidden dark:fill-white" />
              </Link>
            </div>
          </div>

          {session ? (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="relative ml-3">
                <div className="flex items-center gap-4">
                  <Link
                    href="/profile"
                    className="hover:bg-BorderLight/60 dark:hover:bg-BorderDark/20 dark:border-BorderDark border-BorderLight text-BlackLight flex items-center rounded-lg border-2 p-2 transition-colors duration-300 dark:text-white"
                  >
                    <FaUser className="dark:text-white" />
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="hover:bg-BorderLight/60 dark:hover:bg-BorderDark/20 text-BlackLight dark:border-BorderDark border-BorderLight flex cursor-pointer items-center rounded-lg border-2 p-2 transition-colors duration-300 dark:text-white"
                  >
                    <FaSignOutAlt className="dark:text-white" />
                  </button>
                  <Link
                    href="/settings"
                    className="border-BorderLight hover:bg-BorderLight/60 dark:hover:bg-BorderDark/20 dark:border-BorderDark text-BlackLight flex items-center rounded-lg border-2 p-2 transition-colors duration-300 dark:text-white"
                  >
                    <FaCog className="dark:text-white" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden font-bold sm:flex sm:items-center sm:gap-3">
              <Link
                href="/auth/login"
                className="dark:hover:bg-BorderDark/40 hover:bg-BorderLight/70 text-primary dark:text-white dark:border-BorderDark border-BorderLight inline-flex items-center rounded-lg border bg-transparent px-4 py-1.5 backdrop-blur-sm transition-colors duration-300"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="bg-primary hover:bg-primary/80 inline-flex items-center rounded-md px-4 py-1.5 text-white transition-all duration-300"
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
              className="inline-flex items-center justify-center rounded-md p-2"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <FaTimes
                  size={22}
                  className="fill-BlackLight dark:fill-white"
                />
              ) : (
                <FaBars className="fill-BlackLight dark:fill-white" size={22} />
              )}
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
                  className="text-BlackLight block px-3 py-2 dark:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="text-BlackLight block px-3 py-2 dark:text-white"
                >
                  <FaUser className="mr-1 inline" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="text-BlackLight block px-3 py-2 dark:text-white"
                >
                  <FaCog className="mr-1 inline" />
                  Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-BlackLight block w-full px-3 py-2 dark:text-white"
                >
                  <FaSignOutAlt className="mr-1 inline" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-BlackLight block px-3 py-2 dark:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="text-BlackLight block px-3 py-2 dark:text-white"
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
