'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/form';
import {
  AuthSheet,
  ErrorLine,
  FieldError,
  fieldInputClass,
  fieldLabelClass,
} from './auth-sheet';
import { useTranslations } from 'next-intl';
import { createForgotPasswordSchema } from '@/validation/schemas';

export const ForgotPasswordForm = () => {
  const router = useRouter();
  const t = useTranslations('ForgotPasswordPage.form');
  const tValidation = useTranslations('Validation');
  const tSheet = useTranslations('AuthSheet');
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
      <AuthSheet
        title={t('success.title')}
        titleId='success-title'
        description={t('success.description')}
        descriptionId='success-description'
        formName={tSheet('names.forgot')}
        number='03'
        backHref='/auth/login'
        backKey='backToLogin'
      >
        <div className='flex items-start gap-3'>
          <Icon
            icon='tabler:mail-check'
            className='text-stamp-green size-8 shrink-0'
            aria-hidden='true'
          />
          <p className='text-muted-foreground text-sm'>
            {t('success.message')}
          </p>
        </div>
        <div className='grid gap-3'>
          <Button
            onClick={() => router.push('/auth/login')}
            variant='outline'
            size='lg'
            className='w-full'
          >
            {t('success.backToLogin')}
          </Button>
          <Button
            onClick={() => {
              setIsSuccess(false);
              form.reset();
            }}
            size='lg'
            className='w-full'
          >
            {t('success.sendAnother')}
          </Button>
        </div>
      </AuthSheet>
    );
  }

  return (
    <AuthSheet
      title={t('title')}
      titleId='forgot-password-title'
      description={t('description')}
      descriptionId='forgot-password-description'
      formName={tSheet('names.forgot')}
      number='03'
      backHref='/auth/login'
      backKey='backToLogin'
      stub={
        <>
          {t('rememberPassword')}{' '}
          <Button asChild variant='link' className='h-auto p-0'>
            <Link href='/auth/login' aria-label={t('login')} title={t('login')}>
              {t('login')}
            </Link>
          </Button>
        </>
      }
    >
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-5'
          aria-labelledby='forgot-password-title'
          aria-describedby='forgot-password-description'
          noValidate
        >
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  htmlFor='forgot-password-email'
                  className={fieldLabelClass}
                >
                  {t('email')}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id='forgot-password-email'
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
            aria-label='Submit forgot password form'
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
