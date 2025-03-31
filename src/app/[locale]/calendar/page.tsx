import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Layout from '@/components/layout/Layout'
import Calendar from '@/components/calendar'

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const resolvedParams = await params

  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'CalendarPage.metadata',
  })

  return {
    title: t('title'),
    description: t('description'),
    robots: 'index, follow',
    keywords: t('keywords'),
  }
}

export default function CalendarPage() {
  return (
    <Layout>
      <div className="max-w-8xl mx-auto flex">
        <Calendar />
      </div>
    </Layout>
  )
}
