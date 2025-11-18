'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { APIError } from 'better-auth/api';
import { supabase } from '@/lib/supabase-server';
import { updateUserSchema } from '@/validation/updateUserSchema';
import { getTranslations } from 'next-intl/server';

const BUCKET_NAME = 'avatars';

export async function UpdateUserAction(formData: FormData) {
  const t = await getTranslations('ServerActions');
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return { error: t('unauthorized') };
  }

  const userId = session.user.id;

  const rawData = {
    name: (formData.get('name') as string) || undefined,
    image:
      formData.get('image') instanceof File &&
      (formData.get('image') as File).size > 0
        ? (formData.get('image') as File)
        : undefined,
  };

  const parsed = updateUserSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    const errMsg = firstIssue
      ? `${firstIssue.path.join('.')}: ${firstIssue.message}`
      : t('updateUser.invalidData');
    return { error: errMsg };
  }

  const { name: newName, image: newImageFile } = parsed.data;

  if (!newName && !newImageFile) {
    return { error: t('updateUser.noNewInformation') };
  }

  const updateBody: { name?: string; image?: string } = {};
  let imageUrl: string | undefined = undefined;

  try {
    if (newImageFile) {
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
      if (newImageFile.size > MAX_FILE_SIZE) {
        return { error: t('updateUser.fileSizeExceeded') };
      }

      const ALLOWED_MIME_TYPES = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
      ];
      if (!ALLOWED_MIME_TYPES.includes(newImageFile.type)) {
        return {
          error: t('updateUser.invalidFileType'),
        };
      }

      const originalName = newImageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileExtension = originalName.split('.').pop()?.toLowerCase();

      const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
      if (!fileExtension || !ALLOWED_EXTENSIONS.includes(fileExtension)) {
        return {
          error: t('updateUser.invalidFileExtension'),
        };
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const FileName = `${timestamp}-${randomString}.${fileExtension}`;

      const UserId = userId.replace(/[^a-zA-Z0-9-]/g, '');
      const filePath = `public/${UserId}/${FileName}`;

      if (filePath.includes('..') || filePath.includes('//')) {
        return { error: t('updateUser.invalidFilePath') };
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, newImageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        console.error('ErrorUploadingUserImage:', uploadError);
        return { error: t('updateUser.errorUploadingImage') };
      }

      const { data: urlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(uploadData.path);

      if (!urlData || !urlData.publicUrl) {
        return { error: t('updateUser.couldNotRetrieveUrl') };
      }

      imageUrl = urlData.publicUrl;
      updateBody.image = imageUrl;
    }
    if (newName) {
      updateBody.name = newName;
    }

    await auth.api.updateUser({
      headers: headersList,
      body: updateBody,
    });

    return { success: true, error: null, newImageUrl: imageUrl };
  } catch (err) {
    if (err instanceof APIError) {
      return { error: err.message };
    }
    console.error('UpdateUserAction error:', err);
    return { error: t('internalServerError') };
  }
}
