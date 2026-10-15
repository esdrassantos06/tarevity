'use client';

import { Link, usePathname, useRouter } from '@/i18n/navigation';
import { Wordmark } from './logo/wordmark';
import { cn } from '@/lib/utils';
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
import { clearUserDrafts } from '@/lib/drafts';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

export default function Header() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const t = useTranslations('Header');
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: t('nav.boards') },
    { href: '/calendar', label: t('nav.calendar') },
  ] as const;

  const handleSignOut = async () => {
    if (session) clearUserDrafts(session.user.id);
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
      className='bg-background/95 supports-backdrop-filter:bg-background/85 border-print sticky top-0 z-50 w-full border-b-[3px] border-double backdrop-blur-sm'
      role='banner'
    >
      <div className='mx-auto flex h-16 w-full max-w-360 items-center justify-between gap-4 px-4 sm:px-6 lg:px-10'>
        <div className='flex items-center gap-8'>
          <Link
            href={session ? '/dashboard' : '/'}
            aria-label={t('dashboardAriaLabel')}
            title={t('dashboardTitle')}
            className='text-ink shrink-0'
          >
            <Wordmark className='hidden sm:inline-flex' />
            <Wordmark compact className='sm:hidden' />
          </Link>
          {session && (
            <nav aria-label={t('mainNavigation')} className='hidden md:block'>
              <ul className='flex items-center gap-1'>
                {navItems.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'font-display relative inline-flex h-16 items-center px-3 text-sm font-semibold tracking-[0.06em] uppercase transition-colors',
                          active
                            ? 'text-print after:bg-print after:absolute after:inset-x-3 after:-bottom-0.75 after:h-0.75'
                            : 'text-muted-foreground hover:text-ink',
                        )}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          )}
        </div>

        <nav
          className='flex items-center gap-1.5 md:gap-2'
          aria-label={t('loadingUserActions')}
        >
          {isPending ? (
            <div
              className='flex items-center gap-2'
              role='status'
              aria-label={t('loadingUserActions')}
            >
              <Skeleton className='size-8' />
              <Skeleton className='h-8 w-20' />
            </div>
          ) : session ? (
            <>
              <LanguageSelector />

              <Button asChild size='icon' variant='ghost' className='md:hidden'>
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

              <NotificationsDropdown />

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    className='size-9 cursor-pointer rounded-[3px] p-0'
                    aria-label={t('userMenu.ariaLabel', {
                      name: session.user.name,
                    })}
                    aria-haspopup='true'
                    aria-expanded='false'
                    title={t('userMenu.title', { name: session.user.name })}
                  >
                    <Avatar className='border-print size-9 rounded-[3px] border select-none'>
                      <AvatarFallback
                        aria-label={t('userMenu.avatarAriaLabel', {
                          name: session.user.name,
                        })}
                        className='bg-accent text-print font-display rounded-[3px] font-bold select-none'
                        title={t('userMenu.avatar', {
                          name: session.user.name,
                        })}
                      >
                        {session.user.name.charAt(0)}
                      </AvatarFallback>
                      <AvatarImage
                        src={session.user.image || ''}
                        alt={t('userMenu.profilePicture', {
                          name: session.user.name,
                        })}
                        title={t('userMenu.avatar', {
                          name: session.user.name,
                        })}
                      />
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align='end'
                  sideOffset={4}
                  className='z-60 w-[calc(100vw-2rem)] max-w-60'
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
              <LanguageSelector />

              <Button asChild variant='ghost'>
                <Link
                  href='/auth/login'
                  aria-label={t('auth.login.ariaLabel')}
                  title={t('auth.login.title')}
                >
                  {t('auth.login.label')}
                </Link>
              </Button>
              <Button asChild>
                <Link
                  href='/auth/register'
                  aria-label={t('auth.register.ariaLabel')}
                  title={t('auth.register.title')}
                >
                  {t('nav.register')}
                </Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
