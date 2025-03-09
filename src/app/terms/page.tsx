import { Metadata } from 'next';
import Layout from '@/components/layout/Layout';

export const metadata: Metadata = {
    title: 'Termos de Uso | Tarevity',
    description: 'Termos de uso do Tarevity',
  };

  export default function TermsPage() {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto">
          {/* Adicionar componente aqui */}
            <h1>Termos de Uso</h1>
        </div>
      </Layout>
    );
  }