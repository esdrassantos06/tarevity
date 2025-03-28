'use client'
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from '@/components/common/Dialog'
import { useTranslations } from 'next-intl'

interface DeleteImageDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteImageDialog({
  isOpen,
  onClose,
  onConfirm,
}: DeleteImageDialogProps) {
  const t = useTranslations('profile.deleteImageDialog')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            aria-label={t('aria.cancel')}
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            {t('buttons.cancel')}
          </button>
          <button
            aria-label={t('aria.delete')}
            onClick={onConfirm}
            className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
          >
            {t('buttons.delete')}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
