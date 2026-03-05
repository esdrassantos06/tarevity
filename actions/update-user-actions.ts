'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { APIError } from 'better-auth/api';
import { supabase } from '@/lib/supabase-server';
import { updateUserSchema } from '@/validation/updateUserSchema';
import { getTranslations } from 'next-intl/server';
import { logger } from '@/lib/logger';
import { handleError } from '@/lib/error-handler';

const BUCKET_NAME = 'avatars';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
      if (!supabase) {
        return {
          error:
            t('updateUser.storageNotConfigured') || 'Storage not configured',
        };
      }

      if (newImageFile.size > MAX_FILE_SIZE) {
        logger.warn('File size exceeded limit', {
          userId,
          fileSize: newImageFile.size,
          maxSize: MAX_FILE_SIZE,
        });
        return { error: t('updateUser.fileSizeExceeded') };
      }

      if (newImageFile.size === 0) {
        return { error: t('updateUser.invalidFileType') };
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

      const currentImageUrl = session.user.image;
      if (currentImageUrl && supabase) {
        try {
          const url = new URL(currentImageUrl);
          const pathSegments = url.pathname.split('/');
          const bucketIndex = pathSegments.indexOf(BUCKET_NAME);

          if (bucketIndex !== -1) {
            const filePath = pathSegments.slice(bucketIndex + 1).join('/');
            if (filePath) {
              const { error: deleteError } = await supabase.storage
                .from(BUCKET_NAME)
                .remove([filePath]);

              if (
                deleteError &&
                deleteError.message !== 'The object was not found'
              ) {
                logger.warn('Error deleting old user image', {
                  userId,
                  filePath,
                  error:
                    deleteError instanceof Error
                      ? deleteError.message
                      : String(deleteError),
                });
              }
            }
          }
        } catch (urlError) {
          logger.warn('Error parsing old image URL', {
            userId,
            currentImageUrl,
            error:
              urlError instanceof Error ? urlError.message : String(urlError),
          });
        }
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

      if (!supabase) {
        return {
          error:
            t('updateUser.storageNotConfigured') || 'Storage not configured',
        };
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, newImageFile, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        logger.error(
          'Error uploading user image',
          uploadError instanceof Error
            ? uploadError
            : new Error(String(uploadError)),
          {
            userId,
            filePath,
            fileSize: newImageFile.size,
          },
        );
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
    const error = handleError(err);
    logger.error(
      'UpdateUserAction error',
      err instanceof Error ? err : new Error(String(err)),
      {
        userId,
      },
    );
    return { error: error.error || t('internalServerError') };
  }
}
