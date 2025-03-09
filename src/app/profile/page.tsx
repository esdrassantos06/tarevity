import ProfileComponent from '@/components/profile/ProfileComponent'
import Layout from '@/components/layout/Layout'
import { Metadata } from 'next'

export const metadata: Metadata = {
 title: 'Profile | Tarevity',
 description: 'Manage your profile information',
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