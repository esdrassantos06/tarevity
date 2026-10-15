'use client';

import { useIsClient } from '@/hooks/use-is-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { authClient } from '@/lib/auth-client';
import { Icon } from '@iconify/react';
import { useRouter } from '@/i18n/navigation';
import { useEffect, useState, useRef } from 'react';
import { useTranslations } from 'next-intl';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { UpdateUserAction } from '@/actions/update-user-actions';
import { RemoveUserImageAction } from '@/actions/delete-user-image-action';
import { useTaskCounts } from '@/hooks/use-tasks';
import { TaskCounts } from '@/types/task-count';
import { TasksDonutChart } from '@/components/tasks/tasks-donut-chart';

type ProfileFormValues = {
  name: string;
  image?: FileList;
};

export function ProfileClient() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const isClient = useIsClient();
  const router = useRouter();
  const t = useTranslations('ProfilePage');
  const tForm = useTranslations('ProfilePage.form');
  const tToast = useTranslations('ProfilePage.toast');
  const tStats = useTranslations('ProfilePage.statistics');
  const tErrors = useTranslations('ProfilePage.errors');
  const tAccount = useTranslations('SettingsPage.account');

  const profileFormSchema = z.object({
    name: z.string().min(2, tForm('nameMinLength')),
    image: z
      .custom<FileList>((v) => v instanceof FileList, tForm('imageSelect'))
      .refine(
        (files) => files.length === 0 || files.length === 1,
        tForm('imageOneOnly'),
      )
      .refine(
        (files) => files.length === 0 || files[0].size <= 5_000_000,
        tForm('imageMaxSize'),
      )
      .refine(
        (files) => files.length === 0 || files[0].type.startsWith('image/'),
        tForm('imageType'),
      )
      .optional()
      .transform((files) => (files && files.length > 0 ? files : undefined)),
  });

  const [editing, setEditing] = useState(false);

  const [isPendingUpdate, setIsPendingUpdate] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | undefined>(
    undefined,
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    data: taskCounts,
    isLoading: loadingTasks,
    isFetching: fetchingTasks,
    error: taskCountsError,
  } = useTaskCounts(!!session && !isPending);

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.user.name ?? '',
      image: undefined,
    },
  });

  const [syncedImage, setSyncedImage] = useState(session?.user.image);
  if (session?.user.image && session.user.image !== syncedImage) {
    setSyncedImage(session.user.image);
    setImagePreview(session.user.image);
  }

  useEffect(() => {
    if (session?.user.name) {
      form.reset({ name: session.user.name, image: undefined });
    }
  }, [session, form]);

  useEffect(() => {
    if (!session && !isPending) {
      router.push('/auth/login');
    }
  }, [session, isPending, router]);

  const onSubmit = async (data: ProfileFormValues) => {
    setIsPendingUpdate(true);
    form.clearErrors();

    const formData = new FormData();

    if (data.name !== session?.user.name) {
      formData.append('name', data.name);
    }

    if (data.image && data.image.length > 0) {
      formData.append('image', data.image[0]);
    }

    if (!formData.has('name') && !formData.has('image')) {
      toast.info(tToast('noChanges'));
      setEditing(false);
      setIsPendingUpdate(false);
      return;
    }

    try {
      const { error, success } = await UpdateUserAction(formData);

      if (error) {
        toast.error(error);
        form.setError('root', { message: error });
      }

      if (success) {
        toast.success(tToast('success'));
        setEditing(false);

        await refetch();
      }
    } catch (e) {
      console.error(e);
      const errorMsg = tToast('error');
      toast.error(errorMsg);
      form.setError('root', { message: errorMsg });
    } finally {
      setIsPendingUpdate(false);
    }
  };

  const handleRemoveImage = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const isNewImagePreview =
      imagePreview && imagePreview !== session?.user.image;

    if (isNewImagePreview) {
      setImagePreview(session?.user.image ?? undefined);
      form.setValue('image', undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    if (!session?.user.image) {
      setImagePreview(undefined);
      form.setValue('image', undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    setIsPendingUpdate(true);
    toast.loading(tForm('removingImage'));

    try {
      const { error } = await RemoveUserImageAction();

      if (error) {
        toast.error(error);
      } else {
        toast.success(tToast('imageRemoved'));
        await refetch();
        setEditing(false);

        setImagePreview(undefined);
        form.setValue('image', undefined);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (e) {
      console.error(e);
      toast.error(tToast('errorGeneric'));
    } finally {
      setIsPendingUpdate(false);
      toast.dismiss();
    }
  };

  const countFields: { key: keyof TaskCounts; label: string }[] = [
    { key: 'created', label: tStats('created') },
    { key: 'completed', label: tStats('completed') },
    { key: 'pending', label: tStats('pending') },
  ];

  const loading =
    !isClient || isPending || loadingTasks || (fetchingTasks && !taskCounts);

  const fieldRow = (label: string, value: React.ReactNode) => (
    <div
      key={label}
      className='border-rule grid grid-cols-1 gap-1 border-b py-3 sm:grid-cols-[12rem_1fr] sm:items-baseline sm:gap-4'
    >
      <dt className='field-label'>{label}</dt>
      <dd className='typed min-w-0 text-base wrap-break-word'>{value}</dd>
    </div>
  );

  const resetEditing = () => {
    setEditing(false);
    form.reset({
      name: session?.user.name,
      image: undefined,
    });
    setImagePreview(session?.user.image ?? undefined);
  };

  const photoSlot = editing ? (
    <div className='relative w-fit'>
      <FormField
        control={form.control}
        name='image'
        render={({ field: { onChange, onBlur, name, ref } }) => (
          <FormItem className='hidden'>
            <FormControl>
              <Input
                type='file'
                accept='image/png, image/jpeg, image/webp'
                disabled={isPendingUpdate}
                name={name}
                onBlur={onBlur}
                ref={(e) => {
                  ref(e);
                  fileInputRef.current = e;
                }}
                onChange={(e) => {
                  onChange(e.target.files);
                  if (e.target.files && e.target.files.length > 0) {
                    const file = e.target.files[0];
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setImagePreview(reader.result as string);
                    };
                    reader.readAsDataURL(file);
                  } else {
                    setImagePreview(session?.user.image ?? undefined);
                  }
                }}
              />
            </FormControl>
          </FormItem>
        )}
      />
      <label
        className='border-print group relative flex size-32 cursor-pointer rounded-[3px] border p-1'
        onClick={() => fileInputRef.current?.click()}
      >
        <Avatar className='size-full'>
          <AvatarImage
            src={imagePreview ? imagePreview : undefined}
            alt={form.getValues('name') ?? 'User'}
            className='object-cover'
          />
          <AvatarFallback className='text-4xl select-none'>
            {form.getValues('name')?.charAt(0) ??
              session?.user.name?.charAt(0) ??
              'U'}
          </AvatarFallback>
        </Avatar>
        <span className='bg-print/70 absolute inset-1 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100'>
          <Icon
            icon='tabler:pencil'
            className='text-primary-foreground size-7'
            aria-hidden='true'
          />
        </span>
      </label>
      {imagePreview && (
        <Button
          type='button'
          variant='destructive'
          size='icon-sm'
          onClick={handleRemoveImage}
          disabled={isPendingUpdate}
          className='absolute -right-2 -bottom-2 z-10 size-7'
          aria-label={tForm('removeImage')}
          title={tForm('removeImage')}
        >
          <Icon icon='tabler:x' aria-hidden='true' />
        </Button>
      )}
      <FormMessage className='mt-2 text-xs'>
        {form.formState.errors.image?.message}
      </FormMessage>
    </div>
  ) : (
    <div className='border-print flex size-32 rounded-[3px] border p-1'>
      <Avatar className='size-full'>
        <AvatarImage
          src={session?.user.image ?? undefined}
          alt={session?.user.name ?? 'User'}
          key={session?.user.image}
          className='object-cover'
        />
        <AvatarFallback className='text-4xl select-none'>
          {session?.user.name?.charAt(0) ?? 'U'}
        </AvatarFallback>
      </Avatar>
    </div>
  );

  const record = (
    <>
      <div className='border-rule flex flex-col gap-4 border-b p-6 lg:border-r lg:border-b-0'>
        {photoSlot}
        <div className='flex min-w-0 flex-col gap-1'>
          <h2
            className='font-display truncate text-2xl leading-tight font-extrabold'
            style={{ fontStretch: '80%' }}
          >
            {session?.user.name}
          </h2>
          <p className='typed text-muted-foreground truncate text-sm'>
            {session?.user.email}
          </p>
        </div>
        {editing ? (
          <div className='flex flex-col gap-2'>
            <Button type='submit' disabled={isPendingUpdate}>
              {isPendingUpdate ? (
                <>
                  <Icon
                    icon='tabler:loader-2'
                    className='animate-spin'
                    aria-hidden='true'
                  />
                  {tForm('saving')}
                </>
              ) : (
                <>
                  <Icon icon='tabler:check' aria-hidden='true' />
                  {tForm('save')}
                </>
              )}
            </Button>
            <Button
              type='button'
              variant='ghost'
              onClick={resetEditing}
              disabled={isPendingUpdate}
            >
              {tForm('cancel')}
            </Button>
          </div>
        ) : (
          <Button
            variant='outline'
            onClick={() => setEditing(true)}
            className='w-full sm:w-fit'
          >
            <Icon icon='tabler:pencil' aria-hidden='true' />
            {t('edit')}
          </Button>
        )}
      </div>

      <div className='flex min-w-0 flex-col gap-8 p-6'>
        <dl className='border-rule flex flex-col border-t'>
          {editing ? (
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='border-rule grid grid-cols-1 gap-1 border-b py-3 sm:grid-cols-[12rem_1fr] sm:items-baseline sm:gap-4'>
                  <FormLabel className='field-label'>{tForm('name')}</FormLabel>
                  <div className='flex flex-col gap-1'>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder={tForm('namePlaceholder')}
                        disabled={isPendingUpdate}
                        autoComplete='name'
                        className='typed w-full'
                      />
                    </FormControl>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />
          ) : (
            fieldRow(tForm('name'), session?.user.name)
          )}
          {fieldRow(tAccount('email'), session?.user.email)}
          {countFields.map((field) =>
            fieldRow(field.label, taskCounts ? taskCounts[field.key] : 0),
          )}
        </dl>
        {editing && form.formState.errors.root && (
          <p className='text-destructive text-sm'>
            {form.formState.errors.root.message}
          </p>
        )}
        {taskCountsError && (
          <p className='text-destructive text-sm'>
            {tErrors('fetchingTaskCounts')}
          </p>
        )}

        <section
          aria-labelledby='profile-ledger'
          className='flex flex-col gap-2'
        >
          <h3 id='profile-ledger' className='field-label'>
            {tStats('title')}
          </h3>
          <TasksDonutChart userId={session?.user.id} />
        </section>
      </div>
    </>
  );

  const sheetClass = 'sheet grid w-full rounded-[3px] lg:grid-cols-[20rem_1fr]';

  return (
    <main
      id='main-content'
      role='main'
      className='mx-auto flex w-full max-w-360 flex-1 flex-col gap-8 px-4 py-10 sm:px-6 lg:px-10'
    >
      <header className='flex flex-col gap-1'>
        <h1
          className='font-display text-[clamp(2rem,3.4vw,3rem)] leading-none font-extrabold'
          style={{ fontStretch: '80%' }}
        >
          {t('title')}
        </h1>
        <p className='typed text-muted-foreground min-h-5 text-sm'>
          {isClient ? session?.user.email : null}
        </p>
      </header>

      {loading ? (
        <section className={sheetClass}>
          <div className='border-rule flex flex-col gap-4 border-b p-6 lg:border-r lg:border-b-0'>
            <Skeleton className='size-32' />
            <Skeleton className='h-7 w-40' />
            <Skeleton className='h-4 w-52' />
            <Skeleton className='h-9 w-28' />
          </div>
          <div className='flex flex-col gap-8 p-6'>
            <div className='border-rule flex flex-col border-t'>
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className='border-rule grid grid-cols-1 gap-2 border-b py-3 sm:grid-cols-[12rem_1fr] sm:gap-4'
                >
                  <Skeleton className='h-3 w-24' />
                  <Skeleton className='h-5 w-48' />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : editing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className={sheetClass}>
            {record}
          </form>
        </Form>
      ) : (
        <section className={sheetClass}>{record}</section>
      )}
    </main>
  );
}
