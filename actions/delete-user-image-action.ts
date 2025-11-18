'use server';

import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { supabase } from '@/lib/supabase-server';
import { getTranslations } from 'next-intl/server';

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

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (deleteError && deleteError.message !== 'The object was not found') {
      console.error('ErrorDeletingUserImage:', deleteError);
      return { error: t('deleteUserImage.failedToDelete') };
    }

    await auth.api.updateUser({
      headers: headersList,
      body: { image: '' },
    });

    return { success: true };
  } catch (err) {
    console.error('RemoveUserImageAction error:', err);
    return { error: t('internalServerError') };
  }
}
