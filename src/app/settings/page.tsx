import SettingsComponent from '@/components/settings/SettingsComponent'
import Layout from '@/components/layout/Layout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Configurações | Tarevity',
  description: 'Personalize suas configurações do Tarevity',
}

export default function SettingsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          Configurações
        </h1>
        <SettingsComponent />
      </div>
    </Layout>
  )
}
