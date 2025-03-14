import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'
import TermsOfUseComponent from '@/components/terms/TermsComponent'

export const metadata: Metadata = {
  title: 'Terms of Service & User Agreement | Tarevity',
  description:
    'Review our detailed terms of service covering user responsibilities, data ownership, acceptable use policies, and service limitations.',
  keywords: [
    'terms of service',
    'user agreement',
    'legal terms',
    'data ownership',
  ],
  robots: 'index, follow',
}

export default function TermsPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        <TermsOfUseComponent />
      </div>
    </Layout>
  )
}
