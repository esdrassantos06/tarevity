import Link from 'next/link'
import { LuGithub, LuLinkedin, LuHeart, LuMail } from 'react-icons/lu'
import TarevityLogo from '../logo/TarevityLogo'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="dark:bg-FooterBgDark bg-FooterBgLight relative z-99 mt-auto border-t">
      <div className="px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Logo and Copyright */}
          <div className="flex flex-col items-center gap-2 md:items-start">
            <Link href="/" aria-label="Tarevity Logo">
              <TarevityLogo className="w-30 fill-black dark:fill-white" />
            </Link>
            <p className="text-GraySecondaryLight dark:text-GrayDark mt-2 text-sm">
              &copy; {currentYear} Tarevity. All rights reserved.
            </p>
          </div>

          {/* Navigation and Legal */}
          <div>
            <h3 className="text-BlackLight text-lg font-medium dark:text-white">
              Navigation
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/profile"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-BlackLight text-lg font-medium dark:text-white">
              Legal
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link
                  href="/privacy"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-muted-foreground hover:text-foreground transition-all duration-300"
                >
                  Terms of Use
                </Link>
              </li>
            </ul>
          </div>

          {/* Social Media and contact */}
          <div className="flex flex-col space-y-4">
            <div>
              <h3 className="text-BlackLight text-lg font-medium dark:text-white">
                Contact
              </h3>
              <ul className="mt-2 flex gap-4">
                <li>
                  <a
                    href="mailto:esdrasirion1@gmail.com"
                    target="_blank"
                    rel="noreferrer nooppener"
                    aria-label="Email"
                    className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-all duration-300"
                  >
                    <LuMail className="size-5" /> Email
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-BlackLight text-lg font-medium dark:text-white">
                Social Media
              </h3>
              <div className="mt-2 flex gap-4">
                <a
                  aria-label="GitHub"
                  href="https://github.com/esdrassantos06"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-muted-foreground hover:text-foreground rounded-full transition-all duration-300"
                >
                  <LuGithub className="size-6" />
                  <span className="sr-only">GitHub</span>
                </a>
                <a
                  aria-label="LinkedIn"
                  href="https://linkedin.com/in/esdrassantos06"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group text-muted-foreground hover:text-foreground flex items-center justify-center rounded-full transition-all duration-300"
                >
                  <LuLinkedin className="size-6" />
                  <span className="sr-only">LinkedIn</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Made with love */}
        <div className="mt-8 flex items-center justify-center border-t pt-6">
          <p className="text-BlackLight flex items-center gap-1 text-sm dark:text-white">
            Made with <LuHeart className="size-4 text-red-500" /> by
            <a
              aria-label={`Esdras's Github`}
              href="https://github.com/esdrassantos06"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium hover:underline"
            >
              Esdras
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
