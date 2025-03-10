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
              <Link
                href={session ? '/dashboard' : '/'}
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
                    className="flex p-2 hover:bg-BorderLight/60 duration-300 transition-colors dark:hover:bg-BorderDark/20 dark:border-BorderDark border-BorderLight rounded-lg border-2 dark:text-white text-BlackLight items-center"
                  >
                    <FaUser className="dark:text-white" />
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex hover:bg-BorderLight/60 duration-300 transition-colors dark:hover:bg-BorderDark/20  dark:text-white text-BlackLight p-2 cursor-pointer items-center dark:border-BorderDark border-BorderLight rounded-lg border-2"
                  >
                    <FaSignOutAlt className="dark:text-white" />
                  </button>
                  <Link
                    href="/settings"
                    className="flex p-2 items-center border-BorderLight hover:bg-BorderLight/60 duration-300 transition-colors dark:hover:bg-BorderDark/20  dark:border-BorderDark rounded-lg border-2 dark:text-white text-BlackLight"
                  >
                    <FaCog className="dark:text-white" />
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex sm:items-center sm:gap-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center rounded-lg px-4 py-1.5 transition-colors duration-300 dark:hover:bg-BorderDark/40 hover:bg-BorderLight/70 text-primary border-2 dark:border-BorderDark border-BorderLight"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center transition-all duration-300 bg-primary hover:bg-primary/80 text-white rounded-md px-4 py-1.5 "
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
              className="inline-flex items-center justify-center rounded-md p-2 "
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <FaTimes size={22} className='fill-BlackLight dark:fill-white'/> : <FaBars className='fill-BlackLight dark:fill-white' size={22}/>}
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
                  className="block dark:text-white text-BlackLight px-3 py-2"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block dark:text-white text-BlackLight px-3 py-2"
                >
                  <FaUser className="mr-1 inline" />
                  Profile
                </Link>
                <Link
                  href="/settings"
                  className="block dark:text-white text-BlackLight px-3 py-2"
                >
                  <FaCog className="mr-1 inline" />
                  Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="block dark:text-white text-BlackLight w-full px-3 py-2"
                >
                  <FaSignOutAlt className="mr-1 inline" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block dark:text-white text-BlackLight px-3 py-2"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block dark:text-white text-BlackLight px-3 py-2"
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