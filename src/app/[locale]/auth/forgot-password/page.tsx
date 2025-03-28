import dynamic from 'next/dynamic'
import { getTranslations } from 'next-intl/server'
import { useTranslations } from 'next-intl'
import { Metadata, ResolvingMetadata } from 'next'

// Update the params type to be a Promise
type Params = Promise<{ locale: string }>

export async function generateMetadata(
  { params }: { params: Params },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parent: ResolvingMetadata,
): Promise<Metadata> {
  // Await the params Promise to get the actual values
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
