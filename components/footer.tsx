'use client';

import { Link } from '@/i18n/navigation';
import { Icon } from '@iconify/react';
import { useTranslations } from 'next-intl';
import { Wordmark } from './logo/wordmark';

const linkClass =
  'text-muted-foreground hover:text-print text-sm transition-colors';

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
      className='border-print mt-auto w-full border-t-[3px] border-double'
      role='contentinfo'
      itemScope
      itemType='https://schema.org/WPFooter'
    >
      <div className='mx-auto grid w-full max-w-360 gap-10 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10'>
        <section
          className='flex flex-col gap-4'
          itemScope
          itemType='https://schema.org/Organization'
        >
          <Link
            href='/'
            aria-label={t('homepageAriaLabel')}
            title={t('homepageTitle')}
            itemProp='url'
            className='text-ink w-fit'
          >
            <Wordmark />
          </Link>
          <p
            className='typed text-muted-foreground text-xs'
            itemProp='copyrightHolder'
          >
            &copy; {currentYear} <span itemProp='name'>Tarevity</span>.{' '}
            {t('copyright')}
          </p>
        </section>

        <nav
          aria-labelledby='nav-heading'
          itemScope
          itemType='https://schema.org/SiteNavigationElement'
        >
          <h2 id='nav-heading' className='field-label mb-3'>
            {t('navigation.title')}
          </h2>
          <ul className='flex flex-col gap-2'>
            {navigation.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.path}
                  className={linkClass}
                  aria-label={t('navigation.goTo', { page: item.name })}
                  itemProp='url'
                >
                  <span itemProp='name'>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav
          aria-labelledby='legal-heading'
          itemScope
          itemType='https://schema.org/SiteNavigationElement'
        >
          <h2 id='legal-heading' className='field-label mb-3'>
            {t('legal.title')}
          </h2>
          <ul className='flex flex-col gap-2'>
            {legal.map((item) => (
              <li key={item.key}>
                <Link
                  href={item.path}
                  className={linkClass}
                  aria-label={t('legal.view', { page: item.name })}
                  itemProp='url'
                >
                  <span itemProp='name'>{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <section itemScope itemType='https://schema.org/ContactPoint'>
          <h2 className='field-label mb-3'>{t('contact.title')}</h2>
          <ul
            className='flex flex-col gap-2'
            aria-label={t('social.ariaLabel')}
          >
            <li>
              <a
                href='mailto:esdrasirion1@gmail.com'
                className={`${linkClass} inline-flex items-center gap-2`}
                aria-label={t('contact.emailAriaLabel', {
                  email: 'esdrasirion1@gmail.com',
                })}
                itemProp='email'
              >
                <Icon
                  icon='tabler:mail'
                  className='size-4'
                  aria-hidden='true'
                />
                {t('contact.email')}
              </a>
            </li>
            <li>
              <a
                href='https://github.com/esdrassantos06'
                target='_blank'
                rel='noopener noreferrer'
                className={`${linkClass} inline-flex items-center gap-2`}
                aria-label={t('social.githubAriaLabel')}
                itemProp='sameAs'
              >
                <Icon
                  icon='tabler:brand-github'
                  className='size-4'
                  aria-hidden='true'
                />
                {t('social.github')}
              </a>
            </li>
            <li>
              <a
                href='https://www.linkedin.com/in/esdrassantos06/'
                target='_blank'
                rel='noopener noreferrer'
                className={`${linkClass} inline-flex items-center gap-2`}
                aria-label={t('social.linkedinAriaLabel')}
                itemProp='sameAs'
              >
                <Icon
                  icon='tabler:brand-linkedin'
                  className='size-4'
                  aria-hidden='true'
                />
                {t('social.linkedin')}
              </a>
            </li>
          </ul>
        </section>
      </div>
      <div className='border-rule border-t'>
        <p className='typed text-muted-foreground mx-auto w-full max-w-360 px-4 py-4 text-xs sm:px-6 lg:px-10'>
          {t('imprint')}{' '}
          <a
            href='https://github.com/esdrassantos06'
            target='_blank'
            rel='noopener noreferrer author'
            className='text-ink hover:text-print decoration-rule underline underline-offset-4'
            aria-label={t('authorAriaLabel')}
            itemProp='author'
          >
            Esdras Santos
          </a>
        </p>
      </div>
    </footer>
  );
}
