// Para src/app/todo/[id]/edit/page.tsx

import { Suspense } from 'react'
import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'
import TodoEditPage from '@/components/todos/TodoEditPage'

export const metadata: Metadata = {
  title: 'Edit Task | Tarevity',
  description:
    'Modify task details, update due dates, change priority levels, or edit descriptions.',
  robots: 'noindex, nofollow',
}

// Use a definição de tipo correta conforme a documentação
type Props = {
  params: { id: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default function TodoEditPageRoute(props: Props) {
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
        <TodoEditPage todoId={id} />
      </Suspense>
    </Layout>
  )
}