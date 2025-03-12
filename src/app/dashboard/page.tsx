import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'
import TodoList from '@/components/todos/TodoList'

export const metadata: Metadata = {
  title: 'Your Productivity Dashboard | Tarevity',
  description:
    'Access your personalized Tarevity command center. Filter tasks by priority and status, track completion metrics, and maintain productivity momentum.',
  robots: 'noindex, follow',
}

export default function DashboardPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <TodoList />
      </div>
    </Layout>
  )
}
