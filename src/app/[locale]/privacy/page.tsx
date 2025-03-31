import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import Layout from '@/components/layout/Layout'
import PrivacyPolicyComponent from '@/components/privacy/PrivacyPolicyComponent'

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const resolvedParams = await params

  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'PrivacyPage.metadata',
  })

  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    robots: 'index, follow',
  }
}

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <PrivacyPolicyComponent />
      </div>
    </Layout>
  )
}
