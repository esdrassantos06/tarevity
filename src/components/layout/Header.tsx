'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { FaUser, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'
import ThemeToggle from '../common/ThemeToggle'
import TarevityLogo from '../logo/TarevityLogo'

export default function Header() {
  const { data: session } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <header className="bg-headerLightMode dark:bg-headerDarkMode shadow">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link
                href={session ? '/dashboard' : '/'}
                className="text-2xl font-bold text-blue-600 dark:text-blue-400"
              >
                <TarevityLogo className="w-35" />
              </Link>
            </div>
          </div>

          {session ? (
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="relative ml-3">
                <div className="flex items-center gap-4">
                  <Link
                    href="/profile"
                    className="flex items-center text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    <FaUser className="mr-1 inline" />
                    Perfil
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    <FaCog className="mr-1 inline" />
                    Configurações
                  </Link>
                  <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="flex cursor-pointer items-center text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                  >
                    <FaSignOutAlt className="mr-1 inline" />
                    Sair
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="hidden sm:flex sm:items-center sm:gap-3">
              <Link
                href="/auth/login"
                className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Entrar
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-blue-600 hover:bg-gray-50 dark:bg-gray-700 dark:text-blue-400 dark:hover:bg-gray-600"
              >
                Registrar
              </Link>
              <ThemeToggle />
            </div>
          )}

          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              type="button"
              className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-700 dark:hover:text-white"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menu principal</span>
              {isMenuOpen ? <FaTimes /> : <FaBars />}
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
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <FaUser className="mr-1 inline" />
                  Perfil
                </Link>
                <Link
                  href="/settings"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <FaCog className="mr-1 inline" />
                  Configurações
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="block w-full px-3 py-2 text-left text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  <FaSignOutAlt className="mr-1 inline" />
                  Sair
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Entrar
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white"
                >
                  Registrar
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
