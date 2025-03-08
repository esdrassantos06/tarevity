import SettingsComponent from '@/components/settings/SettingsComponent';
import Layout from '@/components/layout/Layout';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Configurações | Tarevity',
  description: 'Personalize suas configurações do Tarevity',
};

export default function SettingsPage() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Configurações</h1>
        <SettingsComponent />
      </div>
    </Layout>
  );
}