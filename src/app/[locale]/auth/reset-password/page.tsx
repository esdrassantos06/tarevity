import { Metadata, ResolvingMetadata } from 'next'
import dynamic from 'next/dynamic'
import { getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'

type Params = Promise<{ locale: string }>

export async function generateMetadata(
  { params }: { params: Params },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // Extraindo o valor do Promise
  const resolvedParams = await params

  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'ResetPasswordPage.metadata',
  })

  return {
    title: t('title'),
    description: t('description'),
    robots: 'noindex, nofollow',
  }
}

export default function ResetPasswordPage() {
  const t = useTranslations('ResetPasswordPage')

  const ResetPasswordForm = dynamic(
    () => import('@/components/auth/ResetPasswordForm'),
    {
      loading: () => <div className="text-center">{t('loading')}</div>,
    },
  )

  return <ResetPasswordForm />
}
