'use client';

import CookieConsent from 'react-cookie-consent';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function CookieBanner() {
  const t = useTranslations('CookieBanner');

  return (
    <CookieConsent
      location='bottom'
      buttonText={t('accept')}
      declineButtonText={t('decline')}
      enableDeclineButton
      cookieName='tarevity-cookie-consent'
      aria-label={t('ariaLabel')}
      aria-modal='false'
      style={{
        background: 'var(--card)',
        color: 'var(--foreground)',
        padding: '0.75rem 1rem',
        borderTop: '3px double var(--print)',
        alignItems: 'center',
        fontSize: '14px',
      }}
      buttonStyle={{
        fontFamily: 'var(--font-archivo)',
        fontSize: '14px',
        fontWeight: '600',
        padding: '0.5rem 1rem',
        borderRadius: '3px',
        border: 'none',
        cursor: 'pointer',
      }}
      declineButtonStyle={{
        color: 'var(--foreground)',
        fontFamily: 'var(--font-archivo)',
        fontSize: '14px',
        fontWeight: '600',
        padding: '0.5rem 1rem',
        borderRadius: '3px',
        border: '1px solid var(--input)',
        cursor: 'pointer',
      }}
      expires={365}
    >
      <span role='status' aria-live='polite'>
        {t('message')}{' '}
        <Link
          href='/privacy'
          style={{ color: 'var(--print)', textDecoration: 'underline' }}
          aria-label={t('learnMoreAriaLabel')}
          title={t('privacyPolicyTitle')}
        >
          {t('learnMore')}
        </Link>
      </span>
    </CookieConsent>
  );
}
