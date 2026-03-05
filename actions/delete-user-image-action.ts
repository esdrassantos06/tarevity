'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase-server';
import { getTranslations } from 'next-intl/server';
import { logger } from '@/lib/logger';
import { handleError } from '@/lib/error-handler';

const BUCKET_NAME = 'avatars';

export async function RemoveUserImageAction() {
  const t = await getTranslations('ServerActions');
  const headersList = await headers();
  const session = await auth.api.getSession({
    headers: headersList,
  });

  if (!session) {
    return { error: t('unauthorized') };
  }

  const currentImageUrl = session.user.image;

  if (!currentImageUrl) {
    return { error: t('deleteUserImage.noProfileImage') };
  }

  try {
    const url = new URL(currentImageUrl);
    const pathSegments = url.pathname.split('/');
    const bucketIndex = pathSegments.indexOf(BUCKET_NAME);

    if (bucketIndex === -1) {
      return { error: t('deleteUserImage.invalidImageUrlFormat') };
    }

    const filePath = pathSegments.slice(bucketIndex + 1).join('/');
    if (!filePath) {
      return { error: t('deleteUserImage.couldNotDeterminePath') };
    }
    if (!supabase) {
      return { error: t('deleteUserImage.storageNotConfigured') };
    }

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (deleteError && deleteError.message !== 'The object was not found') {
      logger.error('Error deleting user image', deleteError, {
        userId: session.user.id,
        filePath,
      });
      return { error: t('deleteUserImage.failedToDelete') };
    }

    await auth.api.updateUser({
      headers: headersList,
      body: { image: '' },
    });

    return { success: true };
  } catch (err) {
    const error = handleError(err);
    logger.error(
      'RemoveUserImageAction error',
      err instanceof Error ? err : new Error(String(err)),
      {
        userId: session.user.id,
      },
    );
    return { error: error.error || t('internalServerError') };
  }
}
