import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'
import RedesignedTodoList from '@/components/todos/TodoList'

export const metadata: Metadata = {
  title: 'Your Productivity Dashboard | Tarevity',
  description:
    'Access your personalized Tarevity command center. Filter tasks by priority and status, track completion metrics, and maintain productivity momentum.',
  robots: 'index, follow',
}

export default function DashboardPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <RedesignedTodoList />
      </div>
    </Layout>
  )
}
