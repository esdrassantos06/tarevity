import { MetadataRoute } from 'next'
import { getTranslations } from 'next-intl/server'

export default async function manifest({
  params,
}: {
  params: { locale: string }
}): Promise<MetadataRoute.Manifest> {
  const t = await getTranslations({
    locale: params.locale,
    namespace: 'Manifest',
  })

  return {
    name: t('name'),
    short_name: t('shortName'),
    description: t('description'),
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#003cff',
    orientation: 'portrait',
    lang: params.locale === 'en' ? 'en' : 'pt-br',
    categories: t('categories')
      .split(',')
      .map((category) => category.trim()),
    screenshots: [
      {
        src: '/screenshots/dashboard.png',
        sizes: '1280x720',
        type: 'image/png',
        label: t('screenshotLabel'),
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
    shortcuts: [
      {
        name: t('shortcuts.newTask.name'),
        url: '/todo/new',
        description: t('shortcuts.newTask.description'),
      },
      {
        name: t('shortcuts.dashboard.name'),
        url: '/dashboard',
        description: t('shortcuts.dashboard.description'),
      },
    ],
  }
}
