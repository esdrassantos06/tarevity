import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card } from '@/components/ui/card';

export default function SettingsLoading() {
  return (
    <main
      className='flex flex-1 flex-col items-center justify-start gap-10 px-4 py-20 sm:px-6 lg:px-8'
      role='main'
    >
      <section className='flex w-full max-w-7xl flex-col items-center justify-center p-6'>
        <Skeleton className='mb-2 h-10 w-48 md:h-12 md:w-64' />
      </section>

      <Card className='container mb-8 w-full max-w-7xl rounded-lg bg-white shadow-sm dark:bg-[#1d1929]'>
        <div className='flex flex-col md:flex-row'>
          <nav className='w-full border-b border-gray-200 pb-0 md:w-56 md:border-r md:border-b-0 md:pb-6 md:dark:border-gray-700'>
            <div className='flex h-auto w-full flex-row gap-1 overflow-x-auto border-0 bg-transparent p-2 md:flex-col md:items-start'>
              {[...Array(3)].map((_, i) => (
                <Skeleton
                  key={i}
                  className='h-10 w-full shrink-0 rounded-md md:min-w-full'
                />
              ))}
            </div>
          </nav>

          <section className='flex-1 overflow-auto p-4 pb-6 sm:p-6'>
            <div className='mt-0 flex flex-col gap-6'>
              <header>
                <Skeleton className='mb-2 h-7 w-32' />
                <Skeleton className='h-4 w-64' />
              </header>

              <section>
                <Skeleton className='mb-4 h-5 w-24' />
                <div className='mt-2 flex flex-col gap-3 sm:flex-row'>
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className='h-11 w-full sm:w-32' />
                  ))}
                </div>
                <Skeleton className='mt-2 h-3 w-48' />
              </section>

              <Separator />

              <section>
                <Skeleton className='mb-4 h-5 w-32' />
                <div className='mb-4 flex flex-col gap-4'>
                  <div className='flex flex-col gap-2'>
                    <Skeleton className='h-3 w-16' />
                    <Skeleton className='h-4 w-48' />
                  </div>
                  <div className='flex flex-col gap-2'>
                    <Skeleton className='h-3 w-20' />
                    <Skeleton className='h-4 w-64' />
                  </div>
                  <div className='flex flex-col gap-2'>
                    <Skeleton className='h-3 w-24' />
                    <Skeleton className='h-4 w-40' />
                  </div>
                </div>

                <Separator />

                <div className='mt-4 flex flex-col gap-4'>
                  <Skeleton className='h-5 w-32' />
                  <div className='flex flex-col items-start gap-4'>
                    <Skeleton className='h-9 w-32' />
                    <Skeleton className='h-9 w-36' />
                  </div>
                </div>
              </section>
            </div>
          </section>
        </div>
      </Card>
    </main>
  );
}
