'use client';

import { Button } from '@/components/ui/button';
import { useFormatter, useTranslations } from 'next-intl';
import { authClient } from '@/lib/auth-client';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { APIError } from 'better-auth';
import { SessionWithUser } from '@/lib/auth';

import { useRouter } from '@/i18n/navigation';
import { AdminPanel } from '@/components/admin/admin-panel';

export function SettingsClient({ session }: { session: SessionWithUser }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const format = useFormatter();
  const t = useTranslations('SettingsPage');
  const tAppearance = useTranslations('SettingsPage.appearance');
  const tAccount = useTranslations('SettingsPage.account');
  const tDeleteDialog = useTranslations('SettingsPage.account.deleteDialog');
  const tServerActions = useTranslations('ServerActions');

  const handleDeleteAccount = async () => {
    const promise = authClient.deleteUser();

    toast.promise(promise, {
      loading: tDeleteDialog('loading'),
      success: tDeleteDialog('success'),
      error: (err: APIError) =>
        tDeleteDialog('error', {
          error: err?.message || tServerActions('unknownError'),
        }),
    });

    try {
      const { error } = await promise;
      if (!error) {
        router.push('/');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  };

  if (typeof window === 'undefined') return null;

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  const isAdmin = session.user?.role === 'admin';

  const tabs = [
    {
      label: t('tabs.appearance'),
      value: 'appearance',
      icon: 'mdi:palette',
    },
    {
      label: t('tabs.account'),
      value: 'account',
      icon: 'mdi:account',
    },
  ];

  if (isAdmin) {
    tabs.push({
      label: t('tabs.admin'),
      value: 'admin',
      icon: 'mdi:shield-crown',
    });
  }

  return (
    <main
      id='main-content'
      role='main'
      className='flex flex-1 flex-col items-center justify-start gap-10 px-4 py-20 sm:px-6 lg:px-8'
    >
      <section className='flex w-full max-w-7xl flex-col items-center justify-center p-6'>
        <h1 className='mb-2 text-start text-3xl font-bold text-gray-900 md:text-4xl dark:text-white'>
          {t('title')}
        </h1>
      </section>

      <Tabs
        defaultValue='appearance'
        orientation='vertical'
        className='container mb-8 w-full max-w-7xl rounded-lg bg-white shadow-sm dark:bg-[#1d1929]'
      >
        <div className='flex flex-col md:flex-row'>
          <nav
            className='w-full border-b border-gray-200 pb-0 md:w-56 md:border-r md:border-b-0 md:pb-6 md:dark:border-gray-700'
            aria-label={t('navigation.ariaLabel')}
          >
            <TabsList className='flex h-auto w-full flex-row gap-1 overflow-x-auto border-0 bg-transparent p-2 md:flex-col md:items-start'>
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className='relative h-auto min-w-0 flex-1 justify-center rounded-md px-3 py-2.5 text-sm transition-all duration-200 hover:bg-gray-100 data-[state=active]:rounded-b-none data-[state=active]:border-b-2 data-[state=active]:border-b-blue-500 data-[state=active]:bg-blue-50 md:min-w-full md:justify-start md:px-4 data-[state=active]:md:rounded-l-md data-[state=active]:md:rounded-r-md data-[state=active]:md:border-b-0 data-[state=active]:md:border-l-4 data-[state=active]:md:border-l-blue-500 data-[state=active]:md:pl-3 dark:hover:bg-gray-800/50 data-[state=active]:dark:bg-blue-900/30'
                >
                  <Icon
                    icon={tab.icon}
                    className='mr-2 size-4 flex-shrink-0 md:mr-3 md:size-5'
                    aria-hidden='true'
                  />
                  <span className='truncate text-xs whitespace-nowrap sm:text-sm'>
                    {tab.label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </nav>

          <section className='flex-1 overflow-auto p-4 pb-6 sm:p-6'>
            <TabsContent
              value='appearance'
              className='mt-0 flex min-h-[500px] flex-col gap-6'
              role='tabpanel'
              aria-labelledby='appearance-tab'
            >
              <header>
                <h2 className='text-lg font-bold'>{tAppearance('title')}</h2>
                <p className='text-muted-foreground text-sm'>
                  {tAppearance('description')}
                </p>
              </header>

              <section aria-labelledby='theme-selection'>
                <h3 id='theme-selection' className='text-sm font-medium'>
                  {tAppearance('theme')}
                </h3>

                <div className='mt-2 flex flex-col gap-3 sm:flex-row'>
                  <Button
                    size='lg'
                    variant={theme === 'light' ? 'default' : 'outline'}
                    className={`flex items-center justify-center ${
                      theme === 'light'
                        ? 'border border-blue-500 bg-transparent text-black hover:bg-transparent dark:text-white'
                        : ''
                    }`}
                    onClick={() => setTheme('light')}
                  >
                    <Icon
                      icon='mdi:weather-sunny'
                      className={`mr-2 size-5 ${
                        theme === 'light' ? 'text-blue-500' : ''
                      }`}
                      aria-hidden='true'
                    />
                    {tAppearance('light')}
                  </Button>

                  <Button
                    size='lg'
                    variant={theme === 'dark' ? 'default' : 'outline'}
                    className={`flex items-center justify-center ${
                      theme === 'dark'
                        ? 'border border-blue-500 bg-transparent text-black hover:bg-transparent dark:text-white'
                        : ''
                    }`}
                    onClick={() => setTheme('dark')}
                  >
                    <Icon
                      icon='mdi:weather-night'
                      className={`mr-2 size-5 ${
                        theme === 'dark' ? 'text-blue-500' : ''
                      }`}
                      aria-hidden='true'
                    />
                    {tAppearance('dark')}
                  </Button>

                  <Button
                    size='lg'
                    variant={theme === 'system' ? 'default' : 'outline'}
                    className={`flex items-center justify-center ${
                      theme === 'system'
                        ? 'border border-blue-500 bg-transparent text-black hover:bg-transparent dark:text-white'
                        : ''
                    }`}
                    onClick={() => setTheme('system')}
                  >
                    <Icon
                      icon='mdi:monitor'
                      className={`mr-2 size-5 ${
                        theme === 'system' ? 'text-blue-500' : ''
                      }`}
                      aria-hidden='true'
                    />
                    {tAppearance('system')}
                  </Button>
                </div>

                <p className='text-muted-foreground mt-4 text-sm'>
                  {tAppearance('themeDescription')}
                </p>
              </section>
            </TabsContent>

            <TabsContent
              value='account'
              className='mt-0 flex min-h-[500px] flex-col gap-6'
              role='tabpanel'
              aria-labelledby='account-tab'
            >
              <header>
                <h2 className='text-lg font-bold'>{tAccount('title')}</h2>
                <p className='text-muted-foreground text-sm'>
                  {tAccount('description')}
                </p>
              </header>

              <section aria-labelledby='basic-info'>
                <h3 id='basic-info' className='mb-2 font-semibold'>
                  {tAccount('basicInfo')}
                </h3>
                <dl className='mb-4 flex flex-col'>
                  <dt className='text-muted-foreground text-sm'>
                    {tAccount('name')}
                  </dt>
                  <dd className='text-foreground text-sm'>
                    {session?.user.name}
                  </dd>
                </dl>
                <dl className='mb-4 flex flex-col'>
                  <dt className='text-muted-foreground text-sm'>
                    {tAccount('email')}
                  </dt>
                  <dd className='text-foreground text-sm'>
                    {session?.user.email}
                  </dd>
                </dl>
                <dl>
                  <dt className='text-muted-foreground text-sm'>
                    {tAccount('createdAt')}
                  </dt>
                  <dd className='text-foreground text-sm'>
                    {session?.user.createdAt
                      ? format.dateTime(new Date(session.user.createdAt), {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: 'numeric',
                        })
                      : '—'}
                  </dd>
                </dl>
              </section>
              <Separator />

              <section
                className='flex flex-col gap-4'
                aria-labelledby='account-management'
              >
                <div className='flex'>
                  <h3 className='font-semibold'>{tAccount('management')}</h3>
                </div>
                <div className='flex flex-col items-start gap-4'>
                  <Button
                    asChild
                    variant={'ghost'}
                    size={'sm'}
                    className='text-blue-accent hover:text-blue-accent'
                  >
                    <Link href={'/profile'} className='text-sm font-semibold'>
                      {tAccount('editProfile')}
                    </Link>
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant={'destructive'}
                        size={'sm'}
                        className='text-sm font-semibold'
                      >
                        {tAccount('deleteAccount')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className='dark:bg-[#1d1929]'>
                      <AlertDialogTitle className='sr-only'>
                        {tDeleteDialog('title')}
                      </AlertDialogTitle>

                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {tDeleteDialog('title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {tDeleteDialog.rich('description', {
                            strong: (chunks) => <strong>{chunks}</strong>,
                          })}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {tDeleteDialog('cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount}>
                          {tDeleteDialog('confirm')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </section>
            </TabsContent>

            {isAdmin && (
              <TabsContent
                value='admin'
                className='mt-0 flex min-h-[500px] flex-col gap-6'
                role='tabpanel'
                aria-labelledby='admin-tab'
              >
                <AdminPanel />
              </TabsContent>
            )}
          </section>
        </div>
      </Tabs>
    </main>
  );
}
