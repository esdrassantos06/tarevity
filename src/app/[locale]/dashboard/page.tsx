import { Metadata } from 'next'
import { Suspense } from 'react'
import { getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import Layout from '@/components/layout/Layout'
import TodoList from '@/components/todos/TodoList'

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const resolvedParams = await params

  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'DashboardPage.metadata',
  })

  return {
    title: t('title'),
    description: t('description'),
    robots: 'index, follow',
  }
}

export default function DashboardPage() {
  const t = useTranslations('DashboardPage')

  const DashboardLoading = () => (
    <div className="flex h-64 items-center justify-center">
      <div
        className="size-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"
        role="status"
      >
        <span className="sr-only">{t('loading')}</span>
      </div>
    </div>
  )

  return (
    <Layout>
      <div className="mx-auto max-w-7xl">
        <Suspense fallback={<DashboardLoading />}>
          <TodoList />
        </Suspense>
      </div>
    </Layout>
  )
}
