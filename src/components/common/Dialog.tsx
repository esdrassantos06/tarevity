'use client'

import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { FaTimes } from 'react-icons/fa'
import { useFocusTrap } from '@/hooks/useFocusTrap'

const Dialog = DialogPrimitive.Root

const DialogPortal = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className,
  children,
  ...props
}: DialogPrimitive.DialogPortalProps & { className?: string }) => (
  <DialogPrimitive.Portal {...props}>
    <div className="fixed inset-0 z-100 flex items-center justify-center">
      {children}
    </div>
  </DialogPrimitive.Portal>
)
DialogPortal.displayName = DialogPrimitive.Portal.displayName

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className="data-[state=open]:animate-in data-[state=open]:fade-in fixed inset-0 z-100 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-out"
    {...props}
  />
))
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ className, children, ...props }, ref) => {
  const focusTrapRef = useFocusTrap(true)

  const setRefs = React.useCallback(
    (element: HTMLDivElement) => {
      if (typeof ref === 'function') {
        ref(element)
      } else if (ref) {
        ref.current = element
      }

      focusTrapRef.current = element
    },
    [ref, focusTrapRef],
  )

  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={setRefs}
        className="animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-right dark:bg-BlackLight fixed z-101 grid w-full max-w-lg gap-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-200 ease-out sm:max-w-lg sm:rounded-lg md:w-full"
        role="dialog"
        aria-modal="true"
        {...props}
      >
        {children}
        <DialogPrimitive.Close
          className="absolute top-4 right-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 focus:outline-none disabled:pointer-events-none dark:ring-offset-gray-950 dark:focus:ring-gray-800"
          aria-label="Close dialog"
        >
          <FaTimes className="h-4 w-4" aria-hidden="true" />
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
})
DialogContent.displayName = DialogPrimitive.Content.displayName

const DialogHeader = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className="flex flex-col space-y-1.5 text-center sm:text-left"
    {...props}
  />
)
DialogHeader.displayName = 'DialogHeader'

const DialogFooter = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
    {...props}
  />
)
DialogFooter.displayName = 'DialogFooter'

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className="text-lg font-semibold text-gray-900 dark:text-gray-50"
    {...props}
  />
))
DialogTitle.displayName = DialogPrimitive.Title.displayName

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className="text-sm text-gray-500 dark:text-gray-400"
    {...props}
  />
))
DialogDescription.displayName = DialogPrimitive.Description.displayName

export {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
}
