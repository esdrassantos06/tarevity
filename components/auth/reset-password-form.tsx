'use client';

import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '@/components/ui/button';
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
} from '@/components/ui/form';
import {
  AuthSheet,
  ErrorLine,
  FieldError,
  RevealToggle,
  fieldInputClass,
  fieldLabelClass,
} from './auth-sheet';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';
import { createResetPasswordSchemaAlt } from '@/validation/schemas';

export const ResetPasswordForm = () => {
  const router = useRouter();
  const t = useTranslations('ResetPasswordPage.form');
  const tValidation = useTranslations('Validation');
  const tSheet = useTranslations('AuthSheet');
  const searchParams = useSearchParams();
  const [isPending, setIsPending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPasswordFormSchema = createResetPasswordSchemaAlt(tValidation);
  type ResetPasswordFormValues = z.infer<typeof resetPasswordFormSchema>;

  const token = searchParams.get('token');

  useEffect(() => {
    if (searchParams.get('error') === 'INVALID_TOKEN') {
      toast.error(t('error.invalidToken'));
    }
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
      <AuthSheet
        title={t('success.title')}
        titleId='success-title'
        description={t('success.description')}
        descriptionId='success-description'
        formName={tSheet('names.reset')}
        number='04'
        backHref='/auth/login'
        backKey='backToLogin'
      >
        <div className='flex items-start gap-3'>
          <Icon
            icon='tabler:circle-check'
            className='text-stamp-green size-8 shrink-0'
            aria-hidden='true'
          />
          <p className='text-muted-foreground text-sm'>
            {t('success.message')}
          </p>
        </div>
        <Button
          onClick={() => router.push('/auth/login')}
          size='lg'
          className='w-full'
        >
          {t('success.goToLogin')}
        </Button>
      </AuthSheet>
    );
  }

  if (!token) {
    return (
      <AuthSheet
        title={t('error.title')}
        titleId='error-title'
        description={t('error.description')}
        descriptionId='error-description'
        formName={tSheet('names.reset')}
        number='04'
        backHref='/auth/login'
        backKey='backToLogin'
      >
        <ErrorLine>{t('error.message')}</ErrorLine>
        <div className='grid gap-3'>
          <Button
            onClick={() => router.push('/auth/forgot-password')}
            size='lg'
            className='w-full'
          >
            {t('error.requestNew')}
          </Button>
          <Button
            onClick={() => router.push('/auth/login')}
            variant='outline'
            size='lg'
            className='w-full'
          >
            {t('error.backToLogin')}
          </Button>
        </div>
      </AuthSheet>
    );
  }

  return (
    <AuthSheet
      title={t('title')}
      titleId='reset-password-title'
      description={t('description')}
      descriptionId='reset-password-description'
      formName={tSheet('names.reset')}
      number='04'
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
          aria-labelledby='reset-password-title'
          aria-describedby='reset-password-description'
          noValidate
        >
          <FormField
            control={form.control}
            name='newPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  htmlFor='reset-new-password'
                  className={fieldLabelClass}
                >
                  {t('newPassword')}
                </FormLabel>
                <div className='relative'>
                  <FormControl>
                    <Input
                      {...field}
                      id='reset-new-password'
                      type={showNewPassword ? 'text' : 'password'}
                      className={cn(fieldInputClass, 'pr-11')}
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
                  <RevealToggle
                    shown={showNewPassword}
                    onToggle={() => setShowNewPassword(!showNewPassword)}
                    showLabel={t('showPassword')}
                    hideLabel={t('hidePassword')}
                  />
                </div>
                <FieldError id='new-password-error' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel
                  htmlFor='reset-confirm-password'
                  className={fieldLabelClass}
                >
                  {t('confirmPassword')}
                </FormLabel>
                <div className='relative'>
                  <FormControl>
                    <Input
                      {...field}
                      id='reset-confirm-password'
                      type={showConfirmPassword ? 'text' : 'password'}
                      className={cn(fieldInputClass, 'pr-11')}
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
                  <RevealToggle
                    shown={showConfirmPassword}
                    onToggle={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    showLabel={t('showPassword')}
                    hideLabel={t('hidePassword')}
                  />
                </div>
                <FieldError id='confirm-password-error' />
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
            aria-label='Submit reset password form'
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
