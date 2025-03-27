import { useLocale, useTranslations } from 'next-intl'
import { usePathname, useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

const languages = [
  { code: 'en', name: 'English', flag: '🇬🇧' },
  { code: 'pt-br', name: 'Português', flag: '🇧🇷' },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const t = useTranslations('Common.languageSwitcher')

  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0]

  const handleLocaleChange = (newLocale: string) => {
    startTransition(() => {
      
      const localeCodes = languages.map(lang => lang.code);
      
      let pathWithoutLocale = pathname;
      for (const code of localeCodes) {
        if (pathname.startsWith(`/${code}`)) {

          pathWithoutLocale = pathname.substring(code.length + 1) || '/';
          break;
        }
      }

      if (!pathWithoutLocale.startsWith('/')) {
        pathWithoutLocale = '/' + pathWithoutLocale;
      }
      
      const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`;
      
      router.push(newPath);
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="sm"
          className={cn(
            'flex border-BorderLight bg-transparent hover:bg-BorderLight dark:hover:bg-BorderDark border-2 dark:border-BorderDark items-center size-10 p-2 mr-2 gap-2 rounded-md',
            isPending && 'cursor-not-allowed opacity-70',
          )}
          disabled={isPending}
        >
          <span className="text-lg" aria-hidden="true">
            {currentLanguage.flag}
          </span>
          <span className="sr-only">{t('selectLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>{t('selectLanguage')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            className={cn(
              'flex cursor-pointer items-center justify-between py-2',
              language.code === locale && 'bg-accent',
            )}
            onClick={() => handleLocaleChange(language.code)}
            disabled={isPending || language.code === locale}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">
                {language.flag}
              </span>
              <span>{language.name}</span>
            </div>
            {language.code === locale && (
              <Check className="text-primary h-4 w-4" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
