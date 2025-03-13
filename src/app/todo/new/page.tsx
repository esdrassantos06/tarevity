import { Suspense } from 'react'
import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'
import NewTodoPage from '@/components/todos/NewTodoPage'

export const metadata: Metadata = {
  title: 'Create New Task | Tarevity',
  description: 'Create a new task, add details, set priority level, and schedule due dates.',
  robots: 'noindex, nofollow',
}

export default function NewTodoPageRoute() {
  return (
    <Layout>
      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }>
        <NewTodoPage />
      </Suspense>
    </Layout>
  )
}