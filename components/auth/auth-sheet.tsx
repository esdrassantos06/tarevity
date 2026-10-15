'use client';

import type { ComponentProps, ReactNode } from 'react';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import { BackButton } from '@/components/back-button';
import { Wordmark } from '@/components/logo/wordmark';
import { useFormField } from '@/components/ui/form';
import { cn } from '@/lib/utils';

interface AuthSheetProps {
  title: string;
  titleId: string;
  description: string;
  descriptionId: string;
  formName: string;
  number: string;
  backHref: string;
  backKey: string;
  stub?: ReactNode;
  children: ReactNode;
}

export function AuthSheet({
  title,
  titleId,
  description,
  descriptionId,
  formName,
  number,
  backHref,
  backKey,
  stub,
  children,
}: AuthSheetProps) {
  const tForms = useTranslations('Forms');
  const t = useTranslations('AuthSheet');

  return (
    <main
      id='main-content'
      className='bg-background flex min-h-screen w-full items-center px-4 py-10 sm:px-6 lg:px-12 lg:py-16'
    >
      <div className='mx-auto grid w-full max-w-120 gap-8 lg:max-w-6xl lg:grid-cols-[minmax(0,1fr)_30rem] lg:items-center lg:gap-20'>
        <div className='flex flex-col gap-6 lg:gap-12'>
          <div className='flex items-center justify-between gap-4'>
            <Wordmark />
            <BackButton
              href={backHref}
              translationKey={backKey}
              className='w-auto'
            />
          </div>
          <div className='space-y-3 lg:space-y-5'>
            <h1
              id={titleId}
              className='font-display text-ink text-4xl leading-[0.95] font-bold tracking-tight text-balance lg:text-6xl xl:text-7xl'
              style={{ fontStretch: '80%' }}
            >
              {title}
            </h1>
            <p
              id={descriptionId}
              className='text-muted-foreground max-w-sm text-sm lg:text-base'
            >
              {description}
            </p>
          </div>
          <p className='typed border-rule text-muted-foreground hidden border-t pt-3 text-sm lg:block'>
            {tForms('formNumber')} {number}
          </p>
        </div>

        <section
          className='sheet relative rounded-[3px]'
          aria-labelledby={titleId}
        >
          <header className='border-print flex items-center justify-between gap-4 border-b-2 px-5 py-3 sm:px-6'>
            <span className='field-label'>{formName}</span>
            <span className='typed text-sm'>{t('model', { number })}</span>
          </header>
          <div className='space-y-5 px-5 py-6 sm:px-6'>{children}</div>
          {stub && (
            <div className='bg-accent/40 relative px-5 pt-6 pb-4 text-center text-sm sm:px-6'>
              <div
                aria-hidden='true'
                className='perforation-x absolute inset-x-0 -top-1.25'
              />
              {stub}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export function SheetDivider({ children }: { children: ReactNode }) {
  return (
    <div className='flex items-center gap-3' role='separator'>
      <span className='bg-rule h-px flex-1' />
      <span className='field-label'>{children}</span>
      <span className='bg-rule h-px flex-1' />
    </div>
  );
}

export function ErrorLine({
  id,
  className,
  children,
  ...props
}: ComponentProps<'p'>) {
  return (
    <p
      id={id}
      className={cn(
        'text-stamp-red flex items-start gap-1.5 text-sm',
        className,
      )}
      {...props}
    >
      <Icon
        icon='tabler:alert-circle'
        className='mt-0.5 size-4 shrink-0'
        aria-hidden='true'
      />
      <span>{children}</span>
    </p>
  );
}

export function FieldError({ id }: { id?: string }) {
  const { error, formMessageId } = useFormField();
  if (!error?.message) return null;
  return (
    <ErrorLine id={id ?? formMessageId} data-slot='form-message'>
      {String(error.message)}
    </ErrorLine>
  );
}

export function RevealToggle({
  shown,
  onToggle,
  showLabel,
  hideLabel,
}: {
  shown: boolean;
  onToggle: () => void;
  showLabel: string;
  hideLabel: string;
}) {
  const label = shown ? hideLabel : showLabel;
  return (
    <button
      type='button'
      onClick={onToggle}
      className='text-muted-foreground hover:text-print focus-visible:outline-ring absolute top-1/2 right-2 grid size-7 -translate-y-1/2 place-items-center rounded-[3px] focus-visible:outline-2'
      aria-label={label}
      title={label}
    >
      <Icon
        icon={shown ? 'tabler:eye-off' : 'tabler:eye'}
        className='size-5'
        aria-hidden='true'
      />
    </button>
  );
}

export const fieldInputClass =
  'bg-card dark:bg-card border-input h-10 rounded-[3px] font-sans';

export const fieldLabelClass = 'field-label data-[error=true]:text-stamp-red';
