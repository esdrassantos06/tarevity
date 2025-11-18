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
      }}
      buttonStyle={{
        color: '#ffffff',
        background: 'oklch(0.496 0.284 263.9)',
        fontSize: '14px',
        marginLeft: '0.25em',
        borderRadius: '0.375rem',
        border: 'none',
        cursor: 'pointer',
      }}
      declineButtonStyle={{
        color: isDark ? '#ffffff' : '#000000',
        background: 'transparent',
        fontSize: '14px',
        marginLeft: '0.25em',
        borderRadius: '0.375rem',
        border: `1px solid ${
          isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.7)'
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
