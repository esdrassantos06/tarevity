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
              'max-w-full truncate rounded px-1 py-0.5 text-xs text-white',
              'sm:px-2 md:py-1 md:text-sm',
              event.color,
            )}
          >
            {/* Versão para telas maiores */}
            <span className="hidden sm:inline">
              {event.title.length > 20
                ? event.title.substring(0, 20) + '...'
                : event.title}
            </span>

            {/* Versão para telas menores */}
            <span className="inline sm:hidden">...</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs text-black dark:text-white dark:bg-BlackLight bg-white">
          <p className=''>{event.title}</p>
          <p className="text-xs mt-1 text-muted-foreground">
            {event.date.toLocaleDateString()}
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
