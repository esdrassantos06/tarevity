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

// Create a consistent type for variants
type DialogVariant = 'danger' | 'warning' | 'info' | 'primary'

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: DialogVariant // Use the shared type here
  isLoading?: boolean
}

export function useConfirmationDialog() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    variant?: DialogVariant; // Use the shared type here
    confirmText?: string;
    cancelText?: string;
    isLoading?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    onConfirm: () => {},
    variant: 'info',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    isLoading: false,
  });

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
    });
  };

  const closeConfirmDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const setLoading = (isLoading: boolean) => {
    setDialogState((prev) => ({ ...prev, isLoading }));
  };

  return {
    dialogState,
    openConfirmDialog,
    closeConfirmDialog,
    setLoading,
  };
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
    const baseClasses = "py-2 px-4 rounded-md font-medium text-white"
    
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

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            onClick={onClose}
            className="mt-3 sm:mt-0 w-full sm:w-auto inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
            disabled={isLoading}
          >
            {cancelText}
          </button>
          <button
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