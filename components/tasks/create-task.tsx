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
import { useFormatter, useTranslations } from 'next-intl';
import { createTaskSchema } from '@/validation/schemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
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

export const CreateTask = () => {
  const queryClient = useQueryClient();
  const t = useTranslations('CreateTaskPage');
  const tForm = useTranslations('CreateTaskPage.form');
  const tToast = useTranslations('CreateTaskPage.toast');
  const tValidation = useTranslations('Validation');
  const tF = useTranslations('Forms');

  const taskFormSchema = createTaskSchema(tValidation).omit({ status: true });

  type TaskFormValues = z.infer<typeof taskFormSchema>;

  const router = useRouter();
  const format = useFormatter();

  const mutation = useMutation({
    mutationFn: async (data: TaskFormValues) => {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error(tToast('error'));
      const json = await response.json();
      return json.data;
    },
    onSuccess: (data) => {
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
      router.push(`/tasks/${data.task.id}`);
    },
    onError: (error) => {
      console.error(error);
      toast.error(tToast('serverError'));
    },
  });

  const form = useForm({
    resolver: zodResolver(taskFormSchema),
    mode: 'onSubmit',
    defaultValues: {
      title: '',
      description: '',
      dueDate: '',
      priority: 'MEDIUM',
    },
  });

  const { data: session } = authClient.useSession();
  const draft = useFormDraft({
    form,
    scope: 'new',
    userId: session?.user.id,
  });

  const handleSubmit = (data: TaskFormValues) => {
    mutation.mutate(data, { onSuccess: draft.clear });
  };

  return (
    <main
      id='main-content'
      className='flex w-full flex-1 flex-col items-center px-4 py-8 sm:px-6 sm:py-12'
    >
      <div className='flex w-full max-w-[60rem] flex-col gap-4'>
        <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
          <BackButton href='/dashboard' translationKey='backToDashboard' />
          <h1
            className='font-display text-2xl font-bold'
            style={{ fontStretch: '80%' }}
            id='create-task-title'
          >
            {t('title')}
          </h1>
        </div>
        <FormSheet>
          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              aria-labelledby='create-task-title'
              noValidate
            >
              <FormSheetHeader
                label={`Tarevity · ${tF('formNumber')}`}
                number='______'
                date={format.dateTime(new Date(), {
                  year: 'numeric',
                  month: 'short',
                  day: '2-digit',
                })}
              />

              <FormField
                control={form.control}
                name='title'
                render={({ field }) => (
                  <FormItem className={sheetCell}>
                    <FormLabel
                      htmlFor='create-task-title-input'
                      className='field-label'
                    >
                      {tF('subject')}
                    </FormLabel>
                    <FormControl>
                      <SheetTitleInput
                        {...field}
                        id='create-task-title-input'
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
                      htmlFor='create-task-description'
                      className='field-label'
                    >
                      {tF('notes')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id='create-task-description'
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

              <div className='divide-rule ruled grid divide-y sm:grid-cols-2 sm:divide-x sm:divide-y-0'>
                <FormField
                  control={form.control}
                  name='dueDate'
                  render={({ field }) => (
                    <FormItem className={fieldCell}>
                      <FormLabel
                        htmlFor='create-task-due-date'
                        className='field-label'
                      >
                        {tF('due')}
                      </FormLabel>
                      <DueDateField
                        id='create-task-due-date'
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
                        id='create-task-priority-label'
                        className='field-label'
                      >
                        {tForm('priority')}
                      </FormLabel>
                      <FormControl>
                        <TickBoxGroup
                          name={field.name}
                          value={field.value as string}
                          onChange={field.onChange}
                          disabled={mutation.isPending}
                          labelledBy='create-task-priority-label'
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
              </div>

              <StubStrip className='justify-end'>
                <DraftNotice
                  restored={draft.restored}
                  savedAt={draft.savedAt}
                  onDiscard={draft.discard}
                />
                <Button variant='ghost' asChild>
                  <Link
                    href={'/dashboard'}
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
                  aria-label={tForm('createAria')}
                >
                  <Icon icon='tabler:device-floppy' aria-hidden='true' />
                  {mutation.isPending ? (
                    <span aria-live='polite'>{tForm('creating')}</span>
                  ) : (
                    tForm('create')
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
