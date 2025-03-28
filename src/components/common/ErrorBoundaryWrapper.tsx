'use client'

import React from 'react'
import ErrorBoundary from './ErrorBoundary'
import { useTranslations } from 'next-intl'

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function ErrorBoundaryWithIntl({
  children,
  fallback,
}: ErrorBoundaryWrapperProps) {
  const t = useTranslations('errorBoundary')

  const translations = {
    errorHeading: t('errorHeading'),
    errorMessage: t('errorMessage'),
    refreshButton: t('refreshButton'),
    toastMessage: t('toastMessage'),
  }

  return (
    <ErrorBoundary t={translations} fallback={fallback}>
      {children}
    </ErrorBoundary>
  )
}
