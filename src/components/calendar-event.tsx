import { cn } from '@/lib/utils'

interface CalendarEventProps {
  event: {
    id: number
    title: string
    date: Date
    color: string
  }
}

export default function CalendarEvent({ event }: CalendarEventProps) {
  return (
    <div
      className={cn(
        'truncate rounded px-1 py-0.5 text-xs text-white',
        event.color,
      )}
      title={event.title}
    >
      {event.title}
    </div>
  )
}
