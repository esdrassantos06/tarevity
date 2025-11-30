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
import { toast } from 'sonner';
import { useState } from 'react';
import { RequestPasswordResetAction } from '@/actions/request-password-reset-action';
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
import { createForgotPasswordSchema } from '@/validation/schemas';

export const ForgotPasswordForm = () => {
  const router = useRouter();
  const t = useTranslations('ForgotPasswordPage.form');
  const tValidation = useTranslations('Validation');
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const forgotPasswordFormSchema = createForgotPasswordSchema(tValidation);
  type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>;

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormValues) => {
    setIsPending(true);

    try {
      const formData = new FormData();
      formData.append('email', data.email);

      const { error } = await RequestPasswordResetAction(formData);

      if (error) {
        toast.error(error);

        if (error.toLowerCase().includes('email')) {
          form.setError('email', { message: error });
        } else {
          form.setError('root', { message: error });
        }
      } else {
        setIsSuccess(true);
        toast.success(t('success.message'));
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

  if (isSuccess) {
    return (
      <div className='flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
        <div className='mb-4 w-full max-w-md'>
          <BackButton href='/auth/login' translationKey='backToLogin' />
        </div>
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
                icon='mdi:email-check-outline'
                className='size-16 text-green-500'
                aria-hidden='true'
              />
            </div>
            <p className='text-muted-foreground text-center text-sm'>
              {t('success.message')}
            </p>
            <div className='space-y-2'>
              <Button
                onClick={() => router.push('/auth/login')}
                variant='outline'
                className='w-full'
              >
                {t('success.backToLogin')}
              </Button>
              <Button
                onClick={() => {
                  setIsSuccess(false);
                  form.reset();
                }}
                className='w-full'
              >
                {t('success.sendAnother')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
      <div className='mb-4 w-full max-w-md'>
        <BackButton href='/auth/login' translationKey='backToLogin' />
      </div>
      <Card className='w-full max-w-md bg-white dark:bg-[#1d1929]' role='main'>
        <CardHeader className='space-y-1'>
          <CardTitle
            className='text-center text-2xl font-bold'
            id='forgot-password-title'
          >
            {t('title')}
          </CardTitle>
          <CardDescription
            className='text-center'
            id='forgot-password-description'
          >
            {t('description')}
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
              aria-labelledby='forgot-password-title'
              aria-describedby='forgot-password-description'
              noValidate
            >
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='forgot-password-email'>
                      {t('email')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id='forgot-password-email'
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
                aria-label='Submit forgot password form'
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
