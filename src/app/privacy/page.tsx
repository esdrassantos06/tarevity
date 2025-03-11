import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'

export const metadata: Metadata = {
  title: 'Data Protection & Privacy Commitment | Tarevity',
  description: 'Understand how Tarevity safeguards your data with end-to-end encryption, secure storage practices, and transparent usage policies.',
  keywords: ['data privacy', 'information security', 'user data protection', 'privacy policy'],
  robots: 'index, follow'
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