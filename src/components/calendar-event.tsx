import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'max-w-full truncate rounded-sm px-1 py-0.5 text-xs font-medium text-white',
              'sm:px-2 md:py-1 md:text-sm',
              event.color,
            )}
          >
            <span className="hidden sm:inline">
              {event.title.length > 20
                ? event.title.substring(0, 20) + '...'
                : event.title}
            </span>
            <span className="inline sm:hidden">...</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-white">
          <p className="font-medium">{event.title}</p>
          <p className="mt-1 text-xs">{event.date.toLocaleDateString()}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
