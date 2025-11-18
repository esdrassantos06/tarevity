'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { ResetPasswordAction } from '@/actions/reset-password-action';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Icon } from '@iconify/react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useTranslations } from 'next-intl';
import { createResetPasswordSchemaAlt } from '@/validation/schemas';

export const ResetPasswordForm = () => {
  const router = useRouter();
  const t = useTranslations('ResetPasswordPage.form');
  const tValidation = useTranslations('Validation');
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPasswordFormSchema = createResetPasswordSchemaAlt(tValidation);
  type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const errorParam = searchParams.get('error');

    if (errorParam === 'INVALID_TOKEN') {
      toast.error(t('error.invalidToken'));
    }

    setToken(tokenParam);
  }, [searchParams, t]);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordFormSchema),
    defaultValues: {
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      toast.error(t('error.noToken'));
      return;
    }

    setIsPending(true);

    try {
      const formData = new FormData();
      formData.append('newPassword', data.newPassword);
      formData.append('confirmPassword', data.confirmPassword);
      formData.append('token', token);

      const { error } = await ResetPasswordAction(formData);

      if (error) {
        toast.error(error);

        if (error.toLowerCase().includes('password')) {
          if (error.toLowerCase().includes('match')) {
            form.setError('confirmPassword', { message: error });
          } else {
            form.setError('newPassword', { message: error });
          }
        } else if (error.toLowerCase().includes('token')) {
          form.setError('root', { message: error });
        } else {
          form.setError('root', { message: error });
        }
      } else {
        setIsSuccess(true);
        toast.success(t('success.message'));
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } catch {
      toast.error(t('errorGeneral'));
      form.setError('root', {
        message: t('errorGeneral'),
      });
    } finally {
      setIsPending(false);
    }
  };

  if (isSuccess) {
    return (
      <div className='flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
        <Card
          className='w-full max-w-md bg-white dark:bg-[#1d1929]'
          role='main'
        >
          <CardHeader className='space-y-1'>
            <CardTitle
              className='text-center text-2xl font-bold'
              id='success-title'
            >
              {t('success.title')}
            </CardTitle>
            <CardDescription className='text-center' id='success-description'>
              {t('success.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-center'>
              <Icon
                icon='mdi:check-circle-outline'
                className='size-16 text-green-500'
                aria-hidden='true'
              />
            </div>
            <p className='text-muted-foreground text-center text-sm'>
              {t('success.message')}
            </p>
            <Button
              onClick={() => router.push('/auth/login')}
              className='w-full'
            >
              {t('success.goToLogin')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token) {
    return (
      <div className='flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
        <Card
          className='w-full max-w-md bg-white dark:bg-[#1d1929]'
          role='main'
        >
          <CardHeader className='space-y-1'>
            <CardTitle
              className='text-center text-2xl font-bold text-red-600'
              id='error-title'
            >
              {t('error.title')}
            </CardTitle>
            <CardDescription className='text-center' id='error-description'>
              {t('error.description')}
            </CardDescription>
          </CardHeader>
          <CardContent className='space-y-4'>
            <div className='flex justify-center'>
              <Icon
                icon='mdi:alert-circle-outline'
                className='size-16 text-red-600'
                aria-hidden='true'
              />
            </div>
            <p className='text-muted-foreground text-center text-sm'>
              {t('error.message')}
            </p>
            <div className='space-y-2'>
              <Button
                onClick={() => router.push('/auth/forgot-password')}
                className='w-full'
              >
                {t('error.requestNew')}
              </Button>
              <Button
                onClick={() => router.push('/auth/login')}
                variant='outline'
                className='w-full'
              >
                {t('error.backToLogin')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
      <Card className='w-full max-w-md bg-white dark:bg-[#1d1929]' role='main'>
        <CardHeader className='space-y-1'>
          <CardTitle
            className='text-center text-2xl font-bold'
            id='reset-password-title'
          >
            {t('title')}
          </CardTitle>
          <CardDescription
            className='text-center'
            id='reset-password-description'
          >
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
              aria-labelledby='reset-password-title'
              aria-describedby='reset-password-description'
              noValidate
            >
              <FormField
                control={form.control}
                name='newPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='reset-new-password'>
                      {t('newPassword')}
                    </FormLabel>
                    <div className='relative'>
                      <FormControl>
                        <Input
                          {...field}
                          id='reset-new-password'
                          type={showNewPassword ? 'text' : 'password'}
                          placeholder={t('newPasswordPlaceholder')}
                          disabled={isPending}
                          autoComplete='new-password'
                          aria-required='true'
                          aria-invalid={!!form.formState.errors.newPassword}
                          aria-describedby={
                            form.formState.errors.newPassword
                              ? 'new-password-error'
                              : undefined
                          }
                        />
                      </FormControl>
                      <button
                        type='button'
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                        aria-label={
                          showNewPassword
                            ? t('hidePassword')
                            : t('showPassword')
                        }
                        title={
                          showNewPassword
                            ? t('hidePassword')
                            : t('showPassword')
                        }
                      >
                        <Icon
                          icon={
                            showNewPassword
                              ? 'mdi:eye-off-outline'
                              : 'mdi:eye-outline'
                          }
                          className='size-5'
                          aria-hidden='true'
                        />
                      </button>
                    </div>
                    <FormMessage id='new-password-error' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='reset-confirm-password'>
                      {t('confirmPassword')}
                    </FormLabel>
                    <div className='relative'>
                      <FormControl>
                        <Input
                          {...field}
                          id='reset-confirm-password'
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder={t('confirmPasswordPlaceholder')}
                          disabled={isPending}
                          autoComplete='new-password'
                          aria-required='true'
                          aria-invalid={!!form.formState.errors.confirmPassword}
                          aria-describedby={
                            form.formState.errors.confirmPassword
                              ? 'confirm-password-error'
                              : undefined
                          }
                        />
                      </FormControl>
                      <button
                        type='button'
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                        aria-label={
                          showConfirmPassword
                            ? t('hidePassword')
                            : t('showPassword')
                        }
                        title={
                          showConfirmPassword
                            ? t('hidePassword')
                            : t('showPassword')
                        }
                      >
                        <Icon
                          icon={
                            showConfirmPassword
                              ? 'mdi:eye-off-outline'
                              : 'mdi:eye-outline'
                          }
                          className='size-5'
                          aria-hidden='true'
                        />
                      </button>
                    </div>
                    <FormMessage id='confirm-password-error' />
                  </FormItem>
                )}
              />

              {form.formState.errors.root && (
                <div
                  className='text-center text-sm text-red-600'
                  role='alert'
                  aria-live='polite'
                  id='form-error'
                >
                  {form.formState.errors.root.message}
                </div>
              )}

              <Button
                disabled={isPending}
                type='submit'
                className='w-full'
                aria-label='Submit reset password form'
              >
                {isPending ? (
                  <>
                    <Icon
                      icon='ri:loader-fill'
                      className='mr-2 animate-spin'
                      aria-hidden='true'
                    />
                    <span aria-live='polite'>{t('submitting')}</span>
                  </>
                ) : (
                  <>{t('submit')}</>
                )}
              </Button>
            </form>
          </Form>

          <div className='text-center text-sm'>
            {t('rememberPassword')}{' '}
            <Link
              href='/auth/login'
              className='font-medium text-blue-600 hover:underline'
              aria-label={t('login')}
              title={t('login')}
            >
              {t('login')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
