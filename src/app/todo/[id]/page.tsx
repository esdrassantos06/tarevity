import { Suspense } from 'react'
import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'
import TodoDetailPage from '@/components/todos/TodoDetailPage'

export const metadata: Metadata = {
  title: 'Task Details | Tarevity',
  description: 'View task details, update status, edit information, or share with team members.',
  robots: 'noindex, nofollow',
}

interface PageProps {
  params: { id: string }
}

export default async function TodoDetailPageRoute(props: PageProps) {
  const { id } = props.params;
  
  return (
    <Layout>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <TodoDetailPage todoId={id} />
      </Suspense>
    </Layout>
  )
}