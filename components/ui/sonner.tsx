'use client';

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className='toaster group'
      icons={{
        success: <CircleCheckIcon className='text-stamp-green size-4' />,
        info: <InfoIcon className='text-print size-4' />,
        warning: <TriangleAlertIcon className='text-stamp-violet size-4' />,
        error: <OctagonXIcon className='text-stamp-red size-4' />,
        loading: <Loader2Icon className='text-print size-4 animate-spin' />,
      }}
      style={
        {
          '--normal-bg': 'var(--popover)',
          '--normal-text': 'var(--popover-foreground)',
          '--normal-border': 'var(--rule)',
          '--border-radius': '3px',
          '--success-bg': 'var(--popover)',
          '--success-text': 'var(--popover-foreground)',
          '--success-border': 'var(--rule)',
          '--error-bg': 'var(--popover)',
          '--error-text': 'var(--popover-foreground)',
          '--error-border': 'var(--rule)',
        } as React.CSSProperties
      }
      toastOptions={{
        style: {
          fontFamily: 'var(--font-sans)',
          boxShadow: '0 10px 30px -12px rgb(27 33 48 / 0.35)',
        },
        classNames: {
          title: 'font-semibold',
          description: 'text-muted-foreground!',
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
