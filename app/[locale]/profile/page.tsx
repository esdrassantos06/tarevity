'use client';

import Footer from '@/components/footer';
import Header from '@/components/header';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
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
import { getTaskCounts } from '@/actions/profile-actions';
import { TaskCounts } from '@/types/TaskCount';

type ProfileFormValues = {
  name: string;
  image?: FileList;
};

export default function Profile() {
  const { data: session, isPending, refetch } = authClient.useSession();
  const router = useRouter();
  const t = useTranslations('ProfilePage');
  const tForm = useTranslations('ProfilePage.form');
  const tToast = useTranslations('ProfilePage.toast');
  const tStats = useTranslations('ProfilePage.statistics');
  const tErrors = useTranslations('ProfilePage.errors');
  const [loadingTasks, setLoadingTasks] = useState(true);

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

  const [taskCounts, setTaskCounts] = useState<TaskCounts>({
    created: 0,
    completed: 0,
    pending: 0,
  });

  const form = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: session?.user.name ?? '',
      image: undefined,
    },
  });

  useEffect(() => {
    if (session) {
      if (session.user.image) {
        setImagePreview(session.user.image);
      }
      if (session.user.name) {
        form.reset({ name: session.user.name, image: undefined });
      }
    }
  }, [session, form]);

  useEffect(() => {
    const fetchTaskCounts = async () => {
      if (!session) return;

      try {
        const counts = await getTaskCounts();
        setTaskCounts(counts);
      } catch (error) {
        console.error(tErrors('fetchingTaskCounts'), error);
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTaskCounts();
  }, [session, tErrors]);

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

  const cards = [
    {
      title: tStats('created'),
      colorClass: 'bg-blue-50 dark:bg-blue-900/30',
      titleColor: 'text-blue-600 dark:text-blue-400',
      icon: 'mdi:clipboard-plus',
      key: 'created' as keyof TaskCounts,
    },
    {
      title: tStats('completed'),
      colorClass: 'bg-green-50 dark:bg-green-900/30',
      titleColor: 'text-green-600 dark:text-green-400',
      icon: 'mdi:check-circle',
      key: 'completed' as keyof TaskCounts,
    },
    {
      title: tStats('pending'),
      colorClass: 'bg-yellow-50 dark:bg-yellow-900/30',
      titleColor: 'text-yellow-600 dark:text-yellow-400',
      icon: 'mdi:clock-outline',
      key: 'pending' as keyof TaskCounts,
    },
  ];

  return (
    <>
      <Header />
      <main className='flex flex-1 flex-col items-center justify-center gap-6 px-4 py-8 sm:gap-8 sm:px-6 sm:py-12 lg:gap-10 lg:px-8 lg:py-20'>
        <section className='flex w-full max-w-7xl flex-col items-center justify-center p-4 sm:p-6'>
          <h1 className='mb-2 w-full text-start text-2xl font-bold text-gray-900 sm:text-3xl md:text-4xl dark:text-white'>
            {t('title')}
          </h1>
        </section>

        <section className='flex w-full max-w-7xl flex-col gap-4 rounded-lg shadow dark:bg-[#1d1929]'>
          {isPending || loadingTasks ? (
            <>
              <div className='bg-blue-accent h-24 rounded-t-lg sm:h-32' />
              <div className='flex items-center justify-between gap-4 px-4 py-4 sm:px-6 md:px-10'>
                <div className='flex w-full items-center gap-3 sm:gap-4'>
                  <Skeleton className='size-16 rounded-full sm:size-20' />
                  <div className='flex min-w-0 flex-1 flex-col gap-2'>
                    <Skeleton className='h-6 w-32 sm:h-8 sm:w-48' />
                    <Skeleton className='h-4 w-40 sm:h-5 sm:w-64' />
                  </div>
                </div>
              </div>

              <Separator />
              <div className='flex flex-col gap-4 p-4 sm:p-6'>
                <Skeleton className='mb-2 h-5 w-28 sm:h-6 sm:w-32' />
                <div className='grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3'>
                  {Array(3)
                    .fill(0)
                    .map((_, i) => (
                      <Card key={i} className='gap-0 p-4'>
                        <Skeleton className='mb-2 h-8 w-12' />
                        <Skeleton className='h-4 w-20' />
                      </Card>
                    ))}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className='bg-blue-accent h-24 rounded-t-lg sm:h-32' />

              {/* User section */}
              {!editing ? (
                <div className='flex flex-col items-start justify-between gap-4 px-4 py-4 sm:flex-row sm:items-center sm:px-6 md:px-10'>
                  <div className='flex w-full min-w-0 items-center gap-3 sm:gap-4'>
                    <Avatar className='size-16 shrink-0 sm:size-20'>
                      <AvatarImage
                        src={session?.user.image ?? undefined}
                        alt={session?.user.name ?? 'User'}
                        key={session?.user.image}
                      />
                      <AvatarFallback className='select-none'>
                        {session?.user.name?.charAt(0) ?? 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className='flex min-w-0 flex-1 flex-col gap-1 sm:gap-2'>
                      <h2 className='truncate text-xl font-bold text-gray-900 sm:text-2xl dark:text-white'>
                        {session?.user.name}
                      </h2>
                      <h3 className='flex min-w-0 items-center gap-2 text-sm text-gray-600 sm:text-base dark:text-gray-400'>
                        <Icon
                          icon={'ic:baseline-mail'}
                          className='size-4 shrink-0 sm:size-5'
                          aria-hidden='true'
                        />
                        <span className='truncate'>{session?.user.email}</span>
                      </h3>
                    </div>
                  </div>
                  <div className='w-full sm:w-auto'>
                    <Button
                      variant={'ghost'}
                      onClick={() => setEditing(true)}
                      className='w-full sm:w-auto'
                    >
                      <Icon
                        icon={'mingcute:pencil-fill'}
                        className='text-blue-accent'
                        aria-hidden='true'
                      />
                      {t('edit')}
                    </Button>
                  </div>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className='flex flex-col items-start justify-between gap-6 px-4 py-4 sm:px-6 md:flex-row md:items-center md:px-10'
                  >
                    <div className='flex w-full flex-1 flex-col gap-4 sm:flex-row sm:items-center'>
                      <div className='flex flex-col items-center sm:items-start'>
                        <FormField
                          control={form.control}
                          name='image'
                          render={({
                            field: { onChange, onBlur, name, ref },
                          }) => (
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
                                    if (
                                      e.target.files &&
                                      e.target.files.length > 0
                                    ) {
                                      const file = e.target.files[0];
                                      const reader = new FileReader();
                                      reader.onloadend = () => {
                                        setImagePreview(
                                          reader.result as string,
                                        );
                                      };
                                      reader.readAsDataURL(file);
                                    } else {
                                      setImagePreview(
                                        session?.user.image ?? undefined,
                                      );
                                    }
                                  }}
                                />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <div className='relative'>
                          <label
                            className='flex size-16 cursor-pointer sm:size-20'
                            onClick={() => fileInputRef.current?.click()}
                          >
                            <Avatar className='size-16 sm:size-20'>
                              <AvatarImage
                                src={imagePreview ? imagePreview : undefined}
                                alt={form.getValues('name') ?? 'User'}
                                className='object-cover'
                              />
                              <AvatarFallback className='select-none'>
                                {form.getValues('name')?.charAt(0) ??
                                  session?.user.name?.charAt(0) ??
                                  'U'}
                              </AvatarFallback>
                            </Avatar>

                            <div className='absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity hover:opacity-100'>
                              <Icon
                                icon='mingcute:pencil-fill'
                                className='size-6 text-white sm:size-8'
                                aria-hidden='true'
                              />
                            </div>
                          </label>

                          {imagePreview && (
                            <button
                              type='button'
                              onClick={handleRemoveImage}
                              disabled={isPendingUpdate}
                              className='absolute -right-1 -bottom-1 z-10 rounded-full bg-red-600 p-1 text-white transition-colors hover:bg-red-700'
                              aria-label={tForm('removeImage')}
                              title={tForm('removeImage')}
                            >
                              <Icon
                                icon='mdi:close'
                                className='size-3 sm:size-4'
                                aria-hidden='true'
                              />
                            </button>
                          )}
                        </div>
                        <FormMessage className='mt-2 text-center text-xs sm:text-left sm:text-sm'>
                          {form.formState.errors.image?.message}
                        </FormMessage>
                      </div>

                      <div className='flex w-full min-w-0 flex-1 flex-col gap-4'>
                        <FormField
                          control={form.control}
                          name='name'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{tForm('name')}</FormLabel>
                              <FormControl>
                                <Input
                                  {...field}
                                  placeholder={tForm('namePlaceholder')}
                                  disabled={isPendingUpdate}
                                  autoComplete='name'
                                  className='w-full'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className='flex w-full flex-col gap-2 sm:w-auto'>
                      <Button
                        type='submit'
                        disabled={isPendingUpdate}
                        className='w-full sm:w-auto'
                      >
                        {isPendingUpdate ? (
                          <>
                            <Icon
                              icon='ri:loader-fill'
                              className='animate-spin'
                              aria-hidden='true'
                            />
                            {tForm('saving')}
                          </>
                        ) : (
                          <>
                            <Icon
                              icon='mdi:check'
                              className='hidden sm:inline'
                              aria-hidden='true'
                            />
                            {tForm('save')}
                          </>
                        )}
                      </Button>
                      <Button
                        type='button'
                        variant={'ghost'}
                        onClick={() => {
                          setEditing(false);
                          form.reset({
                            name: session?.user.name,
                            image: undefined,
                          });
                          setImagePreview(session?.user.image ?? undefined);
                        }}
                        disabled={isPendingUpdate}
                        className='w-full sm:w-auto'
                      >
                        {tForm('cancel')}
                      </Button>
                    </div>
                  </form>
                  {form.formState.errors.root && (
                    <div className='px-4 pb-4 text-center text-sm text-red-600 sm:px-6 md:px-10'>
                      {form.formState.errors.root.message}
                    </div>
                  )}
                </Form>
              )}

              <Separator />
              <div className='flex flex-col gap-4 p-4 sm:p-6'>
                <h3 className='mb-2 text-base font-medium text-gray-900 sm:text-lg dark:text-white'>
                  {tStats('title')}
                </h3>
                <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-2 md:grid-cols-3'>
                  {cards.map((item) => (
                    <Card
                      key={item.title}
                      className={`${item.colorClass} gap-0`}
                    >
                      <CardHeader>
                        <CardTitle
                          className={`${item.titleColor} text-xl font-bold sm:text-2xl`}
                        >
                          {taskCounts[item.key]}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className='flex items-center gap-2 text-xs text-gray-600 sm:text-sm dark:text-gray-400'>
                        <Icon icon={item.icon} className='size-4 shrink-0' />
                        <p className='truncate'>{item.title}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
