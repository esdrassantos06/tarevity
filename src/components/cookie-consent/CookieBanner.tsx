'use client'

import React from 'react'
import CookieConsent from 'react-cookie-consent'
import { useTheme } from 'next-themes'
import TarevityIcon from '@/components/logo/TarevityIcon'

export default function CookieBanner() {
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept Cookies"
      cookieName="tarevity-cookie-consent"
      style={{
        background: isDark ? '#1d1929' : '#fff',
        color: isDark ? '#fff' : '#1d1929',
        boxShadow: '0 -4px 10px rgba(0, 0, 0, 0.1)',
        borderTop: isDark ? '1px solid #2d283a' : '1px solid #e8e8ea',
      }}
      buttonStyle={{
        background: '#003cff',
        color: '#fff',
        fontSize: '13px',
        padding: '8px 16px',
        borderRadius: '6px',
      }}
      declineButtonText="Decline"
      enableDeclineButton
      declineButtonStyle={{
        background: 'transparent',
        color: isDark ? '#fff' : '#1d1929',
        fontSize: '13px',
        padding: '8px 16px',
        border: isDark ? '1px solid #4a4754' : '1px solid #e8e8ea',
        borderRadius: '6px',
        marginRight: '10px',
      }}
      expires={150}
    >
      <TarevityIcon className="mr-4 inline w-10 dark:fill-white" />
      We use cookies to improve your experience on our site. By continuing to
      browse, you agree to our{' '}
      <a
        href="/privacy"
        style={{
          color: '#003cff',
          textDecoration: 'underline',
        }}
      >
        Privacy Policy
      </a>
      .
    </CookieConsent>
  )
}
