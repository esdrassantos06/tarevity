import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'
import RedesignedTodoList from '@/components/todos/TodoList'
import { Suspense } from 'react'

export const metadata: Metadata = {
  title: 'Your Productivity Dashboard | Tarevity',
  description:
    'Access your personalized Tarevity command center. Filter tasks by priority and status, track completion metrics, and maintain productivity momentum.',
  robots: 'index, follow',
}

const DashboardLoading = () => (
  <div className="flex h-64 items-center justify-center">
    <div
      className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
      role="status"
    >
      <span className="sr-only">Loading dashboard...</span>
    </div>
  </div>
)

export default function DashboardPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <Suspense fallback={<DashboardLoading />}>
          <RedesignedTodoList />
        </Suspense>
      </div>
    </Layout>
  )
}
