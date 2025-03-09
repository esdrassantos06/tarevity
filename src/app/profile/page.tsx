import ProfileComponent from '@/components/profile/ProfileComponent'
import Layout from '@/components/layout/Layout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Perfil | Tarevity',
  description: 'Gerencie suas informações de perfil',
}

export default function ProfilePage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          Meu Perfil
        </h1>
        <ProfileComponent />
      </div>
    </Layout>
  )
}
