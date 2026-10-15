'use client';

import { authClient } from '@/lib/auth-client';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import AuthButtons from './auth-buttons';
import {
  AuthSheet,
  ErrorLine,
  FieldError,
  RevealToggle,
  SheetDivider,
  fieldInputClass,
  fieldLabelClass,
} from './auth-sheet';
import { cn } from '@/lib/utils';
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
} from '@/components/ui/form';
import { useTranslations } from 'next-intl';
import { createSignInSchemaAlt } from '@/validation/schemas';

export const LoginForm = () => {
  const router = useRouter();
  const t = useTranslations('LoginPage.form');
  const tValidation = useTranslations('Validation');
  const tSheet = useTranslations('AuthSheet');
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const loginFormSchema = createSignInSchemaAlt(tValidation);
  type LoginFormValues = z.infer<typeof loginFormSchema>;

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
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
        authClient.$store.notify('$sessionSignal');
        router.refresh();
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
    <AuthSheet
      title={t('title')}
      titleId='login-title'
      description={t('description')}
      descriptionId='login-description'
      formName={tSheet('names.login')}
      number='01'
      backHref='/'
      backKey='backToHome'
      stub={
        <>
          {t('noAccount')}{' '}
          <Button asChild variant='link' className='h-auto p-0'>
            <Link
              href='/auth/register'
              aria-label={t('register')}
              title={t('register')}
            >
              {t('register')}
            </Link>
          </Button>
        </>
      }
    >
      <div className='grid grid-cols-2 gap-3'>
        <AuthButtons provider='github' />
        <AuthButtons provider='google' />
      </div>

      <SheetDivider>{t('orContinueWith')}</SheetDivider>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-5'
          aria-labelledby='login-title'
          aria-describedby='login-description'
          noValidate
        >
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='login-email' className={fieldLabelClass}>
                  {t('email')}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id='login-email'
                    type='email'
                    className={fieldInputClass}
                    placeholder={t('emailPlaceholder')}
                    disabled={isPending}
                    autoComplete='email'
                    aria-required='true'
                    aria-invalid={!!form.formState.errors.email}
                    aria-describedby={
                      form.formState.errors.email ? 'email-error' : undefined
                    }
                  />
                </FormControl>
                <FieldError id='email-error' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='login-password' className={fieldLabelClass}>
                  {t('password')}
                </FormLabel>
                <div className='relative'>
                  <FormControl>
                    <Input
                      {...field}
                      id='login-password'
                      type={showPassword ? 'text' : 'password'}
                      className={cn(fieldInputClass, 'pr-11')}
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
                  <RevealToggle
                    shown={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                    showLabel={t('showPassword')}
                    hideLabel={t('hidePassword')}
                  />
                </div>
                <FieldError id='password-error' />
              </FormItem>
            )}
          />

          <div className='flex items-center justify-between gap-4'>
            <FormField
              control={form.control}
              name='rememberMe'
              render={({ field }) => (
                <FormItem className='flex items-center gap-2'>
                  <FormControl>
                    <input
                      id='rememberMe'
                      type='checkbox'
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                      disabled={isPending}
                      className='accent-print size-4 rounded-[2px]'
                      aria-label={t('rememberMe')}
                    />
                  </FormControl>
                  <FormLabel htmlFor='rememberMe' className='font-normal'>
                    {t('rememberMe')}
                  </FormLabel>
                </FormItem>
              )}
            />

            <Button asChild variant='link' className='h-auto p-0 text-sm'>
              <Link
                href='/auth/forgot-password'
                aria-label={t('forgotPassword')}
                title={t('forgotPassword')}
              >
                {t('forgotPassword')}
              </Link>
            </Button>
          </div>

          {form.formState.errors.root && (
            <ErrorLine role='alert' aria-live='polite' id='form-error'>
              {form.formState.errors.root.message}
            </ErrorLine>
          )}

          <Button
            disabled={isPending}
            type='submit'
            size='lg'
            className='w-full'
            aria-label='Submit login form'
          >
            {isPending ? (
              <>
                <Icon
                  icon='tabler:loader-2'
                  className='animate-spin'
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
    </AuthSheet>
  );
};
