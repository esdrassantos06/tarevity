import Link from 'next/link';
import { FaCheckCircle, FaBell, FaLock, FaMobileAlt } from 'react-icons/fa';
import Layout from '@/components/layout/Layout';

export default function HomePage() {
  return (
    <Layout>
      <div className="py-12">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              <span className="block">Tarevity</span>
              <span className="block text-blue-600 dark:text-blue-400">Gerencie suas tarefas com eficiência</span>
            </h1>
            <p className="mt-3 max-w-md mx-auto text-lg text-gray-600 dark:text-gray-300 sm:text-xl md:mt-5 md:max-w-3xl">
              Organize suas tarefas, defina prioridades e nunca mais esqueça de prazos importantes. Uma maneira simples e eficiente de aumentar sua produtividade.
            </p>
            <div className="mt-10 flex justify-center">
              <div className="rounded-md shadow">
                <Link
                  href="/auth/register"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10"
                >
                  Comece Agora - É Grátis!
                </Link>
              </div>
              <div className="ml-3 rounded-md shadow">
                <Link
                  href="/auth/login"
                  className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700 md:py-4 md:text-lg md:px-10"
                >
                  Fazer Login
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-12 bg-white dark:bg-gray-800 mt-10 rounded-lg shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-blue-600 dark:text-blue-400 font-semibold tracking-wide uppercase">Recursos</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                Tudo que você precisa para se manter organizado
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                {/* Feature 1 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <FaCheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Gerenciamento de tarefas simples</h3>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                      Adicione, edite e marque tarefas como concluídas com facilidade. Interface intuitiva e fácil de usar.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <FaBell className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Nunca perca um prazo</h3>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                      Defina datas de vencimento para suas tarefas e mantenha-se no controle de seus compromissos.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <FaLock className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Seguro e privado</h3>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                      Suas tarefas são armazenadas com segurança. Login com GitHub e Google para maior conveniência.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                      <FaMobileAlt className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Acesse de qualquer lugar</h3>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                      Design responsivo que funciona em todos os dispositivos. Suas tarefas estão sempre ao seu alcance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-blue-600 dark:bg-blue-700 mt-10 rounded-lg shadow-lg">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Pronto para se organizar?</span>
              <span className="block">Comece a usar o Tarevity hoje.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-100">
              Cadastre-se gratuitamente e experimente todos os recursos do Tarevity.
            </p>
            <Link
              href="/auth/register"
              className="mt-8 w-full inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 sm:w-auto"
            >
              Criar Conta Gratuita
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}