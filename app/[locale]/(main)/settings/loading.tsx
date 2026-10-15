import { Skeleton } from '@/components/ui/skeleton';

export default function SettingsLoading() {
  return (
    <main
      className='mx-auto flex w-full max-w-360 flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10'
      role='main'
    >
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-10 w-56' />
        <Skeleton className='h-4 w-48' />
      </div>
      <div className='sheet flex flex-col rounded-[3px]'>
        <div className='border-rule flex gap-4 border-b px-4 py-3 sm:px-6'>
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className='h-6 w-24' />
          ))}
        </div>
        <div className='flex flex-col p-4 sm:p-6'>
          <div className='border-rule flex flex-col gap-2 border-b pb-4'>
            <Skeleton className='h-6 w-32' />
            <Skeleton className='h-4 w-64' />
          </div>
          <div className='flex flex-col gap-3 py-5'>
            <Skeleton className='h-3 w-16' />
            <div className='flex flex-col gap-3 sm:flex-row sm:gap-8'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className='h-5 w-24' />
              ))}
            </div>
            <Skeleton className='h-4 w-full max-w-prose' />
          </div>
        </div>
      </div>
    </main>
  );
}
