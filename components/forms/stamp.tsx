import { cn } from '@/lib/utils';
import type { TaskStatus } from '@/lib/generated/prisma/enums';

type StampTone = 'print' | 'violet' | 'green' | 'red';

const toneClass: Record<StampTone, string> = {
  print: 'text-print',
  violet: 'text-stamp-violet',
  green: 'text-stamp-green',
  red: 'text-stamp-red',
};

export const statusTone: Record<TaskStatus, StampTone> = {
  ACTIVE: 'print',
  REVIEW: 'violet',
  COMPLETED: 'green',
};

interface StampProps {
  children: React.ReactNode;
  tone?: StampTone;
  rotate?: number;
  animate?: boolean;
  className?: string;
}

export function Stamp({
  children,
  tone = 'print',
  rotate = -6,
  animate = false,
  className,
}: StampProps) {
  return (
    <span
      className={cn(
        'stamp',
        toneClass[tone],
        animate && 'animate-stamp',
        className,
      )}
      style={{ '--stamp-rotate': `${rotate}deg` } as React.CSSProperties}
    >
      {children}
    </span>
  );
}
