'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from '@/i18n/navigation';
import { useState, useEffect } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { Card, CardContent } from '../ui/card';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '../ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@iconify/react';
import { Skeleton } from '../ui/skeleton';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { cn } from '@/lib/utils';
import { format as dateFnsFormat, isBefore, startOfToday } from 'date-fns';
import { useFormatter, useTranslations } from 'next-intl';
import { translatePriority, translateStatus } from '@/utils/text';
import { createTaskSchema } from '@/validation/schemas';

interface EditTaskProps {
  taskId: string;
}

export const EditTask = ({ taskId }: EditTaskProps) => {
  const t = useTranslations('EditTaskPage');
  const tForm = useTranslations('EditTaskPage.form');
  const tToast = useTranslations('EditTaskPage.toast');
  const tValidation = useTranslations('Validation');

  const taskFormSchema = createTaskSchema(tValidation);

  type TaskFormValues = z.infer<typeof taskFormSchema>;

  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const format = useFormatter();

  const form = useForm({
    resolver: zodResolver(taskFormSchema),
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      priority: 'MEDIUM',
      status: 'ACTIVE',
    },
  });

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await fetch(`/api/tasks/${taskId}`);

        if (!response.ok) {
          toast.error(tToast('loadError'));
          router.push('/dashboard');
          return;
        }

        const { task } = await response.json();

        form.reset({
          title: task.title,
          description: task.description || '',
          dueDate: task.dueDate
            ? new Date(task.dueDate).toISOString().split('T')[0]
            : '',
          priority: task.priority,
          status: task.status,
        });
      } catch (error) {
        console.error(error);
        toast.error(tToast('loadErrorGeneric'));
        router.push('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTask();
  }, [taskId, form, router, tToast]);

  const onSubmit = async (data: TaskFormValues) => {
    setIsPending(true);

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.error || tToast('error'));
        return;
      }

      toast.success(tToast('success'));
      router.push(`/tasks/${taskId}`);
    } catch (error) {
      console.error(error);
      toast.error(tToast('serverError'));
    } finally {
      setIsPending(false);
    }
  };

  if (isLoading) {
    return (
      <div className='flex w-full flex-1 flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
        <div className='w-full max-w-7xl space-y-4'>
          <Skeleton className='h-8 w-1/3' aria-label={t('loading')} />

          <div className='w-full rounded-lg bg-white p-4 shadow dark:bg-[#1d1929]'>
            <div
              className='space-y-4'
              role='status'
              aria-live='polite'
              aria-label={t('loadingForm')}
            >
              <Skeleton className='h-10 w-full' />
              <Skeleton className='h-24 w-full' />
              <div className='flex gap-4'>
                <Skeleton className='h-10 flex-1' />
                <Skeleton className='h-10 flex-1' />
                <Skeleton className='h-10 flex-1' />
              </div>
              <div className='flex justify-end gap-4'>
                <Skeleton className='h-10 w-24' />
                <Skeleton className='h-10 w-32' />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='flex w-full flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8'>
      <div className='flex w-full max-w-7xl flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between'>
        <Button
          asChild
          variant={'ghost'}
          className='w-full justify-start sm:w-auto'
        >
          <Link
            className='flex items-center justify-center gap-2'
            href={`/tasks/${taskId}`}
            aria-label={t('backToTask')}
            title={t('backToTask')}
          >
            <Icon
              icon={'tabler:arrow-left'}
              className='size-4 sm:size-5'
              aria-hidden='true'
            />
            <span className='text-sm sm:text-base'>{t('backToTask')}</span>
          </Link>
        </Button>
        <h1 className='text-xl font-bold sm:text-2xl' id='edit-task-title'>
          {t('title')}
        </h1>
      </div>
      <Card className='w-full max-w-7xl bg-white dark:bg-[#1d1929]' role='main'>
        <CardContent className='space-y-4'>
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4'
              aria-labelledby='edit-task-title'
              noValidate
            >
              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='edit-task-title-input'>
                      {tForm('title')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        id='edit-task-title-input'
                        placeholder={tForm('titlePlaceholder')}
                        disabled={isPending}
                        aria-required='true'
                        aria-invalid={!!form.formState.errors.title}
                        aria-describedby={
                          form.formState.errors.title
                            ? 'title-error'
                            : undefined
                        }
                        autoComplete='off'
                      />
                    </FormControl>
                    <FormMessage id='title-error' />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name='description'
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor='edit-task-description'>
                      {tForm('description')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id='edit-task-description'
                        rows={5}
                        {...field}
                        placeholder={tForm('descriptionPlaceholder')}
                        disabled={isPending}
                        aria-invalid={!!form.formState.errors.description}
                        aria-describedby={
                          form.formState.errors.description
                            ? 'description-error'
                            : undefined
                        }
                      />
                    </FormControl>
                    <FormMessage id='description-error' />
                  </FormItem>
                )}
              />

              <div className='flex w-full flex-col items-start gap-4 sm:flex-row'>
                <FormField
                  control={form.control}
                  name='dueDate'
                  render={({ field }) => (
                    <FormItem className='flex w-full flex-col sm:flex-1'>
                      <FormLabel
                        htmlFor='edit-task-due-date'
                        className='flex items-center gap-2'
                      >
                        <Icon
                          icon='tabler:calendar'
                          className='text-blue-accent size-4'
                          aria-hidden='true'
                        />
                        {tForm('dueDate')}
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              id='edit-task-due-date'
                              variant={'outline'}
                              className={cn(
                                'w-full pl-3 text-left font-normal',
                                !field.value && 'text-muted-foreground',
                              )}
                              disabled={isPending}
                              type='button'
                              aria-label={
                                field.value
                                  ? `${tForm('dueDate')}: ${format.dateTime(
                                      new Date(field.value + 'T00:00:00'),
                                      {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                      },
                                    )}`
                                  : tForm('selectDueDateAria')
                              }
                              aria-haspopup='dialog'
                            >
                              {field.value ? (
                                format.dateTime(
                                  new Date(field.value + 'T00:00:00'),
                                  {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                  },
                                )
                              ) : (
                                <span>{tForm('pickDate')}</span>
                              )}
                              <Icon
                                icon='tabler:calendar-event'
                                className='ml-auto h-4 w-4 opacity-50'
                                aria-hidden='true'
                              />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className='w-auto p-0 dark:bg-[#1d1929]'
                          align='start'
                          role='dialog'
                          aria-label={tForm('selectDueDateAria')}
                        >
                          <Calendar
                            mode='single'
                            selected={
                              field.value
                                ? new Date(field.value + 'T00:00:00')
                                : undefined
                            }
                            onSelect={(date) => {
                              field.onChange(
                                date ? dateFnsFormat(date, 'yyyy-MM-dd') : '',
                              );
                            }}
                            disabled={(date) => {
                              return (
                                isPending || isBefore(date, startOfToday())
                              );
                            }}
                            autoFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='priority'
                  render={({ field }) => (
                    <FormItem className='w-full sm:flex-1'>
                      <FormLabel
                        htmlFor='edit-task-priority'
                        className='flex items-center gap-2'
                      >
                        <Icon
                          icon='tabler:flag'
                          className='text-blue-accent size-4'
                          aria-hidden='true'
                        />
                        {tForm('priority')}
                      </FormLabel>
                      <Select
                        disabled={isPending}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          id='edit-task-priority'
                          className='w-full'
                          aria-label={tForm('selectPriorityAria')}
                        >
                          <SelectValue placeholder={tForm('selectPriority')} />
                        </SelectTrigger>
                        <SelectContent className='dark:bg-[#1d1929]'>
                          <SelectItem value='LOW'>
                            {translatePriority('LOW', tForm)}
                          </SelectItem>
                          <SelectItem value='MEDIUM'>
                            {translatePriority('MEDIUM', tForm)}
                          </SelectItem>
                          <SelectItem value='HIGH'>
                            {translatePriority('HIGH', tForm)}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem className='w-full sm:flex-1'>
                      <FormLabel
                        htmlFor='edit-task-status'
                        className='flex items-center gap-2'
                      >
                        <Icon
                          icon='tabler:alert-circle'
                          className='text-blue-accent size-4'
                          aria-hidden='true'
                        />
                        {tForm('status')}
                      </FormLabel>
                      <Select
                        disabled={isPending}
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger
                          id='edit-task-status'
                          className='w-full'
                          aria-label={tForm('selectStatusAria')}
                        >
                          <SelectValue placeholder={tForm('selectStatus')} />
                        </SelectTrigger>
                        <SelectContent className='dark:bg-[#1d1929]'>
                          <SelectItem value='ACTIVE'>
                            {translateStatus('ACTIVE', tForm)}
                          </SelectItem>
                          <SelectItem value='REVIEW'>
                            {translateStatus('REVIEW', tForm)}
                          </SelectItem>
                          <SelectItem value='COMPLETED'>
                            {translateStatus('COMPLETED', tForm)}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className='flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end'>
                <Button
                  variant={'outline'}
                  asChild
                  className='w-full sm:w-auto'
                >
                  <Link
                    href={`/tasks/${taskId}`}
                    className='flex items-center justify-center gap-2'
                    aria-label={tForm('cancelAria')}
                    title={tForm('cancel')}
                  >
                    <Icon
                      icon={'material-symbols:close'}
                      className='size-4 sm:size-5'
                      aria-hidden='true'
                    />
                    <span className='text-sm sm:text-base'>
                      {tForm('cancel')}
                    </span>
                  </Link>
                </Button>
                <Button
                  type='submit'
                  className='bg-blue-accent hover:bg-blue-accent/80 w-full sm:w-auto dark:text-white'
                  disabled={isPending}
                  aria-label={tForm('saveAria')}
                >
                  <Icon
                    icon={'material-symbols:save'}
                    className='size-4 sm:size-5'
                    aria-hidden='true'
                  />
                  <span className='text-sm sm:text-base'>
                    {isPending ? (
                      <span aria-live='polite'>{tForm('saving')}</span>
                    ) : (
                      tForm('save')
                    )}
                  </span>
                </Button>
              </div>
            </form>
          </FormProvider>
        </CardContent>
      </Card>
    </div>
  );
};
