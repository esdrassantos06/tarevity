import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'

export const metadata: Metadata = {
 title: 'Privacy | Tarevity',
 description: 'Privacy and security terms',
}

export default function PrivacyPage() {
 return (
   <Layout>
     <div className="mx-auto max-w-4xl">
       {/* Add component here */}
       <h1>Privacy</h1>
     </div>
   </Layout>
 )
}