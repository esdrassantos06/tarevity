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

interface ProfileDiscardDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function ProfileDiscardDialog({
  isOpen,
  onClose,
  onConfirm,
}: ProfileDiscardDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent onClick={(e) => e.stopPropagation()}>
        <DialogHeader>
          <DialogTitle>Discard Changes</DialogTitle>
          <DialogDescription>
            You have unsaved changes. Are you sure you want to discard them?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <button
            aria-label="Cancel"
            onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            aria-label="Discard Changes"
            onClick={onConfirm}
            className="rounded-md bg-amber-600 px-4 py-2 text-white hover:bg-amber-700"
          >
            Discard Changes
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
