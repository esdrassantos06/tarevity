'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from '@/i18n/navigation';
import { FormProvider, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';
import { BackButton } from '@/components/back-button';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Button } from '../ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Icon } from '@iconify/react';
import { useFormDraft } from '@/hooks/use-form-draft';
import { authClient } from '@/lib/auth-client';
import { DraftNotice } from '@/components/forms/draft-notice';
import { Skeleton } from '../ui/skeleton';
import { useFormatter, useTranslations } from 'next-intl';
import { createTaskSchema } from '@/validation/schemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Task } from '@/lib/generated/prisma/browser';
import { useEffect } from 'react';
import { formNumber } from '@/utils/board';
import {
  DueDateField,
  FormSheet,
  FormSheetHeader,
  StubStrip,
  TickBoxGroup,
  fieldCell,
  sheetCell,
  sheetDescriptionInput,
  SheetTitleInput,
} from './task-form-sheet';

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'] as const;
const STATUSES = ['ACTIVE', 'REVIEW', 'COMPLETED'] as const;

interface EditTaskProps {
  taskId: string;
}

export const EditTask = ({ taskId }: EditTaskProps) => {
  const t = useTranslations('EditTaskPage');
  const tForm = useTranslations('EditTaskPage.form');
  const tToast = useTranslations('EditTaskPage.toast');
  const tValidation = useTranslations('Validation');
  const tF = useTranslations('Forms');

  const taskFormSchema = createTaskSchema(tValidation);

  type TaskFormValues = z.infer<typeof taskFormSchema>;

  const router = useRouter();
  const format = useFormatter();
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(taskFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      priority: 'MEDIUM',
      status: 'ACTIVE',
    },
  });

  const {
    data: task,
    isLoading: isTaskLoading,
    isFetching: isTaskFetching,
    isError,
  } = useQuery<{ task: Task }>({
    queryKey: ['task', taskId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`);
      if (!response.ok) throw new Error(tToast('loadError'));
      const json = await response.json();
      return json.data;
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error(tToast('loadErrorGeneric'));
      router.push('/dashboard');
    }
  }, [isError, router, tToast]);

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.task.title,
        description: task.task.description || '',
        dueDate: task.task.dueDate
          ? new Date(task.task.dueDate).toISOString().split('T')[0]
          : '',
        priority: task.task.priority,
        status: task.task.status,
      });
    }
  }, [task, form]);

  const mutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(tToast('error'));
      const json = await response.json();
      return json.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['task', taskId],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks'],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks-calendar'],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['tasks-stats'],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['task-counts'],
        refetchType: 'active',
      });
      queryClient.invalidateQueries({
        queryKey: ['notifications'],
        refetchType: 'active',
      });
      toast.success(tToast('success'));
      router.push(`/tasks/${taskId}`);
    },
    onError: (error) => {
      console.error(error);
      toast.error(tToast('serverError'));
    },
  });

  const { data: session } = authClient.useSession();
  const draft = useFormDraft({
    form,
    scope: `edit:${taskId}`,
    userId: session?.user.id,
    ready: !!task,
  });

  const handleSubmit = (data: TaskFormValues) => {
    mutation.mutate(data, { onSuccess: draft.clear });
  };

  const sheetLabel = `Tarevity · ${tF('formNumber')}`;

  if (isTaskLoading || (isTaskFetching && !task)) {
    return (
      <main
        id='main-content'
        className='flex w-full flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-12'
      >
        <div className='flex w-full max-w-[60rem] flex-col gap-4'>
          <Skeleton className='h-9 w-40' aria-label={t('loading')} />
          <FormSheet>
            <div role='status' aria-live='polite' aria-label={t('loadingForm')}>
              <FormSheetHeader
                label={sheetLabel}
                number={formNumber(taskId)}
                date=''
              />
              <div className={sheetCell}>
                <span className='field-label'>{tF('subject')}</span>
                <Skeleton className='mt-1.5 h-12 w-3/4' />
              </div>
              <div className={sheetCell}>
                <span className='field-label'>{tF('notes')}</span>
                <Skeleton className='mt-1.5 h-28 w-full' />
              </div>
              <div className='ruled grid gap-4 px-5 py-4 sm:grid-cols-3 sm:px-8'>
                <Skeleton className='h-10' />
                <Skeleton className='h-10' />
                <Skeleton className='h-10' />
              </div>
              <StubStrip className='justify-end'>
                <Skeleton className='h-9 w-24' />
                <Skeleton className='h-9 w-36' />
              </StubStrip>
            </div>
          </FormSheet>
        </div>
      </main>
    );
  }

  return (
    <main
      id='main-content'
      className='flex w-full flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-12'
    >
      <div className='flex w-full max-w-[60rem] flex-col gap-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <BackButton
            href={`/tasks/${taskId}`}
            translationKey='backToTask'
            namespace='EditTaskPage'
          />
          <h1
            className='font-display text-2xl font-bold'
            style={{ fontStretch: '80%' }}
            id='edit-task-title'
          >
            {t('title')}
          </h1>
        </div>
        <FormSheet>
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              aria-labelledby='edit-task-title'
              noValidate
            >
              <FormSheetHeader
                label={sheetLabel}
                number={formNumber(taskId)}
                date={
                  task
                    ? format.dateTime(new Date(task.task.createdAt), {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit',
                      })
                    : ''
                }
              />

              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className={sheetCell}>
                    <FormLabel
                      htmlFor='edit-task-title-input'
                      className='field-label'
                    >
                      {tF('subject')}
                    </FormLabel>
                    <FormControl>
                      <SheetTitleInput
                        {...field}
                        id='edit-task-title-input'
                        placeholder={tForm('titlePlaceholder')}
                        disabled={mutation.isPending}
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
                  <FormItem className={sheetCell}>
                    <FormLabel
                      htmlFor='edit-task-description'
                      className='field-label'
                    >
                      {tF('notes')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id='edit-task-description'
                        rows={5}
                        {...field}
                        className={sheetDescriptionInput}
                        placeholder={tForm('descriptionPlaceholder')}
                        disabled={mutation.isPending}
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

              <div className='divide-rule ruled grid divide-y md:grid-cols-3 md:divide-x md:divide-y-0'>
                <FormField
                  control={form.control}
                  name='dueDate'
                  render={({ field }) => (
                    <FormItem className={fieldCell}>
                      <FormLabel
                        htmlFor='edit-task-due-date'
                        className='field-label'
                      >
                        {tF('due')}
                      </FormLabel>
                      <DueDateField
                        id='edit-task-due-date'
                        value={field.value ?? ''}
                        onChange={field.onChange}
                        disabled={mutation.isPending}
                        label={tForm('dueDate')}
                        pickLabel={tForm('pickDate')}
                        selectAria={tForm('selectDueDateAria')}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='priority'
                  render={({ field }) => (
                    <FormItem className={fieldCell}>
                      <FormLabel
                        id='edit-task-priority-label'
                        className='field-label'
                      >
                        {tForm('priority')}
                      </FormLabel>
                      <FormControl>
                        <TickBoxGroup
                          name={field.name}
                          value={
                            (field.value as string) ||
                            task?.task?.priority ||
                            'MEDIUM'
                          }
                          onChange={field.onChange}
                          disabled={mutation.isPending}
                          labelledBy='edit-task-priority-label'
                          options={PRIORITIES.map((value) => ({
                            value,
                            label: tF(`priority.${value}`),
                          }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name='status'
                  render={({ field }) => (
                    <FormItem className={fieldCell}>
                      <FormLabel
                        id='edit-task-status-label'
                        className='field-label'
                      >
                        {tForm('status')}
                      </FormLabel>
                      <FormControl>
                        <TickBoxGroup
                          name={field.name}
                          value={
                            (field.value as string) ||
                            task?.task?.status ||
                            'ACTIVE'
                          }
                          onChange={field.onChange}
                          disabled={mutation.isPending}
                          labelledBy='edit-task-status-label'
                          options={STATUSES.map((value) => ({
                            value,
                            label: tF(`status.${value}`),
                          }))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <StubStrip className='justify-end'>
                <DraftNotice
                  restored={draft.restored}
                  savedAt={draft.savedAt}
                  onDiscard={draft.discard}
                />
                <Button variant='ghost' asChild>
                  <Link
                    href={`/tasks/${taskId}`}
                    aria-label={tForm('cancelAria')}
                    title={tForm('cancel')}
                  >
                    <Icon icon='tabler:x' aria-hidden='true' />
                    {tForm('cancel')}
                  </Link>
                </Button>
                <Button
                  type='submit'
                  disabled={mutation.isPending}
                  aria-label={tForm('saveAria')}
                >
                  <Icon icon='tabler:device-floppy' aria-hidden='true' />
                  {mutation.isPending ? (
                    <span aria-live='polite'>{tForm('saving')}</span>
                  ) : (
                    tForm('save')
                  )}
                </Button>
              </StubStrip>
            </form>
          </FormProvider>
        </FormSheet>
      </div>
    </main>
  );
};
