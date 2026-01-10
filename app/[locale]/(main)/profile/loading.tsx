import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default function ProfileLoading() {
  return (
    <main className='flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-12 lg:gap-10 lg:px-8 lg:py-20'>
      <section className='flex w-full max-w-7xl flex-col items-center justify-center p-4 sm:p-6'>
        <Skeleton className='mb-2 h-10 w-48 sm:h-12 md:h-14' />
      </section>

      <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg shadow dark:bg-[#1d1929]'>
        <div className='bg-blue-accent h-24 rounded-t-lg sm:h-32' />
        <div className='flex items-center justify-between gap-4 px-4 py-4 sm:px-6 md:px-10'>
          <div className='flex w-full items-center gap-3 sm:gap-4'>
            <Skeleton className='size-16 rounded-full sm:size-20' />
            <div className='flex min-w-0 flex-1 flex-col gap-2'>
              <Skeleton className='h-6 w-32 sm:h-8 sm:w-48' />
              <Skeleton className='h-4 w-40 sm:h-5 sm:w-64' />
            </div>
          </div>
          <Skeleton className='h-9 w-20 shrink-0 sm:w-24' />
        </div>

        <Separator />
        <div className='flex flex-col gap-4 p-4 sm:p-6'>
          <Skeleton className='mb-2 h-5 w-28 sm:h-6 sm:w-32' />
          <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3'>
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className='gap-0 p-4'>
                  <CardContent className='p-0'>
                    <Skeleton className='mb-2 h-8 w-12' />
                    <Skeleton className='h-4 w-20' />
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </section>
    </main>
  );
}
