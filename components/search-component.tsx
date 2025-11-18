'use client';

import { Icon } from '@iconify/react';
import { Button, buttonVariants } from './ui/button';
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { useTranslations } from 'next-intl';

type SearchComponentProps = {
  value: string;
  onChange: (value: string) => void;
  debounceDelay?: number;
};

export default function SearchComponent({
  value,
  onChange,
  debounceDelay = 300,
}: SearchComponentProps) {
  const [openSearch, setOpenSearch] = useState(false);
  const [internalValue, setInternalValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const t = useTranslations('SearchComponent');

  useEffect(() => {
    setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (internalValue !== value) {
      const timer = setTimeout(() => {
        onChange(internalValue);
      }, debounceDelay);

      return () => clearTimeout(timer);
    }
  }, [internalValue, value, onChange, debounceDelay]);

  useEffect(() => {
    if (openSearch && inputRef.current) {
      inputRef.current.focus();
    }
  }, [openSearch]);

  const handleClose = () => {
    setInternalValue('');
    onChange('');
    setOpenSearch(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClose();
    }
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    }
  };

  const handleBlur = () => {
    if (!internalValue) {
      setOpenSearch(false);
    }
  };

  if (openSearch) {
    return (
      <div className='relative w-48' role='search'>
        <label htmlFor='search-input' className='sr-only'>
          {t('label')}
        </label>
        <div className='pointer-events-none absolute top-0 left-2 flex h-full items-center'>
          <Icon
            icon={'mdi:magnify'}
            className='size-5 text-gray-400'
            aria-hidden='true'
          />
        </div>

        <input
          ref={inputRef}
          id='search-input'
          type='search'
          value={internalValue}
          onChange={(e) => setInternalValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          aria-label={t('ariaLabel')}
          aria-describedby='search-description'
          autoComplete='off'
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'h-10 w-full pr-3 pl-9',
          )}
        />
        <span id='search-description' className='sr-only'>
          {t('description')}
        </span>
      </div>
    );
  }

  return (
    <Button
      variant={'outline'}
      size={'icon'}
      onClick={() => setOpenSearch(true)}
      aria-label={t('openSearch')}
      title={t('title')}
      type='button'
    >
      <Icon
        icon={'mdi:magnify'}
        className='size-5 text-gray-400'
        aria-hidden='true'
      />
    </Button>
  );
}
