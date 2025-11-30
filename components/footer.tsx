'use client';

import { Link } from '@/i18n/navigation';
import Logo from './logo/full-logo';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import { FadeIn } from './fade-in';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const t = useTranslations('Footer');

  const navigation = [
    { name: t('navigation.home'), path: '/', key: 'home' },
    { name: t('navigation.dashboard'), path: '/dashboard', key: 'dashboard' },
    { name: t('navigation.profile'), path: '/profile', key: 'profile' },
    { name: t('navigation.settings'), path: '/settings', key: 'settings' },
  ];

  const legal = [
    { name: t('legal.privacy'), path: '/privacy', key: 'privacy' },
    { name: t('legal.terms'), path: '/terms', key: 'terms' },
  ];

  return (
    <footer
      className='w-full border-t bg-white dark:bg-[#0f0d15]'
      role='contentinfo'
      itemScope
      itemType='https://schema.org/WPFooter'
    >
      <div className='container mx-auto px-4 py-8'>
        {/* Main Content Grid */}
        <FadeIn direction='up' staggerChildren={0.1} once={true}>
          <div className='grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4'>
            {/* Brand Section */}
            <section
              className='flex flex-col items-center gap-3 sm:items-start'
              itemScope
              itemType='https://schema.org/Organization'
            >
              <Link
                href='/'
                aria-label={t('homepageAriaLabel')}
                title={t('homepageTitle')}
                itemProp='url'
              >
                <Logo className='w-32 fill-black dark:fill-white' />
              </Link>
              <p
                className='text-center text-sm text-[#77757f] sm:text-left'
                itemProp='copyrightHolder'
              >
                &copy; {currentYear} <span itemProp='name'>Tarevity</span>.{' '}
                {t('copyright')}
              </p>
            </section>

            {/* Navigation Section */}
            <nav
              className='flex flex-col items-center gap-4 sm:items-start'
              aria-labelledby='nav-heading'
              role='navigation'
              itemScope
              itemType='https://schema.org/SiteNavigationElement'
            >
              <h2
                id='nav-heading'
                className='text-foreground text-base font-semibold sm:text-lg'
              >
                {t('navigation.title')}
              </h2>
              <ul
                className='flex flex-col gap-2 text-center sm:text-left'
                role='list'
              >
                {navigation.map((item) => (
                  <li key={item.key} role='listitem'>
                    <Link
                      href={item.path}
                      className='text-muted-foreground hover:text-foreground text-sm transition-colors duration-300'
                      aria-label={t('navigation.goTo', { page: item.name })}
                      title={item.name}
                      itemProp='url'
                    >
                      <span itemProp='name'>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Legal Section */}
            <nav
              className='flex flex-col items-center gap-4 sm:items-start'
              aria-labelledby='legal-heading'
              role='navigation'
              itemScope
              itemType='https://schema.org/SiteNavigationElement'
            >
              <h2
                id='legal-heading'
                className='text-foreground text-base font-semibold sm:text-lg'
              >
                {t('legal.title')}
              </h2>
              <ul
                className='flex flex-col gap-2 text-center sm:text-left'
                role='list'
              >
                {legal.map((item) => (
                  <li key={item.key} role='listitem'>
                    <Link
                      href={item.path}
                      className='text-muted-foreground hover:text-foreground text-sm transition-colors duration-300'
                      aria-label={t('legal.view', { page: item.name })}
                      title={item.name}
                      itemProp='url'
                    >
                      <span itemProp='name'>{item.name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Contact & Social Section */}
            <section
              className='flex flex-col items-center gap-6 sm:items-start'
              itemScope
              itemType='https://schema.org/ContactPoint'
            >
              {/* Contact */}
              <div className='flex flex-col gap-3'>
                <h2 className='text-foreground text-base font-semibold sm:text-lg'>
                  {t('contact.title')}
                </h2>
                <a
                  href='mailto:esdrasirion1@gmail.com'
                  className='text-muted-foreground hover:text-foreground flex items-center gap-2 text-sm transition-colors duration-300'
                  aria-label={t('contact.emailAriaLabel', {
                    email: 'esdrasirion1@gmail.com',
                  })}
                  title={t('contact.contactUs')}
                  itemProp='email'
                >
                  <Icon
                    icon='mdi:email-outline'
                    className='size-5'
                    aria-hidden='true'
                  />
                  <span>{t('contact.email')}</span>
                </a>
              </div>

              {/* Social Media */}
              <div className='flex flex-col gap-3'>
                <h2 className='text-foreground text-base font-semibold sm:text-lg'>
                  {t('social.title')}
                </h2>
                <div
                  className='flex items-center justify-center gap-4 sm:justify-start'
                  role='list'
                  aria-label={t('social.ariaLabel')}
                >
                  <a
                    href='https://github.com/esdrassantos06'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground hover:text-foreground transition-colors duration-300'
                    aria-label={t('social.githubAriaLabel')}
                    title={t('social.github')}
                    itemProp='sameAs'
                  >
                    <Icon
                      icon='mdi:github'
                      className='size-6'
                      aria-hidden='true'
                    />
                  </a>
                  <a
                    href='https://www.linkedin.com/in/esdrassantos06/'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-muted-foreground hover:text-foreground transition-colors duration-300'
                    aria-label={t('social.linkedinAriaLabel')}
                    title={t('social.linkedin')}
                    itemProp='sameAs'
                  >
                    <Icon
                      icon='basil:linkedin-outline'
                      className='size-6'
                      aria-hidden='true'
                    />
                  </a>
                </div>
              </div>
            </section>
          </div>

          {/* Bottom Section */}
          <div className='mt-8 flex items-center justify-center border-t pt-6'>
            <p className='flex items-center gap-1 text-sm text-[#0f0d15] dark:text-white'>
              {t('madeWith')}{' '}
              <Icon
                icon='mdi:heart-outline'
                className='size-4 text-red-500'
                aria-label={t('love')}
                aria-hidden='true'
              />{' '}
              {t('by')}
              <a
                href='https://github.com/esdrassantos06'
                target='_blank'
                rel='noopener noreferrer author'
                className='font-medium hover:underline'
                aria-label={t('authorAriaLabel')}
                title={t('authorTitle')}
                itemProp='author'
                itemScope
                itemType='https://schema.org/Person'
              >
                Esdras Santos
              </a>
            </p>
          </div>
        </FadeIn>
      </div>
    </footer>
  );
}
