import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/header';
import Footer from '@/components/footer';

export default function DashboardLoading() {
  return (
    <>
      <Header />
      <main className='flex min-h-screen w-full flex-1 flex-col items-center px-4 py-20 sm:px-6 lg:px-8'>
        <nav className='flex w-full flex-col items-center justify-center gap-4 py-4 sm:gap-6'>
          <div className='flex w-full max-w-7xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center'>
            <Skeleton className='h-10 w-48 sm:h-12 md:h-14' />
            <div className='flex w-full items-center justify-center gap-2 sm:w-auto'>
              <Skeleton className='h-10 w-32 sm:w-40' />
              <Skeleton className='h-10 w-full sm:w-64' />
            </div>
          </div>
          <div className='flex w-full max-w-7xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex min-w-0 flex-1 items-center gap-2 overflow-x-auto pb-2 sm:pb-0'>
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className='h-9 w-20 shrink-0' />
              ))}
            </div>
            <Skeleton className='h-10 w-24 shrink-0' />
          </div>
        </nav>
        <div className='w-full max-w-7xl py-4'>
          <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6'>
            <div className='flex-shrink-0'>
              <Skeleton className='size-40 rounded-full' />
            </div>
            <div className='flex flex-col gap-3'>
              {[...Array(4)].map((_, i) => (
                <div key={i} className='flex items-center gap-2'>
                  <Skeleton className='size-4 rounded-full' />
                  <Skeleton className='h-4 w-24' />
                </div>
              ))}
            </div>
          </div>
        </div>
        <section className='w-full max-w-7xl py-10 sm:py-16 md:py-20'>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {[...Array(6)].map((_, i) => (
              <Card
                key={i}
                className='flex h-70 flex-col justify-between pb-2 dark:bg-[#1d1929]'
              >
                <CardContent className='flex h-full flex-col justify-between'>
                  <div className='flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      <Skeleton className='size-4 rounded-full' />
                      <Skeleton className='h-6 w-3/4' />
                    </div>
                    <Skeleton className='h-4 w-1/2' />
                    <Skeleton className='mt-2 h-4 w-full' />
                    <Skeleton className='mt-2 h-4 w-2/3' />
                  </div>
                  <div className='mt-4'>
                    <Skeleton className='h-3 w-24' />
                  </div>
                </CardContent>
                <div>
                  <Separator />
                  <CardFooter className='flex items-center justify-end gap-2 pt-2'>
                    <Skeleton className='h-4 w-6' />
                    <Skeleton className='h-4 w-6' />
                  </CardFooter>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
