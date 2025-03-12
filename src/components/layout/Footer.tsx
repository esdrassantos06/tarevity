// src/components/layout/Footer.tsx
import Link from 'next/link'
import { FaGithub, FaLinkedin, FaHeart } from 'react-icons/fa'
import TarevityLogo from '../logo/TarevityLogo'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="dark:bg-FooterBgDark bg-FooterBgLight relative z-99 mt-auto shadow-inner">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link href="/" aria-label="Tarevity Logo">
              <TarevityLogo className="w-30 fill-black dark:fill-white" />
            </Link>
            <p className="text-GraySecondaryLight dark:text-GrayDark mt-2 text-sm">
              &copy; {currentYear} Tarevity. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-3 gap-8 sm:gap-12">
            <div>
              <h3 className="text-BlackLight text-sm font-semibold tracking-wider uppercase dark:text-white">
                Navigation
              </h3>
              <ul className="text-DescriptionLight dark:text-GrayDark mt-4 space-y-2">
                <li>
                  <Link
                    href="/"
                    className="hover:text-DescriptionLight/80 text-base transition-all duration-300"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard"
                    className="hover:text-DescriptionLight/80 text-base transition-all duration-300"
                  >
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/profile"
                    className="hover:text-DescriptionLight/80 text-base transition-all duration-300"
                  >
                    Profile
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-BlackLight text-sm font-semibold tracking-wider uppercase dark:text-white">
                Legal
              </h3>
              <ul className="text-DescriptionLight dark:text-GrayDark mt-4 space-y-2">
                <li>
                  <Link
                    href="/privacy"
                    className="hover:text-DescriptionLight/80 text-base transition-all duration-300"
                  >
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms"
                    className="hover:text-DescriptionLight/80 text-base transition-all duration-300"
                  >
                    Terms of Use
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-BlackLight text-sm font-semibold tracking-wider uppercase dark:text-white">
                Contact
              </h3>
              <ul className="text-DescriptionLight dark:text-GrayDark mt-4 space-y-2">
                <li>
                  <a
                    href="mailto:esdrasirion1@gmail.com"
                    target="_blank"
                    rel="noreferrer nooppener"
                    aria-label="Email"
                    className="hover:text-primary text-base transition-all duration-300"
                  >
                    Email
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="text-BlackLight text-sm font-semibold tracking-wider uppercase dark:text-white">
              Social Media
            </h3>
            <div className="mt-4 flex space-x-6">
              <a
                href="https://github.com/esdrassantos06"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-bgDark hover:bg-bgDark/80 rounded-full p-2.5 text-white transition-all duration-300"
              >
                <FaGithub className="h-7 w-7" />
                <span className="sr-only">GitHub</span>
              </a>
              <a
                href="https://linkedin.com/in/esdrassantos06"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-bgDark hover:bg-bgDark/80 flex items-center justify-center rounded-full p-2.5 text-white transition-all duration-300"
              >
                <FaLinkedin className="h-7 w-7" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </div>
          </div>
        </div>

        {/* Made with love */}
        <div className="border-BorderLight dark:border-BorderDark mt-8 border-t pt-6">
          <p className="text-BlackLight flex items-center justify-center text-center text-sm dark:text-white">
            Made with <FaHeart className="mx-1 h-4 w-4 text-red-500" /> by{' '}
            <a
              href="https://github.com/esdrassantos06"
              target="_blank"
              rel="noopener noreferrer"
              className="ml-1"
            >
              Esdras
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
