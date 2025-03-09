import { Metadata } from 'next'
import Layout from '@/components/layout/Layout'

export const metadata: Metadata = {
  title: 'Privacidade | Tarevity',
  description: 'Termos de privacidade e segurança',
}

export default function PrivacyPage() {
  return (
    <Layout>
      <div className="mx-auto max-w-4xl">
        {/* Adicionar componente aqui */}
        <h1>Privacidade</h1>
      </div>
    </Layout>
  )
}
