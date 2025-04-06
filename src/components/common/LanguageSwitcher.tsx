'use client'

import { useLocale, useTranslations } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'
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

const languages = [
  { code: 'en', name: 'English', flagSrc: '/images/flags/gb.svg' },
  { code: 'pt-br', name: 'Português', flagSrc: '/images/flags/br.svg' },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()
  const [isLoading, setIsLoading] = useState(false)
  const t = useTranslations('Common.languageSwitcher')
  const currentLanguage =
    languages.find((lang) => lang.code === locale) || languages[0]

  const handleLocaleChange = async (newLocale: unknown) => {
    if (newLocale === locale) return
    setIsLoading(true)
    startTransition(async () => {
      try {
        const localeCodes = languages.map((lang) => lang.code)
        let pathWithoutLocale = pathname
        for (const code of localeCodes) {
          if (pathname.startsWith(`/${code}`)) {
            pathWithoutLocale = pathname.substring(code.length + 1) || '/'
            break
          }
        }
        if (!pathWithoutLocale.startsWith('/')) {
          pathWithoutLocale = '/' + pathWithoutLocale
        }
        const newPath = `/${newLocale}${pathWithoutLocale === '/' ? '' : pathWithoutLocale}`
        const needsPreload =
          pathWithoutLocale.includes('login') ||
          pathWithoutLocale.includes('register') ||
          pathWithoutLocale.includes('auth')
        if (needsPreload) {
          try {
            await import(`@/messages/${newLocale}.json`)
            await new Promise((resolve) => setTimeout(resolve, 150))
          } catch (error) {
            console.error(`Failed to preload messages for ${newLocale}:`, error)
          }
        }
        router.push(newPath)
      } finally {
        setIsLoading(false)
      }
    })
  }

  return (
    <div className="relative">
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
            {languages.map((language) => (
              <DropdownMenuItem
                key={language.code}
                className={cn(
                  'mx-2 mb-1 flex cursor-pointer items-center justify-between rounded-md px-3 py-2',
                  language.code === locale ? 'bg-accent' : 'hover:bg-muted',
                )}
                onClick={() => handleLocaleChange(language.code)}
                disabled={isPending || isLoading || language.code === locale}
              >
                <div className="flex items-center gap-2">
                  <div className="relative size-5">
                    <Image
                      src={language.flagSrc}
                      alt={language.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <span>{language.name}</span>
                </div>
                {language.code === locale && (
                  <Check className="text-primary h-4 w-4" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
