'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/common/Dialog'

type DialogVariant = 'danger' | 'warning' | 'info' | 'primary'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: DialogVariant
  isLoading?: boolean
}

export function useConfirmationDialog() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean
    title: string
    description: string
    onConfirm: () => void
    variant?: DialogVariant
    confirmText?: string
    cancelText?: string
    isLoading?: boolean
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    variant: 'info',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isLoading: false,
  })

  const openConfirmDialog = ({
    title,
    description,
    onConfirm,
    variant = 'info',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    isLoading = false,
  }: Omit<ConfirmationDialogProps, 'isOpen' | 'onClose'>) => {
    setDialogState({
      isOpen: true,
      title,
      description,
      onConfirm,
      variant,
      confirmText,
      cancelText,
      isLoading,
    })
  }

  const closeConfirmDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }))
  }

  const setLoading = (isLoading: boolean) => {
    setDialogState((prev) => ({ ...prev, isLoading }))
  }

  return {
    dialogState,
    openConfirmDialog,
    closeConfirmDialog,
    setLoading,
  }
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'info',
  isLoading = false,
}: ConfirmationDialogProps) {
  const getConfirmButtonClasses = () => {
    const baseClasses = 'py-2 px-4 rounded-md font-medium text-white'

    switch (variant) {
      case 'danger':
        return `${baseClasses} bg-red-600 hover:bg-red-700`
      case 'warning':
        return `${baseClasses} bg-amber-500 hover:bg-amber-600`
      case 'primary':
        return `${baseClasses} bg-primary hover:bg-primaryHover`
      case 'info':
      default:
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800`
    }
  }

  const handleConfirm = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onConfirm()
  }

  const handleCancel = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="">{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            aria-label="Cancel"
            onClick={handleCancel}
            className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none sm:mt-0 sm:w-auto dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
            aria-label="Confirm"
            onClick={handleConfirm}
            className={getConfirmButtonClasses()}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
