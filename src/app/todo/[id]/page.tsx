import { Suspense } from 'react'
import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'
import TodoDetailPage from '@/components/todos/TodoDetailPage'

export const metadata: Metadata = {
  title: 'Task Details | Tarevity',
  description:
    'View task details, update status, edit information, or share with team members.',
  robots: 'noindex, nofollow',
}

export default async function TodoDetailPageRoute(props: {
  params: Promise<{ id: string }>
}) {
  const { id } = await props.params

  return (
    <Layout>
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        }
      >
        <TodoDetailPage todoId={id} />
      </Suspense>
    </Layout>
  )
}
