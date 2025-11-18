'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@iconify/react';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/navigation';

const languages = [
  {
    code: 'en' as const,
    name: 'English',
    flag: 'circle-flags:us',
  },
  {
    code: 'pt' as const,
    name: 'Português',
    flag: 'circle-flags:pt',
  },
  {
    code: 'es' as const,
    name: 'Español',
    flag: 'circle-flags:es',
  },
] as const;

export function LanguageSelector() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('LanguageSelector');

  const currentLanguage = languages.find((lang) => lang.code === locale);

  const handleLanguageChange = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          size='icon'
          variant='outline'
          aria-label={t('changeLanguage')}
          aria-haspopup='true'
          aria-expanded='false'
          title={t('selectLanguage')}
        >
          {currentLanguage ? (
            <Icon
              icon={currentLanguage.flag}
              className='size-5'
              aria-hidden='true'
            />
          ) : (
            <Icon
              icon='tabler:language'
              className='size-5'
              aria-hidden='true'
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align='end'
        sideOffset={4}
        className='w-[calc(100vw-2rem)] max-w-48 bg-white dark:bg-[#1d1929]'
        role='menu'
        aria-label={t('languageSelectionMenu')}
      >
        {languages.map((language) => {
          const isActive = locale === language.code;
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              className='flex cursor-pointer items-center gap-2 hover:dark:bg-[#1d1915]/50'
              role='menuitem'
              aria-label={t('switchTo', { language: language.name })}
              aria-current={isActive ? 'true' : 'false'}
            >
              <Icon
                icon={language.flag}
                className='size-5 shrink-0'
                aria-hidden='true'
              />
              <span className='flex-1'>{language.name}</span>
              {isActive && (
                <Icon
                  icon='tabler:check'
                  className='text-primary size-4'
                  aria-hidden='true'
                />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
