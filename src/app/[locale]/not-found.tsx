import NotFoundComponent from '@/components/not-found/NotFoundComponent'
import { Metadata, ResolvingMetadata } from 'next'
import { getTranslations } from 'next-intl/server'

type Params = Promise<{ locale: string }>

export async function generateMetadata(
  { params }: { params: Params },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const resolvedParams = await params

  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'NotFoundPage.metadata',
  })

  return {
    title: t('title'),
    description: t('description'),
    robots: 'noindex, nofollow',
  }
}

export default async function NotFound() {
  return <NotFoundComponent />
}
