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
  { code: 'en' as const, name: 'English' },
  { code: 'pt' as const, name: 'Português' },
  { code: 'es' as const, name: 'Español' },
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size='sm'
          variant='ghost'
          className='typed w-10 px-0 text-sm font-bold uppercase'
          aria-label={t('changeLanguage')}
          aria-haspopup='true'
          aria-expanded='false'
          title={t('selectLanguage')}
        >
          {currentLanguage ? (
            currentLanguage.code
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
        sideOffset={6}
        className='sheet z-999 w-48 rounded-[3px] p-1'
        role='menu'
        aria-label={t('languageSelectionMenu')}
      >
        {languages.map((language) => {
          const isActive = locale === language.code;
          return (
            <DropdownMenuItem
              key={language.code}
              onClick={() => handleLanguageChange(language.code)}
              disabled={isActive}
              className='flex cursor-pointer items-center gap-3 rounded-[2px]'
              role='menuitem'
              aria-label={t('switchTo', { language: language.name })}
              aria-current={isActive ? 'true' : 'false'}
            >
              <span
                className='typed text-muted-foreground w-6 text-xs uppercase'
                aria-hidden='true'
              >
                {language.code}
              </span>
              <span className='flex-1'>{language.name}</span>
              {isActive && (
                <Icon
                  icon='tabler:check'
                  className='text-print size-4'
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
