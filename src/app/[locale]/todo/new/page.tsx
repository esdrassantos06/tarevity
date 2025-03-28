import { Suspense } from 'react'
import { Metadata, ResolvingMetadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Layout from '@/components/layout/Layout'
import NewTodoPage from '@/components/todos/NewTodoPage'

type Params = Promise<{ locale: string }>

export async function generateMetadata(
  { params }: { params: Params },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const resolvedParams = await params

  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'NewTodoPAGE.metadata',
  })

  return {
    title: t('title'),
    description: t('description'),
    robots: 'noindex, nofollow',
  }
}

export default function NewTodoPageRoute() {
  return (
    <Layout>
      <Suspense
        fallback={
          <div className="flex h-64 items-center justify-center">
            <div className="size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          </div>
        }
      >
        <NewTodoPage />
      </Suspense>
    </Layout>
  )
}
