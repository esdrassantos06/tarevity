'use client'

import type { ChangeEventHandler } from 'react'
import { usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'
import { useLocale, useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition, useState } from 'react'
import { Check } from 'lucide-react'
import Image from 'next/image'
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

type LanguageCode = string
type LanguageData = {
  name: string
  flagSrc: string
}

export default function LanguageSwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('Common.languageSwitcher')

  const handleChange: ChangeEventHandler<HTMLSelectElement> = (event) => {
    router.push(`/${event.target.value}${pathname}`)
    router.refresh()
  }

  const languageData: Record<LanguageCode, LanguageData> = {
    en: { name: 'English', flagSrc: '/images/flags/gb.svg' },
    'pt-br': { name: 'Português', flagSrc: '/images/flags/br.svg' },
  }

  const getCurrentLanguageData = (code: LanguageCode): LanguageData => {
    return (
      languageData[code] || {
        name: code.toUpperCase(),
        flagSrc: '/images/flags/gb.svg',
      }
    )
  }

  const currentLanguage = getCurrentLanguageData(locale)

  const handleLocaleChange = (newLocale: LanguageCode): void => {
    if (newLocale === locale) return
    setIsLoading(true)
    startTransition(() => {
      try {
        router.push(`/${newLocale}${pathname}`)
        router.refresh()
      } finally {
        setIsLoading(false)
      }
    })
  }

  return (
    <div className="relative">
      {/*Screen Reader Only*/}
      <select
        defaultValue={locale}
        onChange={handleChange}
        className="sr-only"
        aria-label="lang-switcher"
      >
        {routing.locales.map((elt) => (
          <option key={elt} value={elt}>
            {elt.toUpperCase()}
          </option>
        ))}
      </select>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className={cn(
              'border-BorderLight hover:bg-BorderLight dark:border-BorderDark dark:hover:bg-BorderDark relative mr-2 size-10 p-2',
              (isPending || isLoading) && 'cursor-not-allowed opacity-70',
            )}
            disabled={isPending || isLoading}
          >
            <div className="relative size-5">
              <Image
                src={currentLanguage.flagSrc}
                alt={currentLanguage.name}
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="sr-only">{t('selectLanguage')}</span>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="dark:bg-BlackLight w-52"
          sideOffset={8}
        >
          <div className="px-1 py-2">
            <DropdownMenuLabel>{t('selectLanguage')}</DropdownMenuLabel>
          </div>

          <DropdownMenuSeparator />
          <div className="max-h-[50vh] overflow-y-auto py-2 sm:max-h-80">
            {routing.locales.map((code) => {
              const langData = getCurrentLanguageData(code)
              return (
                <DropdownMenuItem
                  key={code}
                  className={cn(
                    'mx-2 mb-1 flex cursor-pointer items-center justify-between rounded-md px-3 py-2',
                    code === locale ? 'bg-accent' : 'hover:bg-muted',
                  )}
                  onClick={() => handleLocaleChange(code)}
                  disabled={isPending || isLoading || code === locale}
                >
                  <div className="flex items-center gap-2">
                    <div className="relative size-5">
                      <Image
                        src={langData.flagSrc}
                        alt={langData.name}
                        fill
                        className="object-contain"
                      />
                    </div>
                    <span>{langData.name}</span>
                  </div>
                  {code === locale && (
                    <Check className="text-primary h-4 w-4" />
                  )}
                </DropdownMenuItem>
              )
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
