'use client';

import { authClient } from '@/lib/auth-client';
import { useState } from 'react';
import { Link, useRouter } from '@/i18n/navigation';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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
} from '@/components/ui/form';
import { useTranslations } from 'next-intl';
import { createSignUpSchemaAlt } from '@/validation/schemas';

export const RegisterForm = () => {
  const router = useRouter();
  const t = useTranslations('RegisterPage.form');
  const tValidation = useTranslations('Validation');
  const tSheet = useTranslations('AuthSheet');
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
      titleId='register-title'
      description={t('description')}
      descriptionId='register-description'
      formName={tSheet('names.register')}
      number='02'
      backHref='/'
      backKey='backToHome'
      stub={
        <>
          {t('hasAccount')}{' '}
          <Button asChild variant='link' className='h-auto p-0'>
            <Link href='/auth/login' aria-label={t('login')} title={t('login')}>
              {t('login')}
            </Link>
          </Button>
        </>
      }
    >
      <div className='grid grid-cols-2 gap-3'>
        <AuthButtons signUp provider='github' />
        <AuthButtons signUp provider='google' />
      </div>

      <SheetDivider>{t('orRegisterWith')}</SheetDivider>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className='space-y-5'
          aria-labelledby='register-title'
          aria-describedby='register-description'
          noValidate
        >
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='register-name' className={fieldLabelClass}>
                  {t('name')}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id='register-name'
                    className={fieldInputClass}
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
                <FieldError id='name-error' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor='register-email' className={fieldLabelClass}>
                  {t('email')}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    id='register-email'
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
                <FormLabel
                  htmlFor='register-password'
                  className={fieldLabelClass}
                >
                  {t('password')}
                </FormLabel>
                <div className='relative'>
                  <FormControl>
                    <Input
                      {...field}
                      id='register-password'
                      type={showPassword ? 'text' : 'password'}
                      className={cn(fieldInputClass, 'pr-11')}
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
                  <RevealToggle
                    shown={showPassword}
                    onToggle={() => setShowPassword(!showPassword)}
                    showLabel={t('showPassword')}
                    hideLabel={t('hidePassword')}
                  />
                </div>
                <FieldError id='password-error' />
                <p className='text-muted-foreground text-xs' id='password-help'>
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
                <FormLabel
                  htmlFor='register-confirm-password'
                  className={fieldLabelClass}
                >
                  {t('confirmPassword')}
                </FormLabel>
                <div className='relative'>
                  <FormControl>
                    <Input
                      {...field}
                      id='register-confirm-password'
                      type={showConfirm ? 'text' : 'password'}
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
                    shown={showConfirm}
                    onToggle={() => setShowConfirm(!showConfirm)}
                    showLabel={t('showConfirmPassword')}
                    hideLabel={t('hideConfirmPassword')}
                  />
                </div>
                <FieldError id='confirm-password-error' />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='acceptTerms'
            render={({ field }) => (
              <FormItem className='flex flex-row items-start gap-2'>
                <FormControl>
                  <input
                    id='acceptTerms'
                    type='checkbox'
                    checked={field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                    disabled={isPending}
                    className='accent-print mt-0.5 size-4 rounded-[2px]'
                    aria-required='true'
                    aria-invalid={!!form.formState.errors.acceptTerms}
                    aria-describedby={
                      form.formState.errors.acceptTerms
                        ? 'acceptTerms-error'
                        : undefined
                    }
                  />
                </FormControl>
                <div className='min-w-0 flex-1 space-y-1'>
                  <FormLabel
                    htmlFor='acceptTerms'
                    className='data-[error=true]:text-stamp-red block cursor-pointer text-xs leading-relaxed font-normal sm:text-sm'
                  >
                    <span className='wrap-break-word whitespace-normal'>
                      {t('acceptTerms')}{' '}
                      <Link
                        href='/terms'
                        className='text-print decoration-rule hover:decoration-print wrap-break-word underline underline-offset-4'
                        aria-label={t('termsOfUse')}
                        title={t('termsOfUse')}
                        target='_blank'
                        rel='noopener noreferrer'
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('termsOfUse')}
                      </Link>{' '}
                      {t('and')}{' '}
                      <Link
                        href='/privacy'
                        className='text-print decoration-rule hover:decoration-print wrap-break-word underline underline-offset-4'
                        aria-label={t('privacyPolicy')}
                        title={t('privacyPolicy')}
                        target='_blank'
                        rel='noopener noreferrer'
                        onClick={(e) => e.stopPropagation()}
                      >
                        {t('privacyPolicy')}
                      </Link>
                    </span>
                  </FormLabel>
                  <FieldError id='acceptTerms-error' />
                </div>
              </FormItem>
            )}
          />

          {form.formState.errors.root && (
            <ErrorLine role='alert' aria-live='polite' id='form-error'>
              {form.formState.errors.root.message}
            </ErrorLine>
          )}

          <Button
            id='register-button'
            type='submit'
            size='lg'
            disabled={isPending || !form.formState.isValid}
            className='w-full'
            aria-label='Submit registration form'
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
