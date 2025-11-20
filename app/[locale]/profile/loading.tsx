import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function ProfileLoading() {
  return (
    <div className='flex min-h-screen w-full flex-1 flex-col items-center px-4 py-20 sm:px-6 lg:px-8'>
      <div className='w-full max-w-7xl'>
        <Card className='dark:bg-[#1d1929]'>
          <CardContent className='space-y-6 p-6'>
            <div className='flex flex-col items-center gap-4 sm:flex-row sm:items-start'>
              <Skeleton className='size-24 rounded-full' />
              <div className='flex-1 space-y-3'>
                <Skeleton className='h-8 w-48' />
                <Skeleton className='h-4 w-64' />
                <Skeleton className='h-4 w-32' />
              </div>
            </div>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-3'>
              {[...Array(3)].map((_, i) => (
                <div key={i} className='space-y-2'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-8 w-full' />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
