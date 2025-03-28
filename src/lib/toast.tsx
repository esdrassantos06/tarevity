'use client'

import { toast, ToastOptions, UpdateOptions } from 'react-toastify'
import {
  FaCheck,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
} from 'react-icons/fa'

const defaultOptions: ToastOptions = {
  position: 'top-right',
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
}

export const showSuccess = (message: string, options?: ToastOptions) => {
  return toast.success(message, {
    ...defaultOptions,
    icon: <FaCheck />,
    ...options,
  })
}

export const showError = (message: string, options?: ToastOptions) => {
  const displayMessage =
    typeof message === 'string' ? message : 'An error occurred'
  return toast.error(displayMessage, {
    ...defaultOptions,
    icon: <FaTimes />,
    ...options,
  })
}

export const showWarning = (message: string, options?: ToastOptions) => {
  return toast.warning(message, {
    ...defaultOptions,
    icon: <FaExclamationTriangle />,
    ...options,
  })
}

export const showInfo = (message: string, options?: ToastOptions) => {
  return toast.info(message, {
    ...defaultOptions,
    icon: <FaInfoCircle />,
    ...options,
  })
}

export const updateToast = (
  toastId: string | number,
  message: string,
  options?: UpdateOptions,
) => {
  toast.update(toastId, {
    render: message,
    ...options,
  })
}

export const showLoading = (message: string, options?: ToastOptions) => {
  return toast.loading(message || 'Loading...', {
    ...defaultOptions,
    autoClose: false,
    ...options,
  })
}

export const dismissAll = () => {
  toast.dismiss()
}

export const handleError = (error: unknown, fallbackMessage?: string) => {
  const processFallback = fallbackMessage || 'Something went wrong'

  if (error instanceof Error) {
    showError(error.message)
  } else if (typeof error === 'string') {
    showError(error)
  } else if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error
  ) {
    showError((error as { message: string }).message)
  } else {
    showError(processFallback)
  }
}
