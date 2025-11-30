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
import { BackButton } from '@/components/back-button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import AuthButtons from './AuthButtons';
import { useState } from 'react';
import { SignInEmailActions } from '@/actions/sign-in-email-actions';
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
import { createSignInSchemaAlt } from '@/validation/schemas';

export const LoginForm = () => {
  const router = useRouter();
  const t = useTranslations('LoginPage.form');
  const tValidation = useTranslations('Validation');
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginFormSchema = createSignInSchemaAlt(tValidation);
  type LoginFormValues = z.infer<typeof loginFormSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('rememberMe', String(data.rememberMe ?? false));

      const { error } = await SignInEmailActions(formData);

      if (error) {
        toast.error(error);

        if (error.toLowerCase().includes('email')) {
          form.setError('email', { message: error });
        } else if (error.toLowerCase().includes('password')) {
          form.setError('password', { message: error });
        } else {
          form.setError('root', { message: error });
        }
      } else {
        toast.success(t('success'));
        router.push('/dashboard');
      }
    } catch {
      toast.error(t('error'));
      form.setError('root', {
        message: t('error'),
      });
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mb-4 w-full max-w-md'>
        <BackButton href='/' translationKey='backToHome' />
      </div>
      <Card className='w-full max-w-md bg-white dark:bg-[#1d1929]' role='main'>
        <CardHeader className='space-y-1'>
          <CardTitle
            className='text-center text-2xl font-bold'
            id='login-title'
          >
            {t('title')}
          </CardTitle>
          <CardDescription className='text-center' id='login-description'>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <AuthButtons provider='github' />
          <AuthButtons provider='google' />

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <Separator className='w-full' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='text-muted-foreground px-2'>
                {t('orContinueWith')}
              </span>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
              aria-labelledby='login-title'
              aria-describedby='login-description'
              noValidate
            >
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='login-email'>{t('email')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id='login-email'
                        type='email'
                        placeholder={t('emailPlaceholder')}
                        disabled={isPending}
                        autoComplete='email'
                        aria-required='true'
                        aria-invalid={!!form.formState.errors.email}
                        aria-describedby={
                          form.formState.errors.email
                            ? 'email-error'
                            : undefined
                        }
                      />
                    </FormControl>
                    <FormMessage id='email-error' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='login-password'>
                      {t('password')}
                    </FormLabel>
                    <div className='relative'>
                      <FormControl>
                        <Input
                          {...field}
                          id='login-password'
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('passwordPlaceholder')}
                          disabled={isPending}
                          autoComplete='current-password'
                          aria-required='true'
                          aria-invalid={!!form.formState.errors.password}
                          aria-describedby={
                            form.formState.errors.password
                              ? 'password-error'
                              : undefined
                          }
                        />
                      </FormControl>

                      <button
                        type='button'
                        onClick={() => setShowPassword(!showPassword)}
                        className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                        aria-label={
                          showPassword ? t('hidePassword') : t('showPassword')
                        }
                        title={
                          showPassword ? t('hidePassword') : t('showPassword')
                        }
                      >
                        <Icon
                          icon={
                            showPassword
                              ? 'mdi:eye-off-outline'
                              : 'mdi:eye-outline'
                          }
                          className='size-5'
                          aria-hidden='true'
                        />
                      </button>
                    </div>
                    <FormMessage id='password-error' />
                  </FormItem>
                )}
              />

              <div className='flex items-center justify-between'>
                <FormField
                  control={form.control}
                  name='rememberMe'
                  render={({ field }) => (
                    <FormItem className='flex items-center'>
                      <FormControl>
                        <input
                          id='rememberMe'
                          type='checkbox'
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                          disabled={isPending}
                          className='size-4 accent-blue-600'
                          aria-label={t('rememberMe')}
                        />
                      </FormControl>
                      <FormLabel htmlFor='rememberMe'>
                        {t('rememberMe')}
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <div className='flex items-center justify-between'>
                  <Link
                    href='/auth/forgot-password'
                    className='text-sm text-blue-600 hover:underline'
                    aria-label={t('forgotPassword')}
                    title={t('forgotPassword')}
                  >
                    {t('forgotPassword')}
                  </Link>
                </div>
              </div>

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
                aria-label='Submit login form'
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
            {t('noAccount')}{' '}
            <Link
              href='/auth/register'
              className='font-medium text-blue-600 hover:underline'
              aria-label={t('register')}
              title={t('register')}
            >
              {t('register')}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
