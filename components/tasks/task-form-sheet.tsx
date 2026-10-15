import { Icon } from '@iconify/react';
import { format as dateFnsFormat, isBefore, startOfToday } from 'date-fns';
import { useFormatter } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormControl } from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

/** Padding and focus tint shared by every field cell on a form sheet. */
export const fieldCell =
  'gap-1.5 px-5 py-4 transition-colors focus-within:bg-accent/30 sm:px-8';

/** Full-width field cell closed by a hairline rule. */
export const sheetCell = `ruled ${fieldCell}`;

const sheetTitleInput =
  'typed h-auto min-h-0 resize-none overflow-hidden [field-sizing:content] rounded-none border-0 border-b-2 border-dashed border-rule bg-transparent px-0 py-1 text-[clamp(1.2rem,5vw,2.5rem)] leading-tight font-bold shadow-none focus-visible:border-solid focus-visible:border-print focus-visible:ring-0 md:text-[clamp(1.2rem,3.5vw,2.5rem)] dark:bg-transparent';

/** Lined-paper textarea for the Notes field; the ruling tracks the 1.75rem line height. */
export const sheetDescriptionInput =
  'min-h-[8.75rem] rounded-none border-0 bg-[repeating-linear-gradient(to_bottom,transparent_0,transparent_calc(1.75rem-1px),var(--rule)_calc(1.75rem-1px),var(--rule)_1.75rem)] bg-local px-0 py-0 text-base leading-7 shadow-none focus-visible:ring-0 md:text-base dark:bg-transparent';

/** Large typed Subject field: a one-line textarea that wraps long titles instead of clipping them. Enter submits; pasted line breaks become spaces. */
export function SheetTitleInput({
  className,
  onChange,
  onKeyDown,
  ...props
}: React.ComponentProps<'textarea'>) {
  return (
    <Textarea
      rows={1}
      className={cn(sheetTitleInput, className)}
      onKeyDown={(event) => {
        onKeyDown?.(event);
        if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
          event.preventDefault();
          event.currentTarget.form?.requestSubmit();
        }
      }}
      onChange={(event) => {
        if (event.target.value.includes('\n')) {
          event.target.value = event.target.value.replace(/\s*\n\s*/g, ' ');
        }
        onChange?.(event);
      }}
      {...props}
    />
  );
}

export function FormSheet({
  className,
  ...props
}: React.ComponentProps<'article'>) {
  return (
    <article
      className={cn('sheet relative w-full rounded-[3px]', className)}
      {...props}
    />
  );
}

export function FormSheetHeader({
  label,
  number,
  date,
}: {
  label: string;
  number: string;
  date: string;
}) {
  return (
    <header className='border-print flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b-2 px-5 py-3 sm:px-8'>
      <p className='flex items-baseline gap-2'>
        <span className='field-label'>{label}</span>
        <span className='typed text-lg font-bold tracking-wider'>{number}</span>
      </p>
      <p
        className='typed text-muted-foreground text-sm'
        suppressHydrationWarning
      >
        {date}
      </p>
    </header>
  );
}

export function StubStrip({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <footer
      className={cn(
        'bg-accent/40 relative flex flex-wrap items-center gap-2 px-5 pt-6 pb-4 sm:px-8',
        className,
      )}
    >
      <div
        className='perforation-x absolute inset-x-0 top-0 -translate-y-1/2'
        aria-hidden='true'
      />
      {children}
    </footer>
  );
}

interface TickBoxGroupProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  labelledBy: string;
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

export function TickBoxGroup({
  name,
  value,
  onChange,
  options,
  disabled,
  labelledBy,
  ...aria
}: TickBoxGroupProps) {
  return (
    <div
      role='radiogroup'
      aria-labelledby={labelledBy}
      className='flex flex-wrap gap-x-5 gap-y-2 pt-1'
      {...aria}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className='flex cursor-pointer items-center gap-2 has-disabled:cursor-not-allowed has-disabled:opacity-50'
        >
          <input
            type='radio'
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            disabled={disabled}
            className='peer sr-only'
          />
          <span
            className='border-print text-primary-foreground peer-checked:bg-print peer-focus-visible:outline-ring grid size-4 place-items-center rounded-[2px] border-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 [&>svg]:invisible peer-checked:[&>svg]:visible'
            aria-hidden='true'
          >
            <Icon icon='tabler:check' className='size-3' />
          </span>
          <span className='typed text-sm'>{option.label}</span>
        </label>
      ))}
    </div>
  );
}

interface DueDateFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  label: string;
  pickLabel: string;
  selectAria: string;
}

export function DueDateField({
  id,
  value,
  onChange,
  disabled,
  label,
  pickLabel,
  selectAria,
}: DueDateFieldProps) {
  const format = useFormatter();
  const formatted = value
    ? format.dateTime(new Date(value + 'T00:00:00'), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <FormControl>
          <Button
            id={id}
            variant='ghost'
            className={cn(
              'typed border-rule h-auto w-full justify-start rounded-none border-b border-dashed px-0 py-1 text-base font-normal tracking-normal hover:bg-transparent',
              !formatted && 'text-muted-foreground',
            )}
            disabled={disabled}
            type='button'
            aria-label={formatted ? `${label}: ${formatted}` : selectAria}
            aria-haspopup='dialog'
          >
            {formatted ?? <span>{pickLabel}</span>}
            <Icon
              icon='tabler:calendar-event'
              className='text-print ml-auto size-4'
              aria-hidden='true'
            />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto rounded-[3px] p-0'
        align='start'
        role='dialog'
        aria-label={selectAria}
      >
        <Calendar
          mode='single'
          selected={value ? new Date(value + 'T00:00:00') : undefined}
          onSelect={(date) =>
            onChange(date ? dateFnsFormat(date, 'yyyy-MM-dd') : '')
          }
          disabled={(date) => !!disabled || isBefore(date, startOfToday())}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
