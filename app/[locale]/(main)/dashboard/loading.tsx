import { Skeleton } from '@/components/ui/skeleton';

const trays = ['bg-via-white', 'bg-via-canary', 'bg-via-pink'];

export default function DashboardLoading() {
  return (
    <main className='mx-auto flex w-full max-w-360 flex-1 flex-col px-4 py-8 sm:px-6 lg:px-10 lg:py-10'>
      <div className='flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between'>
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-11 w-56' />
          <Skeleton className='h-4 w-48' />
        </div>
        <div className='flex gap-2'>
          <Skeleton className='size-9' />
          <Skeleton className='h-9 w-24' />
          <Skeleton className='h-9 w-36' />
        </div>
      </div>
      <div className='mt-8 grid flex-1 gap-4 lg:grid-cols-3'>
        {trays.map((tray) => (
          <div
            key={tray}
            className={`${tray} border-rule flex min-h-[28rem] flex-col border`}
          >
            <div className='border-print flex justify-between border-b-2 px-4 pt-4 pb-3'>
              <Skeleton className='h-10 w-32' />
              <Skeleton className='h-8 w-10' />
            </div>
            <div className='flex flex-col gap-3 p-3'>
              <Skeleton className='h-36 w-full' />
              <Skeleton className='h-36 w-full' />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
