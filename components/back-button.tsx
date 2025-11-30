'use client';

import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';

interface BackButtonProps {
  href: string;
  translationKey: string;
  variant?:
    | 'default'
    | 'destructive'
    | 'outline'
    | 'secondary'
    | 'ghost'
    | 'link';
  className?: string;
  namespace?: string;
}

export function BackButton({
  href,
  translationKey,
  variant = 'ghost',
  className,
  namespace = 'BackButton',
}: BackButtonProps) {
  const t = useTranslations(namespace);

  return (
    <Button
      asChild
      variant={variant}
      className={cn('w-full justify-start sm:w-auto', className)}
    >
      <Link
        className='flex items-center justify-center gap-2'
        href={href}
        aria-label={t(translationKey)}
        title={t(translationKey)}
      >
        <Icon
          icon={'tabler:arrow-left'}
          className='size-4 sm:size-5'
          aria-hidden='true'
        />
        <span className='text-sm sm:text-base'>{t(translationKey)}</span>
      </Link>
    </Button>
  );
}
