import { Suspense, use } from 'react'
import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'
import TodoEditPage from '@/components/todos/TodoEditPage'

export const metadata: Metadata = {
  title: 'Edit Task | Tarevity',
  description:
    'Modify task details, update due dates, change priority levels, or edit descriptions.',
  robots: 'noindex, nofollow',
}

interface PageParams {
  params: Promise<{
    id: string;
  }>;
  searchParams?: Promise<Record<string, string | string[]>>;
}

export default function TodoEditPageRoute(props: PageParams) {
  // Usando 'use' para lidar com a Promise dos params
  const params = use(props.params);
  const id = params.id;

  return (
    <Layout>
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        }
      >
        <TodoEditPage todoId={id} />
      </Suspense>
    </Layout>
  )
}