// src/components/layout/Footer.tsx
import Link from 'next/link';
import { FaGithub, FaLinkedin, FaHeart } from 'react-icons/fa';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white shadow-inner relative z-99 dark:bg-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center md:items-start">
            <Link href="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
              Tarevity
            </Link>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              &copy; {currentYear} Tarevity. Todos os direitos reservados.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 sm:gap-12">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
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
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
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
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
              Redes Sociais
            </h3>
            <div className="flex space-x-6 mt-4">
              <a 
                href="https://github.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
              >
                <FaGithub className="h-6 w-6" />
                <span className="sr-only">GitHub</span>
              </a>
              <a 
                href="https://linkedin.com/in/yourprofile" 
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
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center">
            Feito com <FaHeart className="h-4 w-4 text-red-500 mx-1" /> usando Next.js, Supabase e Tailwind CSS
          </p>
        </div>
      </div>
    </footer>
  );
}