'use client';

import { Link, useRouter } from '@/i18n/navigation';
import FullLogo from './logo/full-logo';
import TarevityIcon from './logo/icon';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { NotificationsDropdown } from './notifications/notifications-dropdown';
import { LanguageSelector } from './intl/language-selector';

import { authClient } from '@/lib/auth-client';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function Header() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const t = useTranslations('Header');

  const handleSignOut = async () => {
    const promise = authClient.signOut({
      fetchOptions: {
        onSuccess: () => router.push('/auth/login'),
      },
    });

    toast.promise(promise, {
      loading: t('toast.loggingOut'),
      success: t('toast.loggedOut'),
      error: t('toast.logoutFailed'),
    });
  };

  return (
    <header
      className='sticky top-5 z-999 mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 rounded-full border border-white/20 bg-white/70 p-3 shadow-lg backdrop-blur-md md:p-4 dark:border-white/10 dark:bg-[#1d1929]/70'
      role='banner'
    >
      {/* Logo */}
      <Link
        href='/dashboard'
        aria-label={t('dashboardAriaLabel')}
        title={t('dashboardTitle')}
        className='flex-shrink-0'
      >
        <FullLogo className='hidden w-30 md:flex dark:fill-white' />
        <TarevityIcon className='flex w-10 md:hidden dark:fill-white' />
      </Link>

      {/* Navigation and Actions */}
      <nav
        className='scrollbar-hide flex items-center gap-1.5 overflow-visible md:gap-2'
        aria-label={t('mainNavigation')}
      >
        {isPending ? (
          <div
            className='flex items-center gap-2'
            role='status'
            aria-label={t('loadingUserActions')}
          >
            <Skeleton className='size-8 rounded-full' />
            <Skeleton className='size-8 rounded-full' />
            <Skeleton className='size-8 rounded-full' />
          </div>
        ) : session ? (
          <>
            {/* Language Selector */}
            <LanguageSelector />

            {/* Calendar Link */}
            <Button
              asChild
              size='icon'
              variant='outline'
              className='rounded-full'
            >
              <Link
                href='/calendar'
                aria-label={t('calendar.ariaLabel')}
                title={t('calendar.title')}
              >
                <Icon
                  icon='tabler:calendar'
                  className='size-5'
                  aria-hidden='true'
                />
              </Link>
            </Button>

            {/* Notifications */}
            <NotificationsDropdown />

            {/* User Menu */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='ghost'
                  className='size-9 cursor-pointer rounded-full'
                  aria-label={t('userMenu.ariaLabel', {
                    name: session.user.name,
                  })}
                  aria-haspopup='true'
                  aria-expanded='false'
                  title={t('userMenu.title', { name: session.user.name })}
                >
                  <Avatar className='size-9 select-none'>
                    {session.user.image ? (
                      <AvatarImage
                        src={session.user.image}
                        alt={t('userMenu.profilePicture', {
                          name: session.user.name,
                        })}
                        title={t('userMenu.avatar', {
                          name: session.user.name,
                        })}
                      />
                    ) : (
                      <AvatarFallback
                        aria-label={t('userMenu.avatarAriaLabel', {
                          name: session.user.name,
                        })}
                        className='select-none'
                        title={t('userMenu.avatar', {
                          name: session.user.name,
                        })}
                      >
                        {session.user.name.charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align='end'
                sideOffset={4}
                className='z-999 w-[calc(100vw-2rem)] max-w-56 border border-white/20 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-[#1d1929]/80'
                role='menu'
                aria-label={t('userMenu.menuAriaLabel')}
              >
                <div className='px-4 py-2'>
                  <p className='text-sm font-medium' itemProp='name'>
                    {session.user.name}
                  </p>
                  <p
                    className='text-muted-foreground truncate text-xs'
                    itemProp='email'
                  >
                    {session.user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild role='menuitem'>
                  <Link
                    href='/profile'
                    className='flex items-center gap-2'
                    aria-label={t('menu.profile.ariaLabel')}
                    title={t('menu.profile.title')}
                  >
                    <Icon
                      icon='mdi:user'
                      className='size-4'
                      aria-hidden='true'
                    />
                    {t('menu.profile.label')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild role='menuitem'>
                  <Link
                    href='/settings'
                    className='flex items-center gap-2'
                    aria-label={t('menu.settings.ariaLabel')}
                    title={t('menu.settings.title')}
                  >
                    <Icon
                      icon='mdi:settings'
                      className='size-4'
                      aria-hidden='true'
                    />
                    {t('menu.settings.label')}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={handleSignOut}
                  className='text-destructive'
                  role='menuitem'
                  aria-label={t('menu.logout.ariaLabel')}
                  title={t('menu.logout.title')}
                >
                  <Icon
                    icon='mdi:logout'
                    className='mr-2 size-4'
                    aria-hidden='true'
                  />
                  {t('menu.logout.label')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        ) : (
          <>
            {/* Language Selector (Not Authenticated) */}
            <LanguageSelector />

            {/* Auth Links */}
            <Button asChild variant='outline' className='rounded-full'>
              <Link
                href='/auth/login'
                aria-label={t('auth.login.ariaLabel')}
                title={t('auth.login.title')}
              >
                {t('auth.login.label')}
              </Link>
            </Button>
            <Button
              asChild
              className='bg-blue-accent hover:bg-blue-accent/70 rounded-full text-white'
            >
              <Link
                href='/auth/register'
                aria-label={t('auth.register.ariaLabel')}
                title={t('auth.register.title')}
              >
                {t('auth.register.label')}
              </Link>
            </Button>
          </>
        )}
      </nav>
    </header>
  );
}
