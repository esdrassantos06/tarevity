'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { AdminUser } from '@/actions/admin-actions';
import { UpdateUserAdminAction } from '@/actions/admin-actions';
import { toast } from 'sonner';
import { createAdminUpdateUserSchema } from '@/validation/schemas';
import { authClient } from '@/lib/auth-client';

interface EditUserDialogProps {
  user: AdminUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function EditUserDialog({
  user,
  open,
  onOpenChange,
  onSuccess,
}: EditUserDialogProps) {
  const t = useTranslations('SettingsPage.admin.table.editUserDialog');
  const tValidation = useTranslations('Validation');
  const { data: session } = authClient.useSession();

  const adminUpdateUserSchema = createAdminUpdateUserSchema(tValidation);

  type EditUserFormValues = z.infer<typeof adminUpdateUserSchema>;

  const [isPending, setIsPending] = useState(false);

  const form = useForm<EditUserFormValues>({
    resolver: zodResolver(adminUpdateUserSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
    },
  });

  useEffect(() => {
    if (user && open) {
      form.reset({
        name: user.name,
        email: user.email,
        role: (user.role || 'user') as 'user' | 'admin' | 'superadmin',
      });
    }
  }, [user, open, form]);

  const currentUserRole = session?.user.role;
  const isSuperadmin = currentUserRole === 'superadmin';

  const onSubmit = async (data: EditUserFormValues) => {
    if (!user) return;

    setIsPending(true);

    try {
      const result = await UpdateUserAdminAction(user.id, {
        name: data.name,
        email: data.email,
        role: data.role,
      });

      if (result.error) {
        toast.error(result.error);
        return;
      }

      toast.success(t('success'));
      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error(error);
      toast.error(t('error'));
    } finally {
      setIsPending(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='dark:bg-[#1d1929]'>
        <DialogHeader>
          <DialogTitle>{t('title')}</DialogTitle>
          <DialogDescription>{t('description')}</DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('name')}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t('namePlaceholder')} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('email')}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='email'
                      placeholder={t('emailPlaceholder')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('role')}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                    disabled={!isSuperadmin}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('rolePlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='user'>{t('roleUser')}</SelectItem>
                      <SelectItem value='admin'>{t('roleAdmin')}</SelectItem>
                      {isSuperadmin && (
                        <SelectItem value='superadmin'>
                          {t('roleSuperadmin')}
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-end gap-2 pt-4'>
              <Button
                type='button'
                variant='outline'
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                {t('cancel')}
              </Button>
              <Button type='submit' disabled={isPending}>
                {isPending ? t('saving') : t('save')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
