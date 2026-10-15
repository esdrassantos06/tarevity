import { Skeleton } from '@/components/ui/skeleton';

export default function ProfileLoading() {
  return (
    <main className='mx-auto flex w-full max-w-360 flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10'>
      <div className='flex flex-col gap-2'>
        <Skeleton className='h-10 w-56' />
        <Skeleton className='h-4 w-48' />
      </div>
      <section className='sheet grid w-full rounded-[3px] lg:grid-cols-[20rem_1fr]'>
        <div className='border-rule flex flex-col gap-4 border-b p-6 lg:border-r lg:border-b-0'>
          <Skeleton className='size-32' />
          <Skeleton className='h-7 w-40' />
          <Skeleton className='h-4 w-52' />
          <Skeleton className='h-9 w-28' />
        </div>
        <div className='flex flex-col gap-8 p-6'>
          <div className='border-rule flex flex-col border-t'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className='border-rule grid grid-cols-1 gap-2 border-b py-3 sm:grid-cols-[12rem_1fr] sm:gap-4'
              >
                <Skeleton className='h-3 w-24' />
                <Skeleton className='h-5 w-48' />
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
