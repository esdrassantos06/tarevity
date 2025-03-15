import ProfileComponent from '@/components/profile/main/ProfileComponent'
import Layout from '@/components/layout/Layout'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Your Profile & Productivity Statistics | Tarevity',
  description:
    'Review your personalized task analytics, completion metrics, and account settings. Gain insights into your productivity patterns.',
  robots: 'noindex, nofollow',
}

export default function ProfilePage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
          My Profile
        </h1>
        <ProfileComponent />
      </div>
    </Layout>
  )
}
