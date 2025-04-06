'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Link } from '@/i18n/navigation'
import { FaUser, FaCog, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa'
import { MdSpaceDashboard } from 'react-icons/md'
import { IoCalendarClear, IoCalendarClearOutline } from 'react-icons/io5'
import TarevityLogo from '../logo/TarevityLogo'
import TarevityIcon from '../logo/TarevityIcon'
import UserImage from '../common/UserImage'
import NotificationDropdown from '../notifications/NotificationDropdown'
import { useProfileQuery } from '@/hooks/useProfileQuery'
import LanguageSwitcher from '../common/LanguageSwitcher'
import { useTranslations } from 'next-intl'
import { Button } from '../ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function Header() {
  const t = useTranslations('header')
  const { data: session, status } = useSession()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const { data: profileData, refetch: refetchProfile } = useProfileQuery({
    enabled: status === 'authenticated',
  })

  useEffect(() => {
    if (status === 'authenticated') {
      refetchProfile()
    }
  }, [status, refetchProfile])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const isAuthenticated = status === 'authenticated' && !!session?.user

  return (
    <header className="bg-HeaderBgLight dark:bg-HeaderBgDark shadow-sm">
      <div className="mx-auto px-4 sm:px-6 lg:px-12">
        <div className="flex h-16 justify-between">
          <div className="flex">
            <div className="flex flex-shrink-0 items-center">
              <Link
                href={isAuthenticated ? '/dashboard' : '/'}
                title="Tarevity"
              >
                <TarevityLogo className="hidden w-30 fill-black sm:flex dark:fill-white" />
                <TarevityIcon className="flex w-12 fill-black sm:hidden dark:fill-white" />
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <LanguageSwitcher />
            {isAuthenticated ? (
              <div className="flex items-center justify-center">
                <NotificationDropdown />

                <Link href="/calendar" aria-label={t('calendar')}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-BorderLight hover:bg-BorderLight dark:border-BorderDark dark:hover:bg-BorderDark relative mr-2 hidden size-10 p-2 sm:flex"
                  >
                    <IoCalendarClearOutline className="size-5" />
                  </Button>
                </Link>
                <div className="hidden items-center gap-2 sm:flex">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        aria-label={t('openUserMenu')}
                        className="border-BorderLight dark:border-BorderDark flex items-center rounded-full border-2 transition-colors duration-300 focus:outline-none"
                      >
                        <span className="sr-only">{t('openUserMenu')}</span>
                        <UserImage />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="dark:bg-BlackLight w-60"
                      align="end"
                    >
                      <div className="border-b border-gray-200 px-4 py-2 dark:border-gray-700">
                        <p className="text-sm font-bold text-gray-900 dark:text-white">
                          {profileData?.name}
                        </p>
                        <p className="truncate text-sm text-gray-500 dark:text-gray-400">
                          {profileData?.email}
                        </p>
                      </div>
                      <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                          <Link href="/profile" className="cursor-pointer">
                            <FaUser className="mr-2" />
                            {t('profile')}
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href="/settings" className="cursor-pointer">
                            <FaCog className="mr-2" />
                            {t('settings')}
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="cursor-pointer"
                      >
                        <FaSignOutAlt className="mr-2" />
                        {t('logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ) : (
              <div className="hidden font-medium sm:flex sm:items-center sm:gap-3">
                <Link
                  href="/auth/login"
                  className="dark:hover:bg-BorderDark/40 hover:bg-BorderLight/70 text-primary dark:border-BorderDark border-BorderLight inline-flex items-center rounded-lg border bg-transparent px-3 py-2 backdrop-blur-sm transition-colors duration-300 dark:text-white"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-primary hover:bg-primary/80 inline-flex items-center rounded-md px-3 py-2 text-white transition-all duration-300"
                >
                  {t('signup')}
                </Link>
              </div>
            )}

            <div className="-mr-2 flex items-center sm:hidden">
              <button
                aria-label={t('openMainMenu')}
                onClick={toggleMenu}
                type="button"
                className="inline-flex items-center justify-center rounded-md p-2"
                aria-expanded={isMenuOpen}
              >
                <span className="sr-only">{t('openMainMenu')}</span>
                {isMenuOpen ? (
                  <FaTimes
                    size={22}
                    className="fill-BlackLight dark:fill-white"
                  />
                ) : (
                  <FaBars
                    className="fill-BlackLight dark:fill-white"
                    size={22}
                  />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`dark:bg-HeaderBgDark absolute right-0 left-0 z-10 w-full transform bg-white shadow-md transition-all duration-300 ease-in-out ${isMenuOpen ? 'visible translate-x-0 opacity-100' : 'invisible -translate-x-10 opacity-0'} `}
        >
          <div className="space-y-1 pt-2 pb-3">
            {isAuthenticated ? (
              <>
                {/* Mobile user info */}
                <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
                  <div className="flex items-center">
                    <UserImage />
                    <div className="ml-3">
                      <div className="text-base font-medium text-gray-800 dark:text-white">
                        {session.user.name}
                      </div>
                      <div className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {session.user.email}
                      </div>
                    </div>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  className="text-BlackLight flex items-center gap-1 px-3 py-2 dark:text-white"
                >
                  <MdSpaceDashboard className="inline" />
                  {t('dashboard')}
                </Link>
                <Link
                  href="/profile"
                  className="text-BlackLight flex items-center gap-1 px-3 py-2 dark:text-white"
                >
                  <FaUser className="inline" />
                  {t('profile')}
                </Link>
                <Link
                  href="/settings"
                  className="text-BlackLight flex items-center gap-1 px-3 py-2 dark:text-white"
                >
                  <FaCog className="inline" />
                  {t('settings')}
                </Link>
                <Link
                  href="/calendar"
                  className="text-BlackLight flex items-center gap-1 px-3 py-2 dark:text-white"
                >
                  <IoCalendarClear className="inline" />
                  {t('calendar')}
                </Link>
                <button
                  aria-label={t('logout')}
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-BlackLight flex w-full items-center gap-1 px-3 py-2 text-left dark:text-white"
                >
                  <FaSignOutAlt className="inline" />
                  {t('logout')}
                </button>
              </>
            ) : (
              <div className="transition-all duration-300 ease-in-out">
                <Link
                  href="/auth/login"
                  className="text-BlackLight block px-3 py-2 font-medium dark:text-white"
                >
                  {t('login')}
                </Link>
                <Link
                  href="/auth/register"
                  className="text-BlackLight block px-3 py-2 font-medium dark:text-white"
                >
                  {t('signup')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
