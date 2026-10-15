'use client';

import { Button, buttonVariants } from '@/components/ui/button';
import { useFormatter, useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { authClient } from '@/lib/auth-client';
import { clearUserDrafts } from '@/lib/drafts';
import { Icon } from '@iconify/react';
import { Link } from '@/i18n/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTheme } from 'next-themes';
import { useIsClient } from '@/hooks/use-is-client';
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
import { lazy, Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const AdminPanel = lazy(() =>
  import('@/components/admin/admin-panel').then((mod) => ({
    default: mod.AdminPanel,
  })),
);

export function SettingsClient({ session }: { session: SessionWithUser }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();
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
        clearUserDrafts(session.user.id);
        router.push('/');
      }
    } catch (err) {
      console.error('Error deleting account:', err);
    }
  };

  if (!session) {
    router.push('/auth/login');
    return null;
  }

  const isAdmin = session.user?.role === 'admin';

  const tabs = [
    {
      label: t('tabs.appearance'),
      value: 'appearance',
      icon: 'tabler:palette',
    },
    {
      label: t('tabs.account'),
      value: 'account',
      icon: 'tabler:user',
    },
  ];

  if (isAdmin) {
    tabs.push({
      label: t('tabs.admin'),
      value: 'admin',
      icon: 'tabler:shield',
    });
  }

  const themeOptions = [
    { value: 'light', label: tAppearance('light') },
    { value: 'dark', label: tAppearance('dark') },
    { value: 'system', label: tAppearance('system') },
  ];

  const infoRows = [
    { label: tAccount('name'), value: session?.user.name },
    { label: tAccount('email'), value: session?.user.email },
    {
      label: tAccount('createdAt'),
      value: session?.user.createdAt
        ? format.dateTime(new Date(session.user.createdAt), {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
          })
        : '-',
    },
  ];

  return (
    <main
      id='main-content'
      role='main'
      className='mx-auto flex w-full max-w-360 flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10'
    >
      <header className='flex flex-col gap-1'>
        <h1
          className='font-display text-[clamp(2rem,3.4vw,3rem)] leading-none font-extrabold'
          style={{ fontStretch: '80%' }}
        >
          {t('title')}
        </h1>
        <p className='typed text-muted-foreground text-sm'>
          {session.user.email}
        </p>
      </header>

      <Tabs defaultValue='appearance' className='sheet gap-0 rounded-[3px]'>
        <nav
          className='overflow-x-auto px-4 pt-2 sm:px-6'
          aria-label={t('navigation.ariaLabel')}
        >
          <TabsList className='w-full'>
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className='flex-none'
              >
                <Icon icon={tab.icon} aria-hidden='true' />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </nav>

        <TabsContent
          value='appearance'
          className='flex min-h-125 flex-col p-4 sm:p-6'
          role='tabpanel'
          aria-labelledby='appearance-tab'
        >
          <header className='border-rule flex flex-col gap-1 border-b pb-4'>
            <h2 className='font-display text-lg font-bold'>
              {tAppearance('title')}
            </h2>
            <p className='text-muted-foreground text-sm'>
              {tAppearance('description')}
            </p>
          </header>

          <section
            aria-labelledby='theme-selection'
            className='flex flex-col gap-3 py-5'
          >
            <h3 id='theme-selection' className='field-label'>
              {tAppearance('theme')}
            </h3>
            <div
              role='radiogroup'
              aria-labelledby='theme-selection'
              className='flex flex-col gap-3 sm:flex-row sm:gap-8'
            >
              {themeOptions.map((option) => {
                const checked = isClient && theme === option.value;
                return (
                  <label
                    key={option.value}
                    className='group flex cursor-pointer items-center gap-2.5'
                  >
                    <input
                      type='radio'
                      name='theme'
                      value={option.value}
                      checked={checked}
                      onChange={() => setTheme(option.value)}
                      className='peer sr-only'
                    />
                    <span
                      className={cn(
                        'border-print peer-focus-visible:outline-ring flex size-5 items-center justify-center rounded-[2px] border-[1.5px] peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2',
                        checked && 'bg-print text-primary-foreground',
                      )}
                      aria-hidden='true'
                    >
                      {checked && (
                        <Icon icon='tabler:check' className='size-3.5' />
                      )}
                    </span>
                    <span className='group-hover:text-print text-sm font-medium'>
                      {option.label}
                    </span>
                  </label>
                );
              })}
            </div>
            <p className='text-muted-foreground max-w-prose text-sm'>
              {tAppearance('themeDescription')}
            </p>
          </section>
        </TabsContent>

        <TabsContent
          value='account'
          className='flex min-h-125 flex-col p-4 sm:p-6'
          role='tabpanel'
          aria-labelledby='account-tab'
        >
          <header className='border-rule flex flex-col gap-1 border-b pb-4'>
            <h2 className='font-display text-lg font-bold'>
              {tAccount('title')}
            </h2>
            <p className='text-muted-foreground text-sm'>
              {tAccount('description')}
            </p>
          </header>

          <section
            aria-labelledby='basic-info'
            className='border-rule flex flex-col gap-2 border-b py-5'
          >
            <h3 id='basic-info' className='field-label'>
              {tAccount('basicInfo')}
            </h3>
            <dl className='flex flex-col'>
              {infoRows.map((row) => (
                <div
                  key={row.label}
                  className='border-rule grid grid-cols-1 gap-1 border-b py-2.5 last:border-b-0 sm:grid-cols-[12rem_1fr] sm:items-baseline sm:gap-4'
                >
                  <dt className='text-muted-foreground text-xs font-semibold tracking-wide uppercase'>
                    {row.label}
                  </dt>
                  <dd className='typed min-w-0 text-sm wrap-break-word'>
                    {row.value}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <section
            className='flex flex-col gap-3 py-5'
            aria-labelledby='account-management'
          >
            <h3 id='account-management' className='field-label'>
              {tAccount('management')}
            </h3>
            <Button asChild variant='outline' size='sm' className='w-fit'>
              <Link href={'/profile'}>
                <Icon icon='tabler:pencil' aria-hidden='true' />
                {tAccount('editProfile')}
              </Link>
            </Button>
          </section>

          <section
            className='border-stamp-red flex flex-col gap-3 rounded-[3px] border p-4 sm:flex-row sm:items-center sm:justify-between'
            aria-labelledby='danger-zone'
          >
            <div className='flex flex-col gap-1'>
              <h3 id='danger-zone' className='field-label text-stamp-red'>
                {tAccount('dangerZone')}
              </h3>
              <p className='text-muted-foreground text-sm'>
                {tAccount('dangerHint')}
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant='destructive' size='sm' className='w-fit'>
                  <Icon icon='tabler:trash' aria-hidden='true' />
                  {tAccount('deleteAccount')}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{tDeleteDialog('title')}</AlertDialogTitle>
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
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className={buttonVariants({ variant: 'destructive' })}
                  >
                    {tDeleteDialog('confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </section>
        </TabsContent>

        {isAdmin && (
          <TabsContent
            value='admin'
            className='flex min-h-125 flex-col gap-6 p-4 sm:p-6'
            role='tabpanel'
            aria-labelledby='admin-tab'
          >
            <Suspense
              fallback={
                <div className='flex flex-col gap-4'>
                  <Skeleton className='h-10 w-full' />
                  <Skeleton className='h-64 w-full' />
                </div>
              }
            >
              <AdminPanel />
            </Suspense>
          </TabsContent>
        )}
      </Tabs>
    </main>
  );
}
