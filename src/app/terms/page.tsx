import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'

export const metadata: Metadata = {
  title: 'Terms of Use | Tarevity',
  description: 'Terms of use for Tarevity',
}

export default function TermsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        {/* Add component here */}
        <h1>Terms of Use</h1>
      </div>
    </Layout>
  )
}