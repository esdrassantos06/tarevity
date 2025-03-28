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

  const getDisplayTitle = (title: string): string => {
    if (title.length > 20) {
      return title.substring(0, 20) + '...';
    }
    return title;
  };

  return (
    <div
      className={cn(
        'rounded truncate px-1 max-w-full py-0.5 text-xs text-white',
        event.color,
      )}
      title={event.title}
    >
      {getDisplayTitle(event.title)}
    </div>
  )
}
