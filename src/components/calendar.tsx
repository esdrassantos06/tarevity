"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import CalendarEvent from "./calendar-event"

// Sample events data
const events = [
  { id: 1, title: "Team Meeting", date: new Date(2025, 2, 15), color: "bg-blue-500" },
  { id: 2, title: "Project Deadline", date: new Date(2025, 2, 20), color: "bg-red-500" },
  { id: 3, title: "Lunch with Client", date: new Date(2025, 2, 18), color: "bg-green-500" },
  { id: 4, title: "Conference Call", date: new Date(2025, 2, 22), color: "bg-purple-500" },
  { id: 5, title: "Birthday Party", date: new Date(2025, 2, 25), color: "bg-yellow-500" },
]

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  // Get the first day of the month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)

  // Get the last day of the month
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

  // Get the day of the week for the first day of the month (0-6)
  const firstDayOfWeek = firstDayOfMonth.getDay()

  // Calculate the number of days in the month
  const daysInMonth = lastDayOfMonth.getDate()

  // Calculate the number of days from the previous month to display
  const daysFromPrevMonth = firstDayOfWeek

  // Calculate the total number of cells needed (including days from prev/next months)
  const totalCells = Math.ceil((daysFromPrevMonth + daysInMonth) / 7) * 7

  // Generate calendar days array
  const calendarDays = []

  // Previous month days
  const prevMonthLastDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate()
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

  // Navigate to previous month
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  // Navigate to next month
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  // Navigate to today
  const goToToday = () => {
    setCurrentDate(new Date())
  }

  // Get events for a specific date
  interface Event {
    id: number;
    title: string;
    date: Date;
    color: string;
  }

  const getEventsForDate = (date: Date): Event[] => {
    return events.filter(
      (event: Event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear(),
    )
  }

  // Format month and year
  const monthYearFormat = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(currentDate)

  return (
    <div className="flex h-full bg-BlackLight rounded-lg w-full p-2 flex-col">
      {/* Calendar Header */}
      <div className="flex items-center justify-between border-b p-4">
        <h1 className="text-2xl font-bold">{monthYearFormat}</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToToday}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={prevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid flex-1 grid-cols-7 grid-rows-[auto_1fr]">
        {/* Days of Week Header */}
        {daysOfWeek.map((day, index) => (
          <div key={index} className="border-b border-r p-2 text-center font-medium last:border-r-0">
            <span className="hidden md:inline">{day}</span>
            <span className="md:hidden">{day.slice(0, 3)}</span>
          </div>
        ))}

        {/* Calendar Days */}
        {calendarDays.map((day, index) => {
          const dayEvents = getEventsForDate(day.date)
          const isToday =
            day.isCurrentMonth &&
            day.day === new Date().getDate() &&
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear()

          return (
            <div
              key={index}
              className={cn(
                "relative border-b border-r table p-1 last:border-r-0 md:p-2",
                !day.isCurrentMonth && "bg-muted/50 text-muted-foreground",
              )}
            >
              <div className="flex justify-between">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-sm",
                    isToday && "bg-primary text-white",
                  )}
                >
                  {day.day}
                </span>
              </div>

              {/* Events */}
              <div className="mt-1 space-y-1">
                {dayEvents.map((event) => (
                  <CalendarEvent key={event.id} event={event} />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

