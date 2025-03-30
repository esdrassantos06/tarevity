'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import CalendarEvent from './calendar-event'
import { useRouter } from 'next/navigation'
import { useTodosQuery } from '@/hooks/useTodosQuery'
import { Todo } from '@/lib/api'
import { useTranslations } from 'next-intl'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip'

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

  // Get the first day of the month
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
  )

  // Get the last day of the month
  const lastDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
  )

  // Get the day of the week for the first day of the month (0-6)
  const firstDayOfWeek = firstDayOfMonth.getDay()

  // Calculate the number of days in the month
  const daysInMonth = lastDayOfMonth.getDate()

  const daysFromPrevMonth = firstDayOfWeek

  // Calculate the total number of cells needed (including days from prev/next months)
  const totalCells = Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7

  // Generate calendar days array
  const calendarDays = []

  // Previous month days
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

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push({
      day: i,
      isCurrentMonth: true,
      date: new Date(currentDate.getFullYear(), currentDate.getMonth(), i),
    })
  }

  // Next month days
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
    }
    // If multiple todos, redirect to dashboard with date filter
    else if (todosOnDate.length > 1) {
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

  return (
    <div className="dark:bg-BlackLight flex size-full flex-col rounded-lg bg-white p-2">
      {/* Calendar Header */}
      <div className="flex flex-col items-center justify-between gap-2 border-b p-2 sm:flex-row sm:p-4">
        <h1 className="text-xl font-bold sm:text-2xl">{monthYearFormat}</h1>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="text-xs sm:text-sm"
          >
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
      </div>

      {/* Calendar Grid */}
      <div className="grid flex-1 grid-cols-7 grid-rows-[auto_1fr]">
        {/* Days of Week Header */}
        {daysOfWeek.map((day, index) => (
          <div
            key={index}
            className="border-r border-b p-1 text-center text-xs font-medium last:border-r-0 sm:p-2 sm:text-sm"
          >
            <span className="hidden md:inline">{day}</span>
            <span className="md:hidden">{day.slice(0, 1)}</span>
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => {
          const dayEvents = day.isCurrentMonth ? getEventsForDate(day.date) : []
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
                'relative table border-r border-b p-1 last:border-r-0 sm:p-2',
                dayEvents.length > 0 && day.isCurrentMonth
                  ? 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800'
                  : '',
                !day.isCurrentMonth && 'bg-muted/50 text-muted-foreground',
                dayEvents.length > 0 &&
                  day.isCurrentMonth &&
                  'bg-blue-50 dark:bg-blue-900/30',
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
                    'flex size-5 items-center justify-center rounded-full text-xs sm:size-6 sm:text-sm',
                    isToday && 'bg-primary !text-white',
                    dayEvents.length > 0 &&
                      'font-bold text-blue-600 dark:text-blue-400',
                  )}
                >
                  {day.day}
                </span>
                {day.isCurrentMonth && dayEvents.length > 0 && (
                  <span className="text-xs font-medium text-blue-600 sm:hidden dark:text-blue-400">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Events - Only show for current month days */}
              {day.isCurrentMonth && (
                <div className="mt-1 max-h-14 space-y-1 overflow-hidden sm:max-h-20">
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
                              ? 'bg-red-500'
                              : event.priority === 2
                                ? 'bg-yellow-500'
                                : 'bg-green-500',
                        }}
                      />
                    ))}
                  {dayEvents.length > (window.innerWidth < 640 ? 1 : 3) && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-pointer text-center text-xs text-gray-500">
                            +
                            {dayEvents.length -
                              (window.innerWidth < 640 ? 1 : 3)}
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-medium">
                            {dayEvents.length -
                              (window.innerWidth < 640 ? 1 : 3)}{' '}
                            mais eventos
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
    </div>
  )
}
