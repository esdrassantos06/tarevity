'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { FaTimes } from 'react-icons/fa';

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;

const DialogPortal = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className,
  children,
  ...props
}: DialogPrimitive.DialogPortalProps & { className?: string }) => (
  <DialogPrimitive.Portal {...props}>
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {children}
    </div>
  </DialogPrimitive.Portal>
);
DialogPortal.displayName = DialogPrimitive.Portal.displayName;

// Dialog Overlay component with animations
const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className="fixed inset-0 z-100 bg-black/50 backdrop-blur-sm transition-opacity duration-200 ease-out data-[state=open]:animate-in data-[state=open]:fade-in"
    {...props}
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

// Dialog Content component with animations
const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className="fixed z-101 grid w-full max-w-lg gap-4 rounded-lg bg-white p-6 shadow-lg transition-all duration-200 ease-out animate-in data-[state=open]:fade-in-90 data-[state=open]:slide-in-from-right sm:max-w-lg sm:rounded-lg md:w-full dark:bg-gray-800"
      {...props}
    >
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 disabled:pointer-events-none dark:ring-offset-gray-950 dark:focus:ring-gray-800">
        <FaTimes className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = DialogPrimitive.Content.displayName;

// Dialog Header component
const DialogHeader = ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className="flex flex-col space-y-1.5 text-center sm:text-left"
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

// Dialog Footer component
const DialogFooter = ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2"
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

// Dialog Title component
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
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

// Dialog Description component
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
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};