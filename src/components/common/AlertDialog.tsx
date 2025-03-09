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

interface AlertDialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description: string
  buttonText?: string
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'primary'
}

export function useAlertDialog() {
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    buttonText?: string;
    variant?: 'success' | 'danger' | 'warning' | 'info' | 'primary';
  }>({
    isOpen: false,
    title: '',
    description: '',
    buttonText: 'OK',
    variant: 'info',
  });

  const openAlertDialog = ({
    title,
    description,
    buttonText = 'OK',
    variant = 'info',
  }: Omit<AlertDialogProps, 'isOpen' | 'onClose'>) => {
    setDialogState({
      isOpen: true,
      title,
      description,
      buttonText,
      variant,
    });
  };

  const closeAlertDialog = () => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  return {
    alertDialogState: dialogState,
    openAlertDialog,
    closeAlertDialog,
  };
}

export default function AlertDialog({
  isOpen,
  onClose,
  title,
  description,
  buttonText = 'OK',
  variant = 'info',
}: AlertDialogProps) {
  const getButtonClasses = () => {
    const baseClasses = "w-full sm:w-auto py-2 px-4 rounded-md font-medium text-white"
    
    switch (variant) {
      case 'danger':
        return `${baseClasses} bg-red-600 hover:bg-red-700`
      case 'warning':
        return `${baseClasses} bg-amber-500 hover:bg-amber-600`
      case 'success':
        return `${baseClasses} bg-green-600 hover:bg-green-700`
      case 'primary':
        return `${baseClasses} bg-primary hover:bg-primaryHover`
      case 'info':
      default:
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800`
    }
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
            className={getButtonClasses()}
          >
            {buttonText}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}