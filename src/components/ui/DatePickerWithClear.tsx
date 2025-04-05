import { useState } from 'react'
import { format, isValid } from 'date-fns'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { ChangeEvent } from 'react'
import { enUS, pt } from 'date-fns/locale'
import type { Locale as DateFnsLocale } from 'date-fns'

const localeMap: Record<string, DateFnsLocale> = {
  en: enUS,
  'pt-br': pt,
}

interface DatePickerWithClearProps {
  value: string
  onChange: (
    e:
      | ChangeEvent<HTMLInputElement>
      | {
          target: {
            name: string
            value: string
            type: string
          }
        },
  ) => void
  onClear: () => void
  showConfirmDialog?: () => void
  minDate?: Date
  maxDate?: Date
  disabled?: boolean
}

export default function DatePickerWithClear({
  value,
  onChange,
  onClear,
  showConfirmDialog,
  minDate = new Date('1900-01-01'),
  maxDate = new Date('2100-12-31'),
  disabled = false,
}: DatePickerWithClearProps) {
  const t = useTranslations('todoEdit')
  const currentLocale = useLocale()
  const [open, setOpen] = useState(false)

  const date = value ? new Date(value) : undefined
  const isValidDate = date ? isValid(date) : true

  const dateLocale = localeMap[currentLocale] || enUS

  const handleSelect = (newDate: Date | undefined) => {
    const formattedDate =
      newDate && isValid(newDate) ? format(newDate, 'yyyy-MM-dd') : ''
    onChange({
      target: {
        name: 'due_date',
        value: formattedDate,
        type: 'date',
      },
    })
    setOpen(false)
  }

  return (
    <div className="flex w-full">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div
            className={cn(
              'flex w-full items-center justify-start text-left font-normal',
              'h-10 rounded-md rounded-r-none border border-gray-300 px-4 py-2',
              'focus-within:border-blue-500 focus-within:ring-blue-500',
              'cursor-pointer dark:border-gray-600 dark:bg-gray-700 dark:text-white',
              !isValidDate && 'border-red-500',
              disabled && 'cursor-not-allowed opacity-50',
            )}
            aria-invalid={!isValidDate}
            aria-label={t('selectDate')}
          >
            {date && isValidDate ? (
              format(date, 'PPP', { locale: dateLocale })
            ) : (
              <span>{t('selectDate')}</span>
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="dark:bg-BlackLight relative z-1000 w-auto bg-white p-0"
          align="start"
        >
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            initialFocus
            disabled={(date) => {
              const currentDate = new Date(date)
              return currentDate < minDate || currentDate > maxDate
            }}
            fromDate={minDate}
            toDate={maxDate}
            locale={dateLocale}
          />
        </PopoverContent>
      </Popover>
      {value && (
        <button
          aria-label={t('clearDueDate')}
          type="button"
          onClick={showConfirmDialog || onClear}
          className={cn(
            'h-10 rounded-l-none rounded-r-md border border-l-0 border-gray-300 bg-red-100 px-3',
            'hover:bg-red-200 dark:border-gray-600 dark:bg-red-900',
            'flex items-center justify-center dark:text-white dark:hover:bg-red-800',
            disabled && 'cursor-not-allowed opacity-50',
          )}
          title={t('clearDueDate')}
          disabled={disabled}
        >
          <X className="h-4 w-4 text-red-500 dark:text-red-300" />
        </button>
      )}
    </div>
  )
}
