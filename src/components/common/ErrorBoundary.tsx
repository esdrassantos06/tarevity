'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { showError } from '@/lib/toast'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    showError('An unexpected error occurred. Please try refreshing the page.')
  }

  public render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center">
            <h2 className="mb-4 text-2xl font-bold text-red-600 dark:text-red-400">
              Something went wrong
            </h2>
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              We apologize for the inconvenience. Please try refreshing the
              page.
            </p>
            <button
              aria-label="Refresh Page"
              onClick={() => window.location.reload()}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              Refresh Page
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
