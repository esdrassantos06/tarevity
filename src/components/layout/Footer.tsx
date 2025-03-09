// src/components/layout/Footer.tsx
import Link from 'next/link'
import { FaGithub, FaLinkedin, FaHeart } from 'react-icons/fa'
import TarevityLogo from '../logo/TarevityLogo'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-footerLightMode dark:bg-footerDarkMode relative z-99 mt-auto shadow-inner">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link
              href="/"
              className="text-xl font-bold text-blue-600 dark:text-blue-400"
            >
              <TarevityLogo className="w-30" />
            </Link>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              &copy; {currentYear} Tarevity. Todos os direitos reservados.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 gap-8 sm:gap-12">
            <div>
              <h3 className="text-sm font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                Navegação
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/"
                    className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    Início
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    Perfil
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                Legal
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
                Contact
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    Privacidade
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="text-base text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                  >
                    Termos de Uso
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-sm font-semibold tracking-wider text-gray-700 uppercase dark:text-gray-300">
              Redes Sociais
            </h3>
            <div className="mt-4 flex space-x-6">
              <a
                href="https://github.com/esdrassantos06"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <FaGithub className="h-6 w-6" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/esdrassantos06"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <FaLinkedin className="h-6 w-6" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Made with love */}
        <div className="border-borderLight dark:border-borderDark mt-8 border-t pt-6">
          <p className="flex items-center justify-center text-center text-sm text-gray-500 dark:text-gray-400">
            Feito com <FaHeart className="mx-1 h-4 w-4 text-red-500" /> por{' '}
            <a
              href="https://github.com/esdrassantos06"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            >
              Esdras
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
