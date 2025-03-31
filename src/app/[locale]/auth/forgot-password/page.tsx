import dynamic from 'next/dynamic'
import { getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { Metadata } from 'next'

type Params = Promise<{ locale: string }>

export async function generateMetadata({
  params,
}: {
  params: Params
}): Promise<Metadata> {
  const resolvedParams = await params

  const t = await getTranslations({
    locale: resolvedParams.locale,
    namespace: 'ForgotPasswordPage',
  })

  return {
    title: t('title'),
    description: t('description'),
  }
}

export default function ForgotPasswordPage() {
  const t = useTranslations('ForgotPasswordPage')

  const ForgotPasswordForm = dynamic(
    () => import('@/components/auth/ForgotPasswordForm'),
    {
      loading: () => <div className="text-center">{t('loading')}</div>,
    },
  )

  return <ForgotPasswordForm />
}
