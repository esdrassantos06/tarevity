'use client';

import { useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { Checkbox } from '../ui/checkbox';
import { toast } from 'sonner';
import AuthButtons from './AuthButtons';
import { SignUpEmailActions } from '@/actions/sign-up-email-actions';
import { Icon } from '@iconify/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useTranslations } from 'next-intl';
import { createSignUpSchemaAlt } from '@/validation/schemas';

export const RegisterForm = () => {
  const router = useRouter();
  const t = useTranslations('RegisterPage.form');
  const tValidation = useTranslations('Validation');
  const [isPending, setIsPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const registerFormSchema = createSignUpSchemaAlt(tValidation);
  type RegisterFormValues = z.infer<typeof registerFormSchema>;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('password', data.password);
      formData.append('confirmPassword', data.confirmPassword);
      formData.append('acceptTerms', data.acceptTerms ? 'true' : 'false');

      const { error } = await SignUpEmailActions(formData);

      if (error) {
        toast.error(error);

        if (error.toLowerCase().includes('email')) {
          form.setError('email', { message: error });
        } else if (error.toLowerCase().includes('name')) {
          form.setError('name', { message: error });
        } else if (error.toLowerCase().includes('password')) {
          form.setError('password', { message: error });
        } else {
          form.setError('root', { message: error });
        }
      } else {
        toast.success(t('success'));
        router.push('/auth/login');
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
    <div className='flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
      <Card className='w-full max-w-md bg-white dark:bg-[#1d1929]' role='main'>
        <CardHeader className='space-y-1'>
          <CardTitle
            className='text-center text-2xl font-bold'
            id='register-title'
          >
            {t('title')}
          </CardTitle>
          <CardDescription className='text-center' id='register-description'>
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <AuthButtons signUp provider='github' />
          <AuthButtons signUp provider='google' />

          <div className='relative'>
            <div className='absolute inset-0 flex items-center'>
              <Separator className='w-full' />
            </div>
            <div className='relative flex justify-center text-xs uppercase'>
              <span className='text-muted-foreground px-2'>
                {t('orRegisterWith')}
              </span>
            </div>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
              aria-labelledby='register-title'
              aria-describedby='register-description'
              noValidate
            >
              <FormField
                control={form.control}
                name='name'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='register-name'>{t('name')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id='register-name'
                        placeholder={t('namePlaceholder')}
                        disabled={isPending}
                        autoComplete='name'
                        aria-required='true'
                        aria-invalid={!!form.formState.errors.name}
                        aria-describedby={
                          form.formState.errors.name ? 'name-error' : undefined
                        }
                      />
                    </FormControl>
                    <FormMessage id='name-error' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='register-email'>{t('email')}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id='register-email'
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
                    <FormLabel htmlFor='register-password'>
                      {t('password')}
                    </FormLabel>
                    <div className='relative'>
                      <FormControl>
                        <Input
                          {...field}
                          id='register-password'
                          type={showPassword ? 'text' : 'password'}
                          placeholder={t('passwordPlaceholder')}
                          disabled={isPending}
                          autoComplete='new-password'
                          aria-required='true'
                          aria-invalid={!!form.formState.errors.password}
                          aria-describedby={
                            form.formState.errors.password
                              ? 'password-error password-help'
                              : 'password-help'
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
                    <p
                      className='text-muted-foreground text-xs'
                      id='password-help'
                    >
                      {t('passwordHelp')}
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='register-confirm-password'>
                      {t('confirmPassword')}
                    </FormLabel>
                    <div className='relative'>
                      <FormControl>
                        <Input
                          {...field}
                          id='register-confirm-password'
                          type={showConfirm ? 'text' : 'password'}
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
                        onClick={() => setShowConfirm(!showConfirm)}
                        className='absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 hover:text-gray-700'
                        aria-label={
                          showConfirm
                            ? t('hideConfirmPassword')
                            : t('showConfirmPassword')
                        }
                        title={
                          showConfirm
                            ? t('hideConfirmPassword')
                            : t('showConfirmPassword')
                        }
                      >
                        <Icon
                          icon={
                            showConfirm
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

              <FormField
                control={form.control}
                name='acceptTerms'
                render={({ field }) => (
                  <FormItem className='flex flex-row items-center space-y-0 space-x-1'>
                    <FormControl>
                      <Checkbox
                        id='acceptTerms'
                        checked={field.value}
                        onCheckedChange={(checked) => {
                          if (typeof checked === 'boolean') {
                            field.onChange(checked);
                          } else {
                            field.onChange(false);
                          }
                        }}
                        disabled={isPending}
                        aria-required='true'
                        aria-invalid={!!form.formState.errors.acceptTerms}
                        aria-describedby={
                          form.formState.errors.acceptTerms
                            ? 'acceptTerms-error'
                            : undefined
                        }
                      />
                    </FormControl>
                    <div className='space-y-1 leading-none'>
                      <FormLabel htmlFor='acceptTerms' className='text-sm'>
                        {t('acceptTerms')}{' '}
                        <Link
                          href='/terms'
                          className='text-blue-600 hover:underline'
                          aria-label={t('termsOfUse')}
                          title={t('termsOfUse')}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {t('termsOfUse')}
                        </Link>{' '}
                        {t('and')}{' '}
                        <Link
                          href='/privacy'
                          className='text-blue-600 hover:underline'
                          aria-label={t('privacyPolicy')}
                          title={t('privacyPolicy')}
                          target='_blank'
                          rel='noopener noreferrer'
                        >
                          {t('privacyPolicy')}
                        </Link>
                      </FormLabel>
                      <FormMessage id='acceptTerms-error' />
                    </div>
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
                id='register-button'
                type='submit'
                disabled={isPending || !form.formState.isValid}
                className='w-full'
                aria-label='Submit registration form'
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
            {t('hasAccount')}{' '}
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
