import { Suspense, use } from 'react'
import { Metadata, ResolvingMetadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Layout from '@/components/layout/Layout'
import TodoDetailPage from '@/components/todos/TodoDetailPage'

interface PageParams {
  params: Promise<{
    id: string
    locale: string
  }>
  searchParams?: Promise<Record<string, string | string[]>>
}

export async function generateMetadata(
  { params }: { params: Promise<{ locale: string; id: string }> },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const resolvedParams = await params

  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'TodoDetailPage.metadata',
  })

  return {
    title: t('title'),
    description: t('description'),
    robots: 'noindex, nofollow',
  }
}

export default function TodoDetailPageRoute(props: PageParams) {
  const params = use(props.params)
  const id = params.id

  return (
    <Layout>
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        }
      >
        <TodoDetailPage todoId={id} />
      </Suspense>
    </Layout>
  )
}
