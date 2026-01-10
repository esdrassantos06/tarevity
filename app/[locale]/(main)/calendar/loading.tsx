import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function CalendarLoading() {
  return (
    <main className='flex flex-1 flex-col items-center justify-center p-4 py-12 sm:px-6 lg:px-8'>
      <div className='flex w-full max-w-7xl items-center justify-between py-4'>
        <Skeleton className='h-10 w-40' />
        <Skeleton className='h-10 w-24' />
      </div>
      <Card
        className='w-full max-w-7xl bg-white shadow-lg dark:bg-[#1d1929]'
        role='main'
      >
        <CardContent className='p-6 md:p-10 lg:p-12'>
          <div className='flex w-full justify-center'>
            <div className='flex w-full flex-col gap-4'>
              <Skeleton className='mx-auto h-8 w-48' />
              <div className='grid grid-cols-7 gap-2'>
                {Array.from({ length: 35 }).map((_, i) => (
                  <Skeleton key={i} className='aspect-square h-16 w-full' />
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
