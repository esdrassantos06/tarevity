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

// Definindo interface apropriada para os props
interface PageParams {
  params: {
    id: string;
  };
  searchParams?: Record<string, string | string[]>;
}

// @ts-ignore - Ignorando verificação de tipo para resolver o conflito com os tipos internos do Next.js
export default function TodoDetailPageRoute(props: PageParams) {
  const id = props.params.id;

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