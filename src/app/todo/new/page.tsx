import { Suspense } from 'react'
import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'
import NewTodoPage from '@/components/todos/NewTodoPage'

export const metadata: Metadata = {
  title: 'Create New Task | Tarevity',
  description:
    'Create a new task, add details, set priority level, and schedule due dates.',
  robots: 'noindex, nofollow',
}

export default function NewTodoPageRoute() {
  return (
    <Layout>
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        }
      >
        <NewTodoPage />
      </Suspense>
    </Layout>
  )
}
