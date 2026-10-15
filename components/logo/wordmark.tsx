import { cn } from '@/lib/utils';

export function Wordmark({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden='true'
        className='border-print text-print outline-print font-display grid size-8 place-items-center rounded-[3px] border-2 text-lg leading-none font-extrabold outline-1 outline-offset-2'
        style={{ fontStretch: '70%' }}
      >
        T
      </span>
      {!compact && (
        <span
          className='font-display text-[1.05rem] font-bold tracking-[0.14em] uppercase'
          style={{ fontStretch: '125%' }}
        >
          Tarevity
        </span>
      )}
    </span>
  );
}
