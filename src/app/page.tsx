import Link from 'next/link'
import { FaCheckCircle, FaBell, FaLock, FaMobileAlt } from 'react-icons/fa'
import Layout from '@/components/layout/Layout'

export default function HomePage() {
  return (
    <Layout>
      <div className="py-12">
        {/* Hero Section */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl dark:text-white">
              <span className="block">Tarevity</span>
              <span className="block text-blue-600 dark:text-blue-400">
                Gerencie suas tarefas com eficiência
              </span>
            </h1>
            <p className="mx-auto mt-3 max-w-md text-lg text-gray-600 sm:text-xl md:mt-5 md:max-w-3xl dark:text-gray-300">
              Organize suas tarefas, defina prioridades e nunca mais esqueça de
              prazos importantes. Uma maneira simples e eficiente de aumentar
              sua produtividade.
            </p>
            <div className="mt-10 flex justify-center">
              <div className="rounded-md shadow">
                <Link
                  href="/auth/register"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-8 py-3 text-base font-medium text-white hover:bg-blue-700 md:px-10 md:py-4 md:text-lg"
                >
                  Comece Agora - É Grátis!
                </Link>
              </div>
              <div className="ml-3 rounded-md shadow">
                <Link
                  href="/auth/login"
                  className="flex w-full items-center justify-center rounded-md border border-transparent bg-white px-8 py-3 text-base font-medium text-blue-600 hover:bg-gray-50 md:px-10 md:py-4 md:text-lg dark:bg-gray-800 dark:text-blue-400 dark:hover:bg-gray-700"
                >
                  Fazer Login
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-cardLightMode dark:bg-cardDarkMode mt-10 rounded-lg py-12 shadow-lg">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base font-semibold tracking-wide text-blue-600 uppercase dark:text-blue-400">
                Recursos
              </h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl dark:text-white">
                Tudo que você precisa para se manter organizado
              </p>
            </div>

            <div className="mt-10">
              <div className="space-y-10 md:grid md:grid-cols-2 md:space-y-0 md:gap-x-8 md:gap-y-10">
                {/* Feature 1 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                      <FaCheckCircle className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Gerenciamento de tarefas simples
                    </h3>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                      Adicione, edite e marque tarefas como concluídas com
                      facilidade. Interface intuitiva e fácil de usar.
                    </p>
                  </div>
                </div>

                {/* Feature 2 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                      <FaBell className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Nunca perca um prazo
                    </h3>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                      Defina datas de vencimento para suas tarefas e mantenha-se
                      no controle de seus compromissos.
                    </p>
                  </div>
                </div>

                {/* Feature 3 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                      <FaLock className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Seguro e privado
                    </h3>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                      Suas tarefas são armazenadas com segurança. Login com
                      GitHub e Google para maior conveniência.
                    </p>
                  </div>
                </div>

                {/* Feature 4 */}
                <div className="flex">
                  <div className="flex-shrink-0">
                    <div className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-500 text-white">
                      <FaMobileAlt className="h-6 w-6" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
                      Acesse de qualquer lugar
                    </h3>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300">
                      Design responsivo que funciona em todos os dispositivos.
                      Suas tarefas estão sempre ao seu alcance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-10 rounded-lg bg-blue-600 shadow-lg dark:bg-blue-700">
          <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 sm:py-20 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">Pronto para se organizar?</span>
              <span className="block">Comece a usar o Tarevity hoje.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-blue-100">
              Cadastre-se gratuitamente e experimente todos os recursos do
              Tarevity.
            </p>
            <Link
              href="/auth/register"
              className="mt-8 inline-flex w-full items-center justify-center rounded-md border border-transparent bg-white px-5 py-3 text-base font-medium text-blue-600 hover:bg-blue-50 sm:w-auto"
            >
              Criar Conta Gratuita
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  )
}
