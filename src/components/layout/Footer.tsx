// src/components/layout/Footer.tsx
import Link from 'next/link'
import { FaGithub, FaLinkedin, FaHeart } from 'react-icons/fa'
import TarevityLogo from '../logo/TarevityLogo'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-Footer relative z-99 mt-auto shadow-inner">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link
              href="/"
              className="text-xl font-bold text-blue-600 dark:text-blue-400"
            >
              <TarevityLogo className="w-30" textColor="fill-white" />
            </Link>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              &copy; {currentYear} Tarevity. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 gap-8 sm:gap-12">
            <div>
              <h3 className="text-FooterText text-sm font-semibold tracking-wider uppercase">
                Navigation
              </h3>
              <ul className="text-FooterText2 mt-4 space-y-2">
                <li>
                  <Link href="/" className="hover:text-FooterText2/70 text-base">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-FooterText2/70 text-base">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/profile" className="hover:text-FooterText2/70 text-base">
                    Profile
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-FooterText text-sm font-semibold tracking-wider uppercase">
                Legal
              </h3>
              <ul className="text-FooterText2 mt-4 space-y-2">
                <li>
                  <Link href="/privacy" className="hover:text-FooterText2/70text-base">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-FooterText2/70 text-base">
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-FooterText text-sm font-semibold tracking-wider uppercase">
                Contact
              </h3>
              <ul className="text-FooterText2 mt-4 space-y-2">
                <li>
                  <a
                    href="mailto:esdrasirion1@gmail.com"
                    target="_blank"
                    rel="noreferrer nooppener"
                    aria-label="Email"
                    className="text-base hover:text-blue-600"
                  >
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-FooterText text-sm font-semibold tracking-wider uppercase">
              Social Media
            </h3>
            <div className="mt-4 flex space-x-6">
              <a
                href="https://github.com/esdrassantos06"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white p-2.5 group bg-FooterIconsBG rounded-full"
              >
                <FaGithub className="h-7 group-hover:text-FooterText2/70 w-7" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/esdrassantos06"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white group flex items-center justify-center p-2.5 rounded-full bg-FooterIconsBG"
              >
                <FaLinkedin className="h-7 group-hover:text-FooterText2/70 w-7"/>
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Made with love */}
        <div className="border-FooterBorder mt-8 border-t pt-6">
          <p className="flex items-center justify-center text-center text-sm text-FooterText2">
            Made with <FaHeart className="mx-1 h-4 w-4 text-red-500" /> by{' '}
            <a
              href="https://github.com/esdrassantos06"
              target="_blank"
              rel="noopener noreferrer"
              className="text-FooterText2 ml-1 hover:text-FooterText2/80"
            >
              Esdras
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
