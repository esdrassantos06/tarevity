import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'
import TodoList from '@/components/todos/TodoList'

export const metadata: Metadata = {
  title: 'Dashboard | Tarevity',
  description: 'Gerencie suas tarefas diárias',
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
