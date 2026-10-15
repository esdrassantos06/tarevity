import { cn } from '@/lib/utils';

function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot='skeleton'
      className={cn('border-rule animate-pulse rounded-[2px] border border-dashed bg-transparent', className)}
      {...props}
    />
  );
}

export { Skeleton };
