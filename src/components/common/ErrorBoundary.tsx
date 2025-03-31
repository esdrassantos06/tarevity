'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { showError } from '@/lib/toast'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  t?: {
    errorHeading: string
    errorMessage: string
    refreshButton: string
    toastMessage: string
  }
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  private defaultT = {
    errorHeading: 'Something went wrong',
    errorMessage:
      'We apologize for the inconvenience. Please try refreshing the page.',
    refreshButton: 'Refresh Page',
    toastMessage:
      'An unexpected error occurred. Please try refreshing the page.',
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    const { t } = this.props
    showError(t?.toastMessage || this.defaultT.toastMessage)
  }

  public render() {
    if (this.state.hasError) {
      const { t } = this.props

      return (
        this.props.fallback || (
          <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
              {t?.errorHeading || this.defaultT.errorHeading}
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              {t?.errorMessage || this.defaultT.errorMessage}
            </p>
            <button
              aria-label={t?.refreshButton || this.defaultT.refreshButton}
              onClick={() => window.location.reload()}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {t?.refreshButton || this.defaultT.refreshButton}
            </button>
          </div>
        )
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
