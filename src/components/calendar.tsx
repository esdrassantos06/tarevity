'use client'

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import CalendarEvent from './calendar-event'
import { useRouter } from '@/i18n/navigation'
import { useTodosQuery } from '@/hooks/useTodosQuery'
import { Todo } from '@/lib/api'
import { useTranslations } from 'next-intl'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export default function Calendar() {
  const t = useTranslations('calendar')
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const { data: todos = [] } = useTodosQuery()

  const daysOfWeek = [
    t('daysOfWeek.sunday'),
    t('daysOfWeek.monday'),
    t('daysOfWeek.tuesday'),
    t('daysOfWeek.wednesday'),
    t('daysOfWeek.thursday'),
    t('daysOfWeek.friday'),
    t('daysOfWeek.saturday'),
  ]

  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  )

  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  )

  const firstDayOfWeek = firstDayOfMonth.getDay()

  const daysInMonth = lastDayOfMonth.getDate()

  const daysFromPrevMonth = firstDayOfWeek

  const totalCells = Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7

  const calendarDays = []

  const prevMonthLastDay = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0,
  ).getDate()
  for (let i = 0; i < daysFromPrevMonth; i++) {
    calendarDays.push({
      day: prevMonthLastDay - daysFromPrevMonth + i + 1,
      isCurrentMonth: false,
      date: new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        prevMonthLastDay - daysFromPrevMonth + i + 1,
      ),
    })
  }

  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
    })
  }

  const remainingCells = totalCells - calendarDays.length
  for (let i = 1; i <= remainingCells; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: false,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i),
    })
  }

  const prevMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    )
  }

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    )
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const getEventsForDate = (date: Date): Todo[] => {
    return todos.filter((todo: Todo) => {
      if (!todo.due_date) return false

      if (todo.is_completed) {
        return false
      }

      const todoDate = new Date(todo.due_date)
      return (
        todoDate.getFullYear() === date.getFullYear() &&
        todoDate.getMonth() === date.getMonth() &&
        todoDate.getDate() === date.getDate()
      )
    })
  }

  const formatDateForURL = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const handleDayClick = (date: Date) => {
    const todosOnDate = getEventsForDate(date)

    if (todosOnDate.length === 1) {
      router.push(`/todo/${todosOnDate[0].id}`)
    } else if (todosOnDate.length > 1) {
      const formattedDate = formatDateForURL(date)
      router.push(`/dashboard?dueDate=${formattedDate}`)
    }
  }

  const formattedMonth = new Intl.DateTimeFormat(t('locale'), {
    month: 'long',
  }).format(currentDate)

  const capitalizedMonth =
    formattedMonth.charAt(0).toUpperCase() + formattedMonth.slice(1)

  const monthYearFormat = t('monthYearFormat', {
    month: capitalizedMonth,
    year: currentDate.getFullYear(),
  })

  const handleYearChange = (year: string) => {
    const newDate = new Date(currentDate)
    newDate.setFullYear(parseInt(year))
    setCurrentDate(newDate)
  }

  const handleMonthChange = (month: string) => {
    const newDate = new Date(currentDate)
    newDate.setMonth(parseInt(month))
    setCurrentDate(newDate)
  }

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i)

  const months = Array.from({ length: 12 }, (_, i) => i)

  return (
    <Card className="dark:bg-BlackLight size-full shadow-sm">
      <CardHeader className="space-y-2 px-4 pt-4 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl font-semibold sm:text-2xl">
            {monthYearFormat}
          </CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex md:hidden">
              <Select
                value={currentDate.getMonth().toString()}
                onValueChange={handleMonthChange}
              >
                <SelectTrigger className="h-8 w-[100px]">
                  <SelectValue placeholder="MM" />
                </SelectTrigger>
                <SelectContent className="">
                  {months.map((month) => (
                    <SelectItem key={month} value={month.toString()}>
                      {new Intl.DateTimeFormat(t('locale'), { month: 'long' })
                        .format(new Date(2000, month, 1))
                        .replace(/^\w/, (c) => c.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex md:hidden">
              <Select
                value={currentDate.getFullYear().toString()}
                onValueChange={handleYearChange}
              >
                <SelectTrigger className="h-8 w-[90px]">
                  <SelectValue placeholder="YYYY" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="hidden items-center space-x-2 md:flex">
              <Button variant="outline" size="sm" onClick={goToToday}>
                <CalendarIcon className="mr-1 size-4" />
                {t('today')}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={prevMonth}
                aria-label={t('previousMonth')}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                aria-label={t('nextMonth')}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
            <div className="flex md:hidden">
              <Button
                variant="outline"
                size="icon"
                onClick={prevMonth}
                aria-label={t('previousMonth')}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goToToday}
                className="mx-1"
              >
                <CalendarIcon className="size-4 self-center" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={nextMonth}
                aria-label={t('nextMonth')}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
        <div className="dark:bg-BlackLight grid grid-cols-7 gap-px overflow-hidden rounded-md border text-center text-sm">
          {/* Days of Week Header */}
          {daysOfWeek.map((day, index) => (
            <div
              key={index}
              className="dark:bg-BlackLight py-2 text-xs font-medium md:text-sm"
            >
              <span className="hidden md:inline">{day}</span>
              <span className="md:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((day, index) => {
            const dayEvents = day.isCurrentMonth
              ? getEventsForDate(day.date)
              : []
            const isToday =
              day.isCurrentMonth &&
              day.day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear()

            return (
              <div
                key={index}
                onClick={() => dayEvents.length > 0 && handleDayClick(day.date)}
                className={cn(
                  'bg-background relative flex min-h-[70px] flex-col p-1 transition-colors md:min-h-[100px] md:p-2',
                  day.isCurrentMonth
                    ? 'bg-background'
                    : 'bg-muted/50 text-muted-foreground',
                  dayEvents.length > 0 && day.isCurrentMonth && 'bg-accent/50',
                  dayEvents.length > 0 &&
                    day.isCurrentMonth &&
                    'hover:bg-accent cursor-pointer',
                )}
                aria-label={
                  dayEvents.length > 0
                    ? t('dayWithTasks', {
                        day: day.day,
                        count: dayEvents.length,
                      })
                    : t('day', { day: day.day })
                }
              >
                <div className="flex justify-between">
                  <span
                    className={cn(
                      'flex h-6 w-6 items-center justify-center rounded-full text-xs md:h-8 md:w-8 md:text-sm',
                      isToday && 'bg-primary font-medium text-white',
                      dayEvents.length > 0 &&
                        day.isCurrentMonth &&
                        'font-medium',
                    )}
                  >
                    {day.day}
                  </span>
                  {day.isCurrentMonth && dayEvents.length > 0 && (
                    <span className="bg-primary/10 text-primary flex h-5 w-5 items-center justify-center rounded-full text-xs font-medium sm:hidden">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Events - Only show for current month days */}
                {day.isCurrentMonth && (
                  <div className="mt-1 flex flex-1 flex-col gap-1 overflow-hidden">
                    {dayEvents
                      .slice(0, window.innerWidth < 640 ? 1 : 3)
                      .map((event) => (
                        <CalendarEvent
                          key={event.id}
                          event={{
                            id: Number(event.id),
                            title: event.title,
                            date: new Date(event.due_date!),
                            color:
                              event.priority === 3
                                ? 'bg-destructive'
                                : event.priority === 2
                                  ? 'bg-warning'
                                  : 'bg-success',
                          }}
                        />
                      ))}
                    {dayEvents.length > (window.innerWidth < 640 ? 1 : 3) && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="text-muted-foreground cursor-pointer text-center text-xs font-medium">
                              +
                              {dayEvents.length -
                                (window.innerWidth < 640 ? 1 : 3)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="bottom" align="center">
                            <p className="font-medium">
                              {dayEvents.length -
                                (window.innerWidth < 640 ? 1 : 3)}{' '}
                              ...
                            </p>
                            <div className="mt-1 space-y-1">
                              {dayEvents
                                .slice(window.innerWidth < 640 ? 1 : 3)
                                .map((event) => (
                                  <p key={event.id} className="text-xs">
                                    {event.title}
                                  </p>
                                ))}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
