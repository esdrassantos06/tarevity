import { Skeleton } from '@/components/ui/skeleton';

export default function CalendarLoading() {
  return (
    <main className='mx-auto flex w-full max-w-360 flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10'>
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-10 w-56' />
        <Skeleton className='h-4 w-32' />
      </div>
      <div className='sheet rounded-[3px]'>
        <div className='border-rule grid grid-cols-7 gap-px border-b p-2'>
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className='h-3 w-8' />
          ))}
        </div>
        <div className='grid grid-cols-7 gap-px p-px'>
          {Array.from({ length: 35 }).map((_, i) => (
            <Skeleton key={i} className='h-20 sm:h-28' />
          ))}
        </div>
      </div>
    </main>
  );
}
