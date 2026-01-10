'use client';

import { useTheme } from 'next-themes';
import CookieConsent from 'react-cookie-consent';
import { useTranslations } from 'next-intl';
import Link from 'next/link';

export default function CookieBanner() {
  const { resolvedTheme } = useTheme();
  const t = useTranslations('CookieBanner');

  const isDark = resolvedTheme === 'dark';

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
        background: isDark ? '#1d1929' : '#ffffff',
        color: isDark ? '#ffffff' : '#000000',
        padding: '1em',
        borderTop: `1px solid ${
          isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
        }`,
      }}
      buttonStyle={{
        color: '#ffffff',
        fontSize: '14px',
        fontWeight: '500',
        padding: '0.5rem 1rem',
        borderRadius: '9999px',
        border: 'none',
        cursor: 'pointer',
      }}
      declineButtonStyle={{
        color: isDark ? '#ffffff' : '#000000',
        fontSize: '14px',
        fontWeight: '500',
        padding: '0.5rem 1rem',
        borderRadius: '9999px',
        border: `1px solid ${
          isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'
        }`,
        cursor: 'pointer',
      }}
      expires={365}
    >
      <span role='status' aria-live='polite'>
        {t('message')}{' '}
        <Link
          href='/privacy'
          style={{ color: isDark ? '#bbbbbb' : '#0070f3' }}
          aria-label={t('learnMoreAriaLabel')}
          title={t('privacyPolicyTitle')}
        >
          {t('learnMore')}
        </Link>
      </span>
    </CookieConsent>
  );
}
