'use client';

import { Icon } from '@iconify/react';
import { useFormatter, useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';

interface DraftNoticeProps {
  restored: boolean;
  savedAt: Date | null;
  onDiscard: () => void;
}

export function DraftNotice({
  restored,
  savedAt,
  onDiscard,
}: DraftNoticeProps) {
  const t = useTranslations('Forms.draft');
  const format = useFormatter();

  if (!restored && !savedAt) return <span aria-hidden='true' />;

  return (
    <p
      role='status'
      aria-live='polite'
      className='typed text-muted-foreground mr-auto flex flex-wrap items-center gap-x-2 text-xs'
    >
      <Icon
        icon='tabler:device-floppy'
        className='text-print size-4'
        aria-hidden='true'
      />
      {restored
        ? t('restored')
        : t('saved', {
            time: format.dateTime(savedAt!, {
              hour: '2-digit',
              minute: '2-digit',
            }),
          })}
      {restored && (
        <Button
          type='button'
          variant='link'
          size='sm'
          onClick={onDiscard}
          className='h-auto px-0 text-xs'
        >
          {t('discard')}
        </Button>
      )}
    </p>
  );
}
